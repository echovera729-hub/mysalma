// ════════════════════════════════════════════════════════════════
//  MySalma — data store
//  Dual mode:
//   • LOCAL  (default)  — everything saved in this browser's localStorage.
//                         Single user. Great for demos / offline.
//   • SUPABASE (when supabase-config.js is filled in) — a shared, live,
//                         multi-user network. Auth + realtime.
//
//  The rest of the app never changes between modes: every screen reads
//  through synchronous getters that hit an in-memory cache, and calls
//  mutation methods that (a) update the cache optimistically and
//  (b) persist — to localStorage, or to Supabase + realtime.
// ════════════════════════════════════════════════════════════════

const SUPA = (typeof window !== 'undefined' && window.SUPABASE_ENABLED === true && window.supabase);
const LS_KEY = 'mysalma_v2'; // local-demo-mode-only content cache (no Supabase configured)

const DEFAULT_SETTINGS = {
  quietMode: true, pulse: true, kudosPublic: true, capsuleReminders: true,
  nightShift: false, away: false, digest: false,
  notifBrightSpots: true, notifMentions: true, notifEvents: true, notifSpotlight: true,
  scheduleDays: 'Mon–Thu', scheduleStart: '07:00', scheduleEnd: '16:00',
  profileVisibility: 'hospital', // 'hospital' | 'team'
  winPhotoConsent: 'always', // 'always' | 'ask' | 'never'
};

let sb = null;
let _meId = 'me';
let _authed = !SUPA;        // local mode is always "authed"
let _inited = false;
const _listeners = new Set();

const DEFAULT_PROFILE = {
  id: 'me', name: 'You', role: 'Team member', team: 'PT', branch: 'Main',
  tagline: 'new here — say hi 👋', bio: '', avatar: null, cover: null,
  status: 'approved', is_admin: false,
  shiftStatus: 'floor', floor: null,
  theme: {}, saved: {}, calendar_cover: null, settings: {},
};

// In-memory cache — identical shape in both modes.
let _state = blankState();

function blankState() {
  return {
    profiles: [],          // [{id,name,role,team,tagline,bio,avatar,cover}]
    posts: [],             // [{id,author,body,media,featured,kudos_names,kudos_tag,capsule,created_at}]
    reactions: [],         // [{id,post_id,user_id,emoji}]
    comments: [],          // [{id,post_id,user_id,text,created_at}]
    events: [],            // [{id,host,title,d,m,day,time,location,tag,color,created_at}]
    event_rsvps: [],       // [{event_id,user_id}]
    crews: [],             // [{id,emoji,name,description,photo,created_by}]
    crew_members: [],      // [{crew_id,user_id}]
    groups: [],            // [{id,name,photo,created_by,created_at}]  -- chat group
    group_members: [],     // [{group_id,user_id}]
    follows: [],           // [{follower_id,followee_id}]
    swaps: [],             // [{id,by,need,offer,note,urgency,team,created_at}]
    swap_covers: [],       // [{swap_id,user_id}]
    moods: [],             // [{user_id,day,mood}]
    dailies: [],           // [{user_id,day,answer}]
    messages: [],          // [{id,sender,recipient,text,created_at}]  (recipient='team' = whole-hospital room)
    nominations: [],       // [{id,nominee,by,week,reason,created_at}]
  };
}

// ---------- persistence (local mode) ----------
function loadLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY));
    if (raw && raw.profiles) return { ...blankState(), ...raw };
  } catch (e) {}
  const s = blankState();
  s.profiles = [{ ...DEFAULT_PROFILE }];
  return s;
}
function persistLocal() {
  if (SUPA) return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(_state)); }
  catch (e) {
    if (String(e).match(/quota/i)) alert("Rehab.Wisal's local storage is full — try removing a post with large photos.");
  }
}
function _emit() { _listeners.forEach(fn => fn()); }
function dayKey() { return new Date().toISOString().slice(0, 10); }
function newId(prefix) { return (SUPA && crypto.randomUUID) ? crypto.randomUUID() : (prefix + Date.now() + Math.random().toString(36).slice(2, 6)); }

// ---------- person helpers ----------
function personFor(row) {
  if (!row) return null;
  const name = row.name || 'Teammate';
  const team = row.team || 'PT';
  const initials = name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  return {
    id: row.id, name, first: name.split(/\s+/)[0] || name,
    role: row.role || '', team, branch: row.branch || null,
    color: (window.TEAMS && TEAMS[team] ? TEAMS[team] : { color: '#94A0B8' }).color,
    emoji: initials, avatar: row.avatar || null,
    shiftStatus: row.shiftStatus || 'floor', floor: row.floor || null,
  };
}
function profileRow(id) { return (_state.profiles || []).find(p => p.id === id); }

