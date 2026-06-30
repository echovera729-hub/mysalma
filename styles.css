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
const LS_KEY = 'mysalma_v2';
const PREF_KEY = 'mysalma_prefs'; // device-local prefs (saved posts), both modes

let sb = null;
let _meId = 'me';
let _authed = !SUPA;        // local mode is always "authed"
let _inited = false;
const _listeners = new Set();

const DEFAULT_PROFILE = {
  id: 'me', name: 'You', role: 'Team member', team: 'PT',
  tagline: 'new here — say hi 👋', bio: '', avatar: null, cover: null,
  status: 'approved', is_admin: false,
};

// In-memory cache — identical shape in both modes.
let _state = blankState();
let _prefs = loadPrefs();

function blankState() {
  return {
    profiles: [],          // [{id,name,role,team,tagline,bio,avatar,cover}]
    posts: [],             // [{id,author,body,media,featured,kudos_names,kudos_tag,capsule,created_at}]
    reactions: [],         // [{id,post_id,user_id,emoji}]
    comments: [],          // [{id,post_id,user_id,text,created_at}]
    events: [],            // [{id,host,title,d,m,day,time,location,tag,color,created_at}]
    event_rsvps: [],       // [{event_id,user_id}]
    crews: [],             // [{id,emoji,name,created_by}]
    crew_members: [],      // [{crew_id,user_id}]
    swaps: [],             // [{id,by,need,offer,note,urgency,team,created_at}]
    swap_covers: [],       // [{swap_id,user_id}]
    moods: [],             // [{user_id,day,mood}]
    dailies: [],           // [{user_id,day,answer}]
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
    if (String(e).match(/quota/i)) alert("MySalma's local storage is full — try removing a post with large photos.");
  }
}
function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || { saved: {} }; } catch (e) { return { saved: {} }; } }
function persistPrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(_prefs)); } catch (e) {} }

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
    role: row.role || '', team,
    color: (window.TEAMS && TEAMS[team] ? TEAMS[team] : { color: '#94A0B8' }).color,
    emoji: initials, avatar: row.avatar || null,
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
const TABLES = ['profiles','posts','reactions','comments','events','event_rsvps','crews','crew_members','swaps','swap_covers','moods','dailies'];

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
  if (SUPA && remote) { Promise.resolve(remote()).catch(err => { console.error('[MySalma] sync error', err); scheduleReload(); }); }
  else persistLocal();
}

// ════════════════════════════════════════════════════════════════
//  Store API — synchronous getters, dual-mode mutations
// ════════════════════════════════════════════════════════════════
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
  async signUp(email, password, { name, role, team }) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (data.session && data.user) {
      _meId = data.user.id; _authed = true;
      await sb.from('profiles').upsert({ id: data.user.id, name, role, team });
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
  addPost(post) {
    const id = newId('u');
    const row = {
      id, author: _meId, body: post.body || '', media: post.media || [],
      featured: post.featured || null, kudos_names: post.kudosNames || [],
      kudos_tag: post.kudosTag || null, capsule: post.capsule || null,
      created_at: new Date().toISOString(),
    };
    mutate(() => cacheInsert('posts', row), () => sb.from('posts').insert(row));
    return id;
  },
  deletePost(id) {
    mutate(() => cacheRemove('posts', p => p.id === id), () => sb.from('posts').delete().eq('id', id));
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

  // ---------- saved (device-local in both modes) ----------
  isSaved(id) { return !!(_prefs.saved || {})[id]; },
  toggleSave(id) { _prefs.saved = { ...(_prefs.saved || {}), [id]: !(_prefs.saved || {})[id] }; persistPrefs(); _emit(); },

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

  // ---------- events ----------
  events() { return (_state.events || []).slice(); },
  addEvent(ev) {
    const id = newId('ev');
    const row = { id, host: _meId, title: ev.title, d: ev.d || null, m: ev.m || null, day: ev.day || null, time: ev.time || null, location: ev.where || ev.location || null, tag: ev.tag || null, color: ev.color || null, created_at: new Date().toISOString() };
    mutate(() => { cacheInsert('events', row); cacheInsert('event_rsvps', { event_id: id, user_id: _meId }); },
      async () => { await sb.from('events').insert(row); await sb.from('event_rsvps').insert({ event_id: id, user_id: _meId }); });
    return id;
  },
  deleteEvent(id) {
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
  crews() { const ids = (_state.crew_members || []).filter(m => m.user_id === _meId).map(m => m.crew_id); return this.allCrews().filter(c => ids.includes(c.id)); },
  discoverCrews() { const ids = (_state.crew_members || []).filter(m => m.user_id === _meId).map(m => m.crew_id); return this.allCrews().filter(c => !ids.includes(c.id)); },
  hasCrew(name) { return this.crews().some(c => c.name.toLowerCase() === name.toLowerCase()); },
  crewMemberCount(id) { return (_state.crew_members || []).filter(m => m.crew_id === id).length; },
  addCrew(crew) {
    const existing = this.allCrews().find(c => c.name.toLowerCase() === crew.name.toLowerCase());
    if (existing) { this.joinCrew(existing.id); return; }
    const id = newId('cr');
    const row = { id, emoji: crew.emoji || '🌟', name: crew.name, created_by: _meId };
    mutate(() => { cacheInsert('crews', row); cacheInsert('crew_members', { crew_id: id, user_id: _meId }); },
      async () => { await sb.from('crews').insert(row); await sb.from('crew_members').insert({ crew_id: id, user_id: _meId }); });
  },
  joinCrew(id) {
    if ((_state.crew_members || []).some(m => m.crew_id === id && m.user_id === _meId)) return;
    const row = { crew_id: id, user_id: _meId };
    mutate(() => cacheInsert('crew_members', row), () => sb.from('crew_members').insert(row));
  },
  leaveCrew(id) {
    mutate(() => cacheRemove('crew_members', m => m.crew_id === id && m.user_id === _meId), () => sb.from('crew_members').delete().match({ crew_id: id, user_id: _meId }));
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

  // ---------- teammates (approved members only) ----------
  teammates() {
    return (_state.profiles || [])
      .filter(p => p.id !== _meId && (p.status === 'approved' || p.status == null))
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
      .map(p => ({ ...personFor(p), status: p.status || 'pending', isAdmin: !!p.is_admin, created_at: p.created_at }))
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

  // ---------- danger zone ----------
  reset() {
    if (SUPA) {
      if (confirm('Sign out of MySalma on this device?')) this.signOut();
      return;
    }
    if (confirm('Reset MySalma? This clears all your posts, reactions, photos and profile changes on this device.')) {
      localStorage.removeItem(LS_KEY); localStorage.removeItem(PREF_KEY); location.reload();
    }
  },
};

Object.assign(window, { Store, useStore, readScaledImage, dayKey });