// ════════════════════════════════════════════════════════════════
//  React hook — re-render any component on store change
// ════════════════════════════════════════════════════════════════
function useStore() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const l = () => force(x => x + 1);
    _listeners.add(l);
    return () => _listeners.delete(l);
  }, []);
  return _state;
}

// Downscale an uploaded image to a JPEG dataURL (keeps storage small).
function readScaledImage(file, max = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('not an image')); return; }
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = fr.result;
    };
    fr.onerror = reject; fr.readAsDataURL(file);
  });
}

// ════════════════════════════════════════════════════════════════
//  Supabase plumbing
// ════════════════════════════════════════════════════════════════
const TABLES = ['profiles','posts','reactions','comments','events','event_rsvps','crews','crew_members','groups','group_members','follows','swaps','swap_covers','moods','dailies','messages','nominations'];

async function loadAll() {
  const results = await Promise.all(TABLES.map(t => sb.from(t).select('*')));
  TABLES.forEach((t, i) => { _state[t] = results[i].data || []; });
}
let _reloadTimer = null;
function scheduleReload() {
  clearTimeout(_reloadTimer);
  _reloadTimer = setTimeout(async () => { await loadAll(); _emit(); }, 250);
}
function subscribeRealtime() {
  sb.channel('mysalma-all')
    .on('postgres_changes', { event: '*', schema: 'public' }, scheduleReload)
    .subscribe();
}
// optimistic cache helpers
function cacheInsert(table, row) { _state[table] = [...(_state[table] || []), row]; }
function cacheRemove(table, pred) { _state[table] = (_state[table] || []).filter(r => !pred(r)); }

// Run a mutation: optimistic cache change + emit, then persist to the backend.
function mutate(localChange, remote) {
  localChange();
  _emit();
  if (SUPA && remote) {
    Promise.resolve(remote()).catch(err => {
      console.error('[Rehab.Wisal] sync error', err);
      _lastSyncError = (err && err.message) || 'Could not save your change — please try again.';
      _emit();
      scheduleReload();
    });
  }
  else persistLocal();
}

// ════════════════════════════════════════════════════════════════
//  Store API — synchronous getters, dual-mode mutations
// ════════════════════════════════════════════════════════════════
let _lastSyncError = null;

const Store = {
  get mode() { return SUPA ? 'supabase' : 'local'; },
  isReady() { return _inited; },
  isAuthed() { return _authed; },
  meId() { return _meId; },

  async init() {
    if (SUPA) {
      sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      const { data: { session } } = await sb.auth.getSession();
      sb.auth.onAuthStateChange(async (_e, sess) => {
        _authed = !!sess; _meId = sess ? sess.user.id : 'me';
        if (sess) { await loadAll(); }
        _emit();
      });
      if (session) { _meId = session.user.id; _authed = true; await loadAll(); subscribeRealtime(); }
      else { _authed = false; }
    } else {
      _state = loadLocal(); _meId = 'me'; _authed = true;
    }
    _inited = true; _emit();
  },

  // ---------- auth (supabase mode) ----------
  async signIn(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadAll(); subscribeRealtime(); _emit();
  },
  async signUp(email, password, { name, role, team, branch }) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (data.session && data.user) {
      _meId = data.user.id; _authed = true;
      await sb.from('profiles').upsert({ id: data.user.id, name, role, team, branch });
      await loadAll(); subscribeRealtime(); _emit();
      return { needsConfirm: false };
    }
    return { needsConfirm: !data.session }; // email confirmation on
  },
  async signOut() { if (sb) await sb.auth.signOut(); _authed = false; _meId = 'me'; _state = blankState(); _emit(); },

  // ---------- identity ----------
  personById(id) {
    const realId = (id === 'me' || id === 'sara') ? _meId : id;
    const row = profileRow(realId);
    if (row) return personFor(row);
    if (realId === _meId) return personFor({ ...DEFAULT_PROFILE, id: _meId });
    return null;
  },
  profile() { return profileRow(_meId) || { ...DEFAULT_PROFILE, id: _meId }; },
  setProfile(patch) {
    mutate(
      () => {
        const arr = _state.profiles || [];
        const i = arr.findIndex(p => p.id === _meId);
        if (i >= 0) arr[i] = { ...arr[i], ...patch };
        else arr.push({ ...DEFAULT_PROFILE, id: _meId, ...patch });
        _state.profiles = [...arr];
      },
      () => sb.from('profiles').upsert({ id: _meId, ...patch }),
    );
  },

  // ---------- posts ----------
  allPosts() {
    return (_state.posts || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  myPosts() { return this.allPosts().filter(p => p.author === _meId); },
  crewPosts(crewId) { return this.allPosts().filter(p => p.crew_id === crewId); },
  // Feed-visible posts: honors each person's "Public Bright Spots" setting and
  // the viewer's own "Bright Spot notifications" mute — both are account-level.
  feedPosts() {
    const myBright = this.settings().notifBrightSpots;
    return this.allPosts().filter(p => {
      if (p.featured !== 'kudos') return true;
      if (p.author === _meId) return true;
      if (!myBright) return false; // you've muted Bright Spot posts in Settings
      const names = p.kudos_names || p.kudosNames || [];
      if (!names.length) return true;
      const blocked = names.some(n => {
        const person = (_state.profiles || []).find(pr => pr.name && pr.name.toLowerCase() === String(n).toLowerCase());
        return person && person.settings && person.settings.kudosPublic === false;
      });
      return !blocked;
    });
  },
  addPost(post) {
    const id = newId('u');
    const row = {
      id, author: _meId, body: post.body || '', media: post.media || [],
      featured: post.featured || null, kudos_names: post.kudosNames || [],
      kudos_tag: post.kudosTag || null, capsule: post.capsule || null,
      crew_id: post.crewId || null,
      poll: post.poll || null, place: post.place || null, mood_tag: post.moodTag || null,
      video_url: post.videoUrl || null,
      created_at: new Date().toISOString(),
    };
    mutate(() => cacheInsert('posts', row), () => sb.from('posts').insert(row));
    return id;
  },
  deletePost(id) {
    mutate(() => cacheRemove('posts', p => p.id === id), () => sb.from('posts').delete().eq('id', id));
  },

  // ---------- polls (embedded on a post) ----------
  pollVotesFor(postId, optIdx) {
    const post = (_state.posts || []).find(p => p.id === postId);
    if (!post || !post.poll) return 0;
    return (post.poll.options[optIdx]?.votes || []).length;
  },
  myPollVote(postId) {
    const post = (_state.posts || []).find(p => p.id === postId);
    if (!post || !post.poll) return null;
    const i = post.poll.options.findIndex(o => (o.votes || []).includes(_meId));
    return i >= 0 ? i : null;
  },
  votePoll(postId, optIdx) {
    mutate(() => {
      const arr = _state.posts || [];
      const i = arr.findIndex(p => p.id === postId);
      if (i < 0 || !arr[i].poll) return;
      const poll = { ...arr[i].poll, options: arr[i].poll.options.map(o => ({ ...o, votes: (o.votes || []).filter(v => v !== _meId) })) };
      poll.options[optIdx].votes = [...poll.options[optIdx].votes, _meId];
      arr[i] = { ...arr[i], poll };
      _state.posts = [...arr];
    }, () => sb.from('posts').update({ poll: (this.allPosts().find(p=>p.id===postId)||{}).poll }).eq('id', postId));
  },

  // ---------- reactions ----------
  countsFor(postId) {
    const m = {};
    (_state.reactions || []).filter(r => r.post_id === postId).forEach(r => { m[r.emoji] = (m[r.emoji] || 0) + 1; });
    return m;
  },
  reactsFor(postId) {
    return (_state.reactions || []).filter(r => r.post_id === postId && r.user_id === _meId).map(r => r.emoji);
  },
  toggleReaction(postId, emoji) {
    const has = this.reactsFor(postId).includes(emoji);
    if (has) {
      mutate(() => cacheRemove('reactions', r => r.post_id === postId && r.user_id === _meId && r.emoji === emoji),
        () => sb.from('reactions').delete().match({ post_id: postId, user_id: _meId, emoji }));
    } else {
      const row = { id: newId('rx'), post_id: postId, user_id: _meId, emoji };
      mutate(() => cacheInsert('reactions', row), () => sb.from('reactions').insert(row));
    }
  },

  // ---------- comments ----------
  commentsFor(postId) {
    return (_state.comments || []).filter(c => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },
  addComment(postId, text) {
    const row = { id: newId('cm'), post_id: postId, user_id: _meId, text, created_at: new Date().toISOString() };
    mutate(() => cacheInsert('comments', row), () => sb.from('comments').insert(row));
  },

  // ---------- saved (account-level — synced via profile) ----------
  isSaved(id) { return !!(this.profile().saved || {})[id]; },
  toggleSave(id) {
    const saved = { ...(this.profile().saved || {}) };
    if (saved[id]) delete saved[id]; else saved[id] = true;
    this.setProfile({ saved });
  },

  // ---------- appearance theme (account-level — synced via profile) ----------
  theme() { return this.profile().theme || {}; },
  setTheme(patch) { this.setProfile({ theme: { ...(this.profile().theme || {}), ...patch } }); },
  resetTheme() { this.setProfile({ theme: {} }); },

  // ---------- mood + daily ----------
  moodToday() { const r = (_state.moods || []).find(m => m.user_id === _meId && m.day === dayKey()); return r ? r.mood : null; },
  setMood(mood) {
    const day = dayKey();
    mutate(
      () => { cacheRemove('moods', m => m.user_id === _meId && m.day === day); if (mood) cacheInsert('moods', { user_id: _meId, day, mood }); },
      () => mood ? sb.from('moods').upsert({ user_id: _meId, day, mood }) : sb.from('moods').delete().match({ user_id: _meId, day }),
    );
  },
  dailyToday() { const r = (_state.dailies || []).find(d => d.user_id === _meId && d.day === dayKey()); return r ? r.answer : null; },
  setDaily(answer) {
    const day = dayKey();
    mutate(
      () => { cacheRemove('dailies', d => d.user_id === _meId && d.day === day); if (answer) cacheInsert('dailies', { user_id: _meId, day, answer }); },
      () => answer ? sb.from('dailies').upsert({ user_id: _meId, day, answer }) : sb.from('dailies').delete().match({ user_id: _meId, day }),
    );
  },

  // Tally of your own logged moods over the last N days (real data, no invented stats).
  myMoodTally(days = 7) {
    const cutoff = Date.now() - days * 86400000;
    const mine = (_state.moods || []).filter(m => m.user_id === _meId && new Date(m.day).getTime() >= cutoff - 86400000);
    const tally = {};
    mine.forEach(m => { tally[m.mood] = (tally[m.mood] || 0) + 1; });
    return Object.entries(tally).map(([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count);
  },

  // ---------- events ----------
  events() { return (_state.events || []).slice(); },
  crewEvents(crewId) { return this.events().filter(e => e.crew_id === crewId); },
  addEvent(ev) {
    const id = newId('ev');
    const row = { id, host: _meId, title: ev.title, d: ev.d || null, m: ev.m || null, day: ev.day || null, time: ev.time || null, location: ev.where || ev.location || null, tag: ev.tag || null, color: ev.color || null, description: ev.description || '', image: ev.image || null, crew_id: ev.crewId || null, created_at: new Date().toISOString() };
    mutate(() => { cacheInsert('events', row); cacheInsert('event_rsvps', { event_id: id, user_id: _meId }); },
      async () => { await sb.from('events').insert(row); await sb.from('event_rsvps').insert({ event_id: id, user_id: _meId }); });
    return id;
  },
  deleteEvent(id) {
    const ev = (_state.events || []).find(e => e.id === id);
    if (ev && ev.host !== _meId && !this.isAdmin()) return;
    mutate(() => { cacheRemove('events', e => e.id === id); cacheRemove('event_rsvps', r => r.event_id === id); },
      () => sb.from('events').delete().eq('id', id));
  },
  isGoing(eventId) { return (_state.event_rsvps || []).some(r => r.event_id === eventId && r.user_id === _meId); },
  goingCount(eventId) { return (_state.event_rsvps || []).filter(r => r.event_id === eventId).length; },
  toggleGoing(eventId) {
    const going = this.isGoing(eventId);
    if (going) mutate(() => cacheRemove('event_rsvps', r => r.event_id === eventId && r.user_id === _meId), () => sb.from('event_rsvps').delete().match({ event_id: eventId, user_id: _meId }));
    else { const row = { event_id: eventId, user_id: _meId }; mutate(() => cacheInsert('event_rsvps', row), () => sb.from('event_rsvps').insert(row)); }
  },

  // ---------- crews ----------
  allCrews() { return (_state.crews || []).slice(); },
  crewById(id) { return this.allCrews().find(c => c.id === id) || null; },
  crews() { const ids = (_state.crew_members || []).filter(m => m.user_id === _meId).map(m => m.crew_id); return this.allCrews().filter(c => ids.includes(c.id)); },
  discoverCrews() { const ids = (_state.crew_members || []).filter(m => m.user_id === _meId).map(m => m.crew_id); return this.allCrews().filter(c => !ids.includes(c.id)); },
  hasCrew(name) { return this.crews().some(c => c.name.toLowerCase() === name.toLowerCase()); },
  crewMemberCount(id) { return (_state.crew_members || []).filter(m => m.crew_id === id).length; },
  crewMembers(id) {
    return (_state.crew_members || []).filter(m => m.crew_id === id)
      .map(m => this.personById(m.user_id)).filter(Boolean);
  },
  isCrewOwner(id) { const c = this.crewById(id); return !!c && c.created_by === _meId; },
  addCrew(crew) {
    const existing = this.allCrews().find(c => c.name.toLowerCase() === crew.name.toLowerCase());
    if (existing) { this.joinCrew(existing.id); return existing.id; }
    const id = newId('cr');
    const row = { id, emoji: crew.emoji || '🌟', name: crew.name, description: crew.description || '', photo: crew.photo || null, created_by: _meId, created_at: new Date().toISOString() };
    mutate(() => { cacheInsert('crews', row); cacheInsert('crew_members', { crew_id: id, user_id: _meId }); },
      async () => { await sb.from('crews').insert(row); await sb.from('crew_members').insert({ crew_id: id, user_id: _meId }); });
    return id;
  },
  updateCrew(id, patch) {
    if (!this.isCrewOwner(id)) return;
    mutate(
      () => { const arr = _state.crews || []; const i = arr.findIndex(c => c.id === id); if (i >= 0) { arr[i] = { ...arr[i], ...patch }; _state.crews = [...arr]; } },
      () => sb.from('crews').update(patch).eq('id', id),
    );
  },
  joinCrew(id) {
    if ((_state.crew_members || []).some(m => m.crew_id === id && m.user_id === _meId)) return;
    const row = { crew_id: id, user_id: _meId };
    mutate(() => cacheInsert('crew_members', row), () => sb.from('crew_members').insert(row));
  },
  leaveCrew(id) {
    mutate(() => cacheRemove('crew_members', m => m.crew_id === id && m.user_id === _meId), () => sb.from('crew_members').delete().match({ crew_id: id, user_id: _meId }));
  },
  removeCrewMember(crewId, userId) {
    if (!this.isCrewOwner(crewId) || userId === _meId) return;
    mutate(() => cacheRemove('crew_members', m => m.crew_id === crewId && m.user_id === userId), () => sb.from('crew_members').delete().match({ crew_id: crewId, user_id: userId }));
  },
  deleteCrew(id) {
    if (!this.isCrewOwner(id)) return;
    mutate(
      () => { cacheRemove('crews', c => c.id === id); cacheRemove('crew_members', m => m.crew_id === id); },
      () => sb.from('crews').delete().eq('id', id),
    );
  },

  // ---------- shift swaps ----------
  swaps() { return (_state.swaps || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },
  addSwap(swap) {
    const id = newId('sw');
    const row = { id, by: _meId, need: swap.need, offer: swap.offer || '', note: swap.note || '', urgency: swap.urgency || 'med', team: swap.team || 'PT', created_at: new Date().toISOString() };
    mutate(() => cacheInsert('swaps', row), () => sb.from('swaps').insert(row));
    return id;
  },
  deleteSwap(id) { mutate(() => { cacheRemove('swaps', s => s.id === id); cacheRemove('swap_covers', c => c.swap_id === id); }, () => sb.from('swaps').delete().eq('id', id)); },
  isCovered(swapId) { return (_state.swap_covers || []).some(c => c.swap_id === swapId && c.user_id === _meId); },
  coverCount(swapId) { return (_state.swap_covers || []).filter(c => c.swap_id === swapId).length; },
  toggleCovered(swapId) {
    const covered = this.isCovered(swapId);
    if (covered) mutate(() => cacheRemove('swap_covers', c => c.swap_id === swapId && c.user_id === _meId), () => sb.from('swap_covers').delete().match({ swap_id: swapId, user_id: _meId }));
    else { const row = { swap_id: swapId, user_id: _meId }; mutate(() => cacheInsert('swap_covers', row), () => sb.from('swap_covers').insert(row)); }
  },

  // ---------- chat groups ----------
  allGroups() { return (_state.groups || []).slice(); },
  myGroups() {
    const ids = (_state.group_members || []).filter(m => m.user_id === _meId).map(m => m.group_id);
    return this.allGroups().filter(g => ids.includes(g.id));
  },
  groupById(id) { return this.allGroups().find(g => g.id === id) || null; },
  groupMembers(id) {
    return (_state.group_members || []).filter(m => m.group_id === id)
      .map(m => this.personById(m.user_id)).filter(Boolean);
  },
  isGroupOwner(id) { const g = this.groupById(id); return !!g && g.created_by === _meId; },
  createGroup(name, memberIds = []) {
    if (!name || !name.trim()) return null;
    const id = newId('grp');
    const row = { id, name: name.trim(), photo: null, created_by: _meId, created_at: new Date().toISOString() };
    const members = Array.from(new Set([_meId, ...memberIds])).map(uid => ({ group_id: id, user_id: uid }));
    mutate(
      () => { cacheInsert('groups', row); members.forEach(m => cacheInsert('group_members', m)); },
      async () => { await sb.from('groups').insert(row); await sb.from('group_members').insert(members); },
    );
    return id;
  },
  renameGroup(id, name) {
    if (!name || !name.trim()) return;
    mutate(
      () => { const arr = _state.groups || []; const i = arr.findIndex(g => g.id === id); if (i >= 0) { arr[i] = { ...arr[i], name: name.trim() }; _state.groups = [...arr]; } },
      () => sb.from('groups').update({ name: name.trim() }).eq('id', id),
    );
  },
  setGroupPhoto(id, photo) {
    mutate(
      () => { const arr = _state.groups || []; const i = arr.findIndex(g => g.id === id); if (i >= 0) { arr[i] = { ...arr[i], photo }; _state.groups = [...arr]; } },
      () => sb.from('groups').update({ photo }).eq('id', id),
    );
  },
  addGroupMember(id, userId) {
    if ((_state.group_members || []).some(m => m.group_id === id && m.user_id === userId)) return;
    const row = { group_id: id, user_id: userId };
    mutate(() => cacheInsert('group_members', row), () => sb.from('group_members').insert(row));
  },
  removeGroupMember(id, userId) {
    mutate(() => cacheRemove('group_members', m => m.group_id === id && m.user_id === userId), () => sb.from('group_members').delete().match({ group_id: id, user_id: userId }));
  },
  leaveGroup(id) { this.removeGroupMember(id, _meId); },
  deleteGroup(id) {
    if (!this.isGroupOwner(id)) return;
    mutate(
      () => { cacheRemove('groups', g => g.id === id); cacheRemove('group_members', m => m.group_id === id); },
      () => sb.from('groups').delete().eq('id', id),
    );
  },

  // ---------- following ----------
  followingIds() { return (_state.follows || []).filter(f => f.follower_id === _meId).map(f => f.followee_id); },
  isFollowing(id) { return this.followingIds().includes(id); },
  followerCount(id) { return (_state.follows || []).filter(f => f.followee_id === id).length; },
  toggleFollow(id) {
    if (id === _meId) return;
    if (this.isFollowing(id)) {
      mutate(() => cacheRemove('follows', f => f.follower_id === _meId && f.followee_id === id), () => sb.from('follows').delete().match({ follower_id: _meId, followee_id: id }));
    } else {
      const row = { follower_id: _meId, followee_id: id };
      mutate(() => cacheInsert('follows', row), () => sb.from('follows').insert(row));
    }
  },

  // ---------- account settings (Shift & quiet hours, Notifications, Privacy) ----------
  settings() { return { ...DEFAULT_SETTINGS, ...(this.profile().settings || {}) }; },
  setSetting(patch) { this.setProfile({ settings: { ...this.settings(), ...patch } }); },
  _scheduleMinutes(t) { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); },
  isWithinSchedule() {
    const s = this.settings();
    const cur = new Date(); const now = cur.getHours() * 60 + cur.getMinutes();
    const start = this._scheduleMinutes(s.scheduleStart), end = this._scheduleMinutes(s.scheduleEnd);
    return start <= end ? (now >= start && now <= end) : (now >= start || now <= end);
  },
  isQuietNow() { const s = this.settings(); return !!s.quietMode && !s.away && this.isWithinSchedule(); },
  isNightShiftActive() {
    const s = this.settings();
    if (!s.nightShift) return false;
    const h = new Date().getHours();
    return h >= 20 || h < 6;
  },

  // ---------- teammates (approved members only) ----------
  teammates() {
    const myTeam = this.profile().team;
    return (_state.profiles || [])
      .filter(p => p.id !== _meId && (p.status === 'approved' || p.status == null))
      .filter(p => {
        const vis = (p.settings && p.settings.profileVisibility) || 'hospital';
        return vis === 'hospital' || p.team === myTeam;
      })
      .map(personFor);
  },

  // ---------- membership & approvals ----------
  // In local (single-user) mode the one user is always an approved admin so
  // nothing is gated and the admin screen can be previewed.
  isAdmin() { return SUPA ? !!this.profile().is_admin : true; },
  myStatus() { return SUPA ? (this.profile().status || 'pending') : 'approved'; },
  membersByStatus(status) {
    return (_state.profiles || [])
      .filter(p => (p.status || 'pending') === status)
      .map(p => ({ ...personFor(p), status: p.status || 'pending', isAdmin: !!p.is_admin, created_at: p.created_at, branch: p.branch || 'Main' }))
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  },
  pendingCount() { return (_state.profiles || []).filter(p => (p.status || 'pending') === 'pending').length; },
  setMemberStatus(id, status) {
    if (id === _meId) return; // can't change your own status from the UI
    mutate(
      () => {
        const arr = _state.profiles || [];
        const i = arr.findIndex(p => p.id === id);
        if (i >= 0) { arr[i] = { ...arr[i], status }; _state.profiles = [...arr]; }
      },
      () => sb.from('profiles').update({ status }).eq('id', id),
    );
  },
  approveUser(id) { this.setMemberStatus(id, 'approved'); },
  rejectUser(id)  { this.setMemberStatus(id, 'rejected'); },

  // Branch is locked after signup for regular staff — only an admin can
  // reassign someone to a different hospital location.
  setMemberBranch(id, branch) {
    if (!this.isAdmin()) return;
    mutate(
      () => {
        const arr = _state.profiles || [];
        const i = arr.findIndex(p => p.id === id);
        if (i >= 0) { arr[i] = { ...arr[i], branch }; _state.profiles = [...arr]; }
      },
      () => sb.from('profiles').update({ branch }).eq('id', id),
    );
  },

  // ---------- chat / messages ----------
  // A conversation id is 'team' (whole-hospital room), a group id, a crew id
  // (crew chat), or another user's id (1:1 DM). Rooms/groups/crews show every
  // member's messages; DMs store recipient=theirId and sender=me.
  _isRoomConv(id) {
    if (id === 'team') return true;
    if ((_state.groups || []).some(g => g.id === id)) return true;
    if ((_state.crews || []).some(c => c.id === id)) return true;
    return false;
  },
  conversations() {
    // Build a list of people you can chat with: the Team room, your groups + every approved teammate.
    const mates = this.teammates();
    const list = [{ id: 'team', name: '🏥 Whole Hospital', team: null, isRoom: true }];
    this.myGroups().forEach(g => list.push({ id: g.id, name: g.name, isRoom: true, isGroup: true, photo: g.photo, memberCount: this.groupMembers(g.id).length }));
    mates.forEach(m => list.push({ ...m, isRoom: false }));
    // annotate each with last message + unread-ish preview
    return list.map(c => {
      const msgs = this.messagesWith(c.id);
      const last = msgs[msgs.length - 1];
      return { ...c, last: last ? last.text : null, lastAt: last ? last.created_at : null };
    }).sort((a, b) => {
      if (a.id === 'team') return -1; if (b.id === 'team') return 1;
      return new Date(b.lastAt || 0) - new Date(a.lastAt || 0);
    });
  },
  messagesWith(convId) {
    const all = _state.messages || [];
    let msgs;
    if (this._isRoomConv(convId)) {
      msgs = all.filter(m => m.recipient === convId);
    } else {
      msgs = all.filter(m =>
        (m.sender === _meId && m.recipient === convId) ||
        (m.sender === convId && m.recipient === _meId));
    }
    return msgs.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },
  sendMessage(convId, text) {
    if (!text || !text.trim()) return;
    const row = { id: newId('msg'), sender: _meId, recipient: convId, text: text.trim(), created_at: new Date().toISOString() };
    mutate(() => cacheInsert('messages', row), () => sb.from('messages').insert(row));
  },

  // ---------- spotlight nominations ----------
  weekKey() {
    // ISO-ish week bucket: year + week number, so nominations reset weekly.
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + week;
  },
  nominationsThisWeek() {
    const wk = this.weekKey();
    return (_state.nominations || []).filter(n => n.week === wk);
  },
  myNominationThisWeek() {
    const wk = this.weekKey();
    return (_state.nominations || []).find(n => n.week === wk && n.by === _meId) || null;
  },
  // Returns the current spotlight: the person with the most nominations this week.
  spotlight() {
    const noms = this.nominationsThisWeek();
    if (!noms.length) return null;
    const tally = {};
    noms.forEach(n => { tally[n.nominee] = (tally[n.nominee] || 0) + 1; });
    let topId = null, topN = 0;
    Object.entries(tally).forEach(([id, n]) => { if (n > topN) { topN = n; topId = id; } });
    if (!topId) return null;
    const reason = (noms.find(n => n.nominee === topId && n.reason) || {}).reason || '';
    return { person: this.personById(topId), count: topN, reason };
  },
  nominate(nomineeId, reason) {
    const wk = this.weekKey();
    const existing = this.myNominationThisWeek();
    if (existing) {
      // change your vote
      mutate(
        () => { const arr = _state.nominations; const i = arr.findIndex(n => n.id === existing.id); if (i >= 0) { arr[i] = { ...arr[i], nominee: nomineeId, reason: reason || arr[i].reason }; _state.nominations = [...arr]; } },
        () => sb.from('nominations').update({ nominee: nomineeId, reason: reason || null }).eq('id', existing.id),
      );
      return;
    }
    const row = { id: newId('nom'), nominee: nomineeId, by: _meId, week: wk, reason: reason || null, created_at: new Date().toISOString() };
    mutate(() => cacheInsert('nominations', row), () => sb.from('nominations').insert(row));
  },

  // ---------- calendar cover (account-level — synced via profile) ----------
  calendarCover() { return this.profile().calendar_cover || null; },
  setCalendarCover(dataUrl) { this.setProfile({ calendar_cover: dataUrl }); },
  clearCalendarCover() { this.setProfile({ calendar_cover: null }); },

  // ---------- sync error banner (surfaces silent save failures, e.g. schema drift) ----------
  syncError() { return _lastSyncError; },
  clearSyncError() { _lastSyncError = null; _emit(); },

  // ---------- notifications (derived from real activity, no fake entries) ----------
  notifications() {
    const items = [];
    const myFirst = (this.profile().name || '').split(/\s+/)[0];
    const myPostIds = new Set(this.myPosts().map(p => p.id));
    (_state.comments || []).forEach(c => {
      if (myPostIds.has(c.post_id) && c.user_id !== _meId) {
        const person = FIND(c.user_id);
        items.push({ id: 'cm-' + c.id, kind: 'comment', at: c.created_at, person, text: `${person ? person.first : 'Someone'} replied to your post: "${(c.text || '').slice(0, 60)}"` });
      }
    });
    (_state.reactions || []).forEach(r => {
      if (myPostIds.has(r.post_id) && r.user_id !== _meId) {
        const person = FIND(r.user_id);
        items.push({ id: 'rx-' + (r.id || r.post_id + r.user_id + r.emoji), kind: 'reaction', at: r.created_at || (this.allPosts().find(p=>p.id===r.post_id)||{}).created_at, person, text: `${person ? person.first : 'Someone'} reacted ${r.emoji} to your post` });
      }
    });
    this.allPosts().forEach(p => {
      if (p.author === _meId) return;
      const names = p.kudos_names || p.kudosNames || [];
      if (names.some(n => String(n).toLowerCase() === (this.profile().name || '').toLowerCase() || String(n).toLowerCase() === (myFirst||'').toLowerCase())) {
        const person = FIND(p.author);
        items.push({ id: 'kd-' + p.id, kind: 'kudos', at: p.created_at, person, text: `${person ? person.first : 'Someone'} sent you a Bright Spot ✦` });
      }
      if (myFirst && p.body && new RegExp('@' + myFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(p.body)) {
        const person = FIND(p.author);
        items.push({ id: 'mn-' + p.id, kind: 'mention', at: p.created_at, person, text: `${person ? person.first : 'Someone'} mentioned you in a post` });
      }
    });
    const myNom = this.myNominationThisWeek();
    this.nominationsThisWeek().forEach(n => {
      if (n.nominee === _meId && n.by !== _meId) {
        const person = FIND(n.by);
        items.push({ id: 'nm-' + n.id, kind: 'nomination', at: n.created_at, person, text: `${person ? person.first : 'Someone'} nominated you for this week's Spotlight` });
      }
    });
    return items.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  },

  // ---------- search (real matches across posts + events, no placeholder results) ----------
  searchPosts(q) {
    const query = (q || '').trim().toLowerCase();
    if (!query) return [];
    return this.allPosts().filter(p => (p.body || '').toLowerCase().includes(query));
  },
  searchEvents(q) {
    const query = (q || '').trim().toLowerCase();
    if (!query) return [];
    return this.events().filter(e => (e.title || '').toLowerCase().includes(query));
  },

  // ---------- danger zone ----------
  reset() {
    if (SUPA) {
      if (confirm('Sign out of Rehab.Wisal on this device?')) this.signOut();
      return;
    }
    if (confirm('Reset Rehab.Wisal? This clears all your posts, reactions, photos and profile changes on this device.')) {
      localStorage.removeItem(LS_KEY); location.reload();
    }
  },
};

Object.assign(window, { Store, useStore, readScaledImage, dayKey });
