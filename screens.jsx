// MySalma — auxiliary rail widgets + remaining screens

const { useState: useState2 } = React;

// ============================================================
//  AUX rail widgets
// ============================================================
const NominateModal = ({ onClose }) => {
  useStore();
  const mates = Store.teammates();
  const mine = Store.myNominationThisWeek();
  const [pick, setPick] = useState2(mine ? mine.nominee : null);
  const [reason, setReason] = useState2(mine ? (mine.reason || '') : '');
  const submit = () => { if (pick) { Store.nominate(pick, reason.trim()); onClose(); } };
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div style={{width:'min(460px,100%)', maxHeight:'88vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:26, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <h2 style={{fontSize:21}}>✦ Nominate for Spotlight</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <p style={{fontSize:13, color:'var(--ink-soft)', margin:'0 0 16px'}}>Pick a colleague who deserves to be seen this week. Most-nominated is featured. You get one vote (you can change it).</p>
        {mates.length === 0 ? (
          <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>No teammates on Rehab.Wisal yet — nominations open up as your team joins. 🌱</div>
        ) : (<>
          <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:240, overflow:'auto', marginBottom:14}}>
            {mates.map(p => {
              const on = pick === p.id;
              return (
                <button key={p.id} onClick={()=>setPick(p.id)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px', cursor:'pointer', textAlign:'left',
                  borderRadius:12, background: on ? 'var(--teal-tint)' : 'var(--paper)',
                  border:`1.5px solid ${on ? 'var(--teal)' : 'var(--line)'}`,
                }}>
                  <Avatar person={p} size="md" />
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:600, fontSize:14, color:'var(--navy)'}}>{p.name}</div>
                    <div style={{fontSize:12, color:'var(--ink-soft)'}}>{p.role || (TEAMS[p.team]||{}).label}</div>
                  </div>
                  {on && <span style={{color:'var(--teal-deep)', fontWeight:700}}>✓</span>}
                </button>
              );
            })}
          </div>
          <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Why? (optional)</label>
          <input className="input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. calm in every storm, always makes time to teach…" onKeyDown={e=>{ if(e.key==='Enter') submit(); }} />
          <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:18}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!pick} style={!pick?{opacity:.5}:{}} onClick={submit}>{mine ? 'Update vote' : 'Nominate'}</button>
          </div>
        </>)}
      </div>
    </div>
  );
};

const AuxSpotlight = () => {
  useStore();
  const [open, setOpen] = useState2(false);
  const sp = Store.spotlight();
  const mine = Store.myNominationThisWeek();
  const totalNoms = Store.nominationsThisWeek().length;
  return (
    <div className="aux-section">
      <div className="spotlight">
        <span className="spotlight-label">✦ this week's spotlight</span>
        {sp ? (
          <div style={{marginTop:14, position:'relative'}}>
            <div style={{display:'flex', gap:14, alignItems:'center'}}>
              <Avatar person={sp.person} size="lg" ring="rgba(255,255,255,.35)" />
              <div style={{minWidth:0}}>
                <div className="spotlight-name">{sp.person ? sp.person.name : 'A teammate'}</div>
                <div className="spotlight-role">{sp.person ? (sp.person.role || (TEAMS[sp.person.team]||{}).label) : ''}</div>
              </div>
            </div>
            {sp.reason && <div className="spotlight-quote" style={{marginTop:12}}>"{sp.reason}"</div>}
            <div className="spotlight-foot" style={{position:'relative', marginTop:14}}>
              <span style={{opacity:.85, fontSize:12.5}}>🌟 {sp.count} nomination{sp.count!==1?'s':''} this week</span>
              <button className="btn btn-sm" style={{background:'var(--butter)', color:'#8C6A1A', borderColor:'var(--butter)'}} onClick={()=>setOpen(true)}>{mine ? 'Change vote' : 'Nominate'}</button>
            </div>
          </div>
        ) : (
          <div style={{marginTop:14, position:'relative'}}>
            <div style={{fontSize:14, lineHeight:1.5, color:'rgba(255,255,255,.9)'}}>
              Each week, Rehab.Wisal features a colleague nominated by their peers — a small way to make sure everyone gets seen.
            </div>
            <div className="spotlight-foot" style={{position:'relative', marginTop:14}}>
              <span style={{opacity:.8, fontSize:12.5}}>{totalNoms > 0 ? `${totalNoms} vote${totalNoms!==1?'s':''} in` : 'No nominations yet'}</span>
              <button className="btn btn-sm" style={{background:'var(--butter)', color:'#8C6A1A', borderColor:'var(--butter)'}} onClick={()=>setOpen(true)}>Nominate someone</button>
            </div>
          </div>
        )}
      </div>
      {open && <NominateModal onClose={()=>setOpen(false)} />}
    </div>
  );
};

const AuxEvents = ({ go }) => {
  useStore();
  const events = Store.events().slice().sort((a,b)=>(a.d||0)-(b.d||0)).slice(0, 4);
  return (
    <div className="aux-section">
      <div className="aux-title">Coming up <span className="more" onClick={()=>go && go('events')}>All →</span></div>
      {events.length === 0 ? (
        <div style={{fontSize:13, color:'var(--ink-soft)', padding:'8px 0', lineHeight:1.5}}>
          Nothing scheduled yet. <span style={{color:'var(--teal-deep)', fontWeight:600, cursor:'pointer'}} onClick={()=>go && go('events')}>Create an event →</span>
        </div>
      ) : events.map(e => (
        <div key={e.id} className="event-mini">
          <div className="event-date">
            <div className="event-date-d">{e.d}</div>
            <div className="event-date-m">{e.m}</div>
          </div>
          <div className="event-info">
            <div className="event-name">{e.title}</div>
            <div className="event-when">{e.time}{e.where ? ' · ' + e.where : ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AuxCrews = ({ go }) => {
  useStore();
  const crews = Store.crews().slice(0, 4);
  return (
    <div className="aux-section">
      <div className="aux-title">Your crews <span className="more" onClick={()=>go && go('crews')}>Discover →</span></div>
      {crews.length === 0 ? (
        <div style={{fontSize:13, color:'var(--ink-soft)', padding:'8px 0', lineHeight:1.5}}>
          You haven't joined any crews. <span style={{color:'var(--teal-deep)', fontWeight:600, cursor:'pointer'}} onClick={()=>go && go('crews')}>Find your people →</span>
        </div>
      ) : crews.map(c => (
        <div key={c.id} className="crew-row" onClick={()=>go && go('crews')}>
          <div className="crew-icon">{c.emoji}</div>
          <div className="crew-info">
            <div className="crew-name">{c.name}</div>
            <div className="crew-meta">You're a member</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AuxCapsule = () => {
  useStore();
  const capsule = Store.myPosts().find(p => p.capsule);
  if (!capsule) return null;
  return (
    <div className="aux-section">
      <div className="aux-title">Time capsule</div>
      <div className="capsule-card">
        <div className="capsule-icon">⏳</div>
        <div className="capsule-info">
          <div className="capsule-tag">sealed for {capsule.capsule}</div>
          <div className="capsule-msg">{(capsule.body || 'A note to your future self').slice(0, 60)}</div>
          <div className="capsule-when">You'll be reminded when it opens</div>
        </div>
      </div>
    </div>
  );
};

const AuxPulse = () => {
  useStore();
  const mood = Store.moodToday();
  return (
    <div className="aux-section">
      <div className="aux-title">Floor pulse <span style={{fontSize:11, fontWeight:500, color:'var(--ink-soft)', fontFamily:'var(--font-body)'}}>Today</span></div>
      <div className="card card-pad" style={{padding:16, textAlign:'center'}}>
        {mood ? (<>
          <div style={{fontSize:34, lineHeight:1}}>{MOODS.find(m=>m.id===mood)?.emoji}</div>
          <div style={{fontSize:13.5, color:'var(--navy)', fontWeight:600, marginTop:8}}>You're feeling {MOODS.find(m=>m.id===mood)?.label.toLowerCase()} today</div>
          <div style={{fontSize:12, color:'var(--ink-soft)', marginTop:4}}>The team's collective vibe shows here once everyone's checking in.</div>
        </>) : (<>
          <div style={{fontSize:34, lineHeight:1}}>🫧</div>
          <div style={{fontSize:13.5, color:'var(--navy)', fontWeight:600, marginTop:8}}>How's your shift?</div>
          <div style={{fontSize:12, color:'var(--ink-soft)', marginTop:4}}>Log your mood with the Pulse check-in to start tracking the floor's vibe.</div>
        </>)}
      </div>
    </div>
  );
};

// ============================================================
//  HOME
// ============================================================
const HomeScreen = ({ tweak, onCompose }) => {
  const layout = tweak.feedLayout;
  useStore();
  const [feedTab, setFeedTab] = useState('foryou');
  const name = Store.profile().name.split(' ')[0];
  const myTeam = Store.profile().team || 'PT';
  const FEED_TABS = [
    { id: 'foryou',   label: 'For you' },
    { id: 'following', label: 'Following' },
    { id: 'team',     label: 'My team' },
    { id: 'bright',   label: 'Bright Spots' },
  ];
  const all = Store.feedPosts();
  const meId = Store.meId();
  const followingIds = Store.followingIds();
  const settings = Store.settings();
  const posts = all.filter(p => {
    if (feedTab === 'team')      return FIND(p.author)?.team === myTeam;
    if (feedTab === 'following') return followingIds.includes(p.author);
    if (feedTab === 'bright')    return p.featured === 'kudos' || p.featured === 'win' || (p.kudos_names && p.kudos_names.length) || (p.kudosTo && p.kudosTo.length);
    return true;
  });
  const emptyMsg = {
    foryou: "Your feed is empty — share the first moment with the New post button, and it'll show up right here. ✨",
    following: followingIds.length ? "Posts from people you follow will show up here as they share." : "You're not following anyone yet — head to Discover to follow teammates.",
    team: `Posts from your ${(TEAMS[myTeam]||{}).label || ''} team will gather here — be the first to share something. ✨`,
    bright: "No Bright Spots yet. Send someone kudos with the New post button — it's a lovely way to start. ✦",
  }[feedTab];
  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">Hey {name} —</span> &nbsp;here's what's good today.</div>
          <h1 className="page-title">Home <span style={{color:'var(--teal)'}}>·</span> <span style={{fontFamily:'var(--font-hand)', fontSize:26, color:'var(--teal-deep)'}}>{today}</span></h1>
        </div>
        <div className="feed-tabs">
          {FEED_TABS.map(ft => (
            <button key={ft.id} className={`feed-tab ${feedTab === ft.id ? 'active' : ''}`} onClick={() => setFeedTab(ft.id)}>{ft.label}</button>
          ))}
        </div>
      </div>

      {settings.away && (
        <div className="banner" style={{marginBottom:16}}>🌙 You're marked away today — Pulse and reminders are paused. Switch it off anytime in Settings.</div>
      )}
      {settings.digest && new Date().getDay() === 5 && (() => {
        const weekAgo = Date.now() - 7*24*60*60*1000;
        const weekPosts = Store.allPosts().filter(p => new Date(p.created_at).getTime() >= weekAgo);
        const brightCount = weekPosts.filter(p => p.featured === 'kudos').length;
        const upcoming = Store.events().filter(e => e.d).length;
        return (
          <div className="banner" style={{marginBottom:16, background:'var(--butter-soft)', borderColor:'#F0E5C0', color:'#8C6A1A'}}>
            📬 Friday digest — {weekPosts.length} moment{weekPosts.length!==1?'s':''} shared this week, {brightCount} Bright Spot{brightCount!==1?'s':''}, {upcoming} event{upcoming!==1?'s':''} coming up.
          </div>
        );
      })()}
      {tweak.showDigest && <div style={{marginBottom:16}}><TodayCard onCompose={onCompose} /></div>}
      {tweak.showDailyOne && <div style={{marginBottom:16}}><DailyOne /></div>}
      {tweak.showPulse && settings.pulse && !settings.away && <div style={{marginBottom:16}}><PulseCheckin /></div>}

      <div style={{marginBottom:18}}>
        <Stories onCreate={onCompose} />
      </div>

      <ComposerTrigger onClick={onCompose} />

      <div className="section-head">
        <h3 style={{fontFamily:'var(--font-display)', color:'var(--navy)'}}>{feedTab === 'bright' ? 'Bright Spots & wins' : feedTab === 'team' ? 'From my team' : feedTab === 'following' ? 'People you follow' : 'Latest moments'}</h3>
        <span className="meta">{layout === 'cards' ? 'Cards' : layout === 'magazine' ? 'Magazine' : 'Minimal'} layout · {posts.length} post{posts.length !== 1 ? 's' : ''}</span>
      </div>

      {posts.length === 0 && (
        <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)', lineHeight:1.5}}>{emptyMsg}</div>
      )}

      {layout === 'cards' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {posts.map(p => <Post key={p.id} post={p} />)}
        </div>
      )}
      {layout === 'magazine' && posts.length > 0 && <MagazineFeed posts={posts} />}
      {layout === 'minimal' && <MinimalFeed posts={posts} />}
    </>
  );
};

const AuxRail = ({ tweak, go }) => {
  useStore();
  const settings = Store.settings();
  return (
  <>
    {tweak.showSpotlight && settings.notifSpotlight && <AuxSpotlight />}
    {tweak.showPulse && settings.pulse && !settings.away && <AuxPulse />}
    {settings.notifEvents && <AuxEvents go={go} />}
    {tweak.showCrews && <AuxCrews go={go} />}
    {tweak.showCapsule && settings.capsuleReminders && !settings.away && <AuxCapsule />}
    <div style={{fontSize:11, color:'var(--ink-mute)', fontFamily:'var(--font-mono)', textAlign:'center', marginTop:20}}>
      Rehab.Wisal · internal team space<br/>
      made with 🫶
    </div>
  </>
  );
};

// ============================================================
//  PROFILE
// ============================================================
const ProfileEditor = ({ onClose }) => {
  useStore();
  const prof = Store.profile();
  const [name, setName] = useState2(prof.name);
  const [role, setRole] = useState2(prof.role);
  const [team, setTeam] = useState2(prof.team || 'PT');
  const [tagline, setTagline] = useState2(prof.tagline);
  const [bio, setBio] = useState2(prof.bio);
  const coverRef = React.useRef(null);
  const avatarRef = React.useRef(null);
  const lbl = { display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'14px 0 6px' };
  const pick = async (file, key) => { try { Store.setProfile({ [key]: await readScaledImage(file, key === 'avatar' ? 512 : 1600) }); } catch (e) {} };
  const save = () => { Store.setProfile({ name, role, team, tagline, bio }); onClose(); };
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(560px,100%)', maxHeight:'90vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:28, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
          <h2 style={{fontSize:22}}>Edit profile</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <div style={{display:'flex', gap:16, alignItems:'center', marginBottom:6}}>
          <Avatar person="me" size="xl" />
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            <input ref={avatarRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) pick(e.target.files[0],'avatar'); e.target.value=''; }} />
            <input ref={coverRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) pick(e.target.files[0],'cover'); e.target.value=''; }} />
            <button className="btn btn-sm" onClick={()=>avatarRef.current.click()}><Icon name="image" size={14}/> Profile photo</button>
            <button className="btn btn-sm" onClick={()=>coverRef.current.click()}><Icon name="image" size={14}/> Cover photo</button>
          </div>
        </div>
        <label style={lbl}>Name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        <label style={lbl}>Role</label>
        <input className="input" value={role} onChange={e=>setRole(e.target.value)} />
        <label style={lbl}>Team</label>
        <select className="input" value={team} onChange={e=>setTeam(e.target.value)}>
          {Object.entries(TEAMS).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
        <label style={lbl}>Tagline</label>
        <input className="input" value={tagline} onChange={e=>setTagline(e.target.value)} maxLength={48} />
        <label style={lbl}>About</label>
        <textarea className="input" value={bio} onChange={e=>setBio(e.target.value)} style={{minHeight:90, resize:'vertical'}} placeholder="A line or two about you…" />
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:18}}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  );
};

const ProfileScreen = () => {
  useStore();
  const prof = Store.profile();
  const team = prof.team || 'PT';
  const [tab, setTab] = useState2('moments');
  const [editing, setEditing] = useState2(false);
  const myPosts = Store.myPosts();
  const brightCount = myPosts.filter(p => p.featured === 'kudos').length;
  const crews = Store.crews();
  return (
    <>
      {prof.cover
        ? <div className="cover" style={{background:`url(${prof.cover}) center/cover`}}></div>
        : <ImgPh tone="teal" label="COVER — add yours with Edit profile" className="cover" />}
      <div className="profile-head">
        <Avatar person="me" size="xl" />
        <div className="profile-info">
          <div className="profile-name">{prof.name}</div>
          <div className="profile-role">
            <TeamPill team={team} />
            <span className="pill pill-slate">{prof.role}</span>
            {brightCount > 0 && <span className="pill pill-mint">⭐ {brightCount} Bright Spot{brightCount!==1?'s':''} given</span>}
            {prof.tagline && <span style={{fontFamily:'var(--font-hand)', color:'var(--teal-deep)', fontSize:18}}>"{prof.tagline}"</span>}
          </div>
        </div>
        <div style={{display:'flex', gap:8, paddingBottom:8}}>
          <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon name="settings" size={16}/> Edit profile</button>
          <button className="btn btn-icon"><Icon name="more"/></button>
        </div>
      </div>
      {editing && <ProfileEditor onClose={() => setEditing(false)} />}

      <div className="profile-tabs">
        {['moments','photos','crews','about'].map(t => (
          <div key={t} className={`profile-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      <div className="profile-content-grid" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        <div style={{display:'flex', flexDirection:'column', gap:16, minWidth:0}}>
          {tab === 'moments' && myPosts.map(p => <Post key={p.id} post={p} />)}
          {tab === 'moments' && myPosts.length === 0 && (
            <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>No moments yet — share your first one with the <strong>New post</strong> button. ✨</div>
          )}
          {tab === 'photos' && (() => {
            const pics = myPosts.flatMap(p => (p.media || []).filter(m => m.src));
            return pics.length ? (
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
                {pics.map((m, i) => <div key={i} style={{aspectRatio:1, borderRadius:12, backgroundImage:`url(${m.src})`, backgroundSize:'cover', backgroundPosition:'center'}}/>)}
              </div>
            ) : (
              <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>Photos you post will collect here. 📸</div>
            );
          })()}
          {tab === 'crews' && (crews.length ? (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {crews.map(c => (
                <div key={c.id} className="card card-pad" style={{display:'flex', gap:12, alignItems:'center'}}>
                  <div className="crew-icon" style={{width:48, height:48, fontSize:22}}>{c.emoji}</div>
                  <div><div style={{fontWeight:600, color:'var(--navy)'}}>{c.name}</div><div style={{fontSize:12, color:'var(--ink-soft)'}}>Member</div></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>You haven't joined any crews yet — find them under <strong>Crews</strong>. ☕</div>
          ))}
          {tab === 'about' && (
            <div className="card card-pad">
              <h3 style={{marginBottom:12}}>About</h3>
              {prof.bio
                ? <p style={{margin:0, color:'var(--ink)'}}>{prof.bio}</p>
                : <p style={{margin:0, color:'var(--ink-soft)'}}>Add a short bio from <strong>Edit profile</strong> so coworkers get to know you.</p>}
              <div className="divider"></div>
              <div style={{display:'grid', gridTemplateColumns:'140px 1fr', rowGap:10, fontSize:14}}>
                <span className="muted">Team</span><span>{(TEAMS[team]||{}).label}</span>
                <span className="muted">Role</span><span>{prof.role}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="card card-pad">
            <h3 style={{fontSize:16, marginBottom:10}}>Coworkers</h3>
            <p style={{fontSize:13, color:'var(--ink-soft)', margin:0, lineHeight:1.5}}>
              Your team and connections will appear here once your hospital is set up on Rehab.Wisal.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================
//  CREWS — create & join interest groups
// ============================================================
const CrewsScreen = () => {
  useStore();
  const [creating, setCreating] = useState2(false);
  const [emoji, setEmoji] = useState2('🌟');
  const [cname, setCname] = useState2('');
  const [cdesc, setCdesc] = useState2('');
  const [openCrewId, setOpenCrewId] = useState2(null);
  const mine = Store.crews();
  const ideas = CREW_IDEAS.filter(i => !Store.hasCrew(i.name));
  const create = () => { if (cname.trim()) { const id = Store.addCrew({ emoji, name: cname.trim(), description: cdesc.trim() }); setCname(''); setCdesc(''); setEmoji('🌟'); setCreating(false); } };

  if (openCrewId) return <CrewDetailScreen crewId={openCrewId} onBack={() => setOpenCrewId(null)} />;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">find your people</span></div>
          <h1 className="page-title">Crews</h1>
        </div>
        <button className="btn btn-primary" onClick={()=>setCreating(c=>!c)}><Icon name="plus" size={16}/> Create a crew</button>
      </div>

      <p style={{fontSize:14.5, color:'var(--ink-soft)', maxWidth:680, marginTop:-8, marginBottom:18, lineHeight:1.5}}>
        Crews are interest groups that cross teams — coffee lovers, trail walkers, new parents. Connection beyond job titles.
      </p>

      {creating && (
        <div className="card card-pad" style={{marginBottom:20, display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap'}}>
          <div>
            <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Icon</label>
            <div style={{display:'flex', gap:6}}>
              {['🌟','☕','🥾','📚','🌿','🐾','🍼','🍜','🎧','🎨','🏃','🧩'].map(e =>
                <button key={e} onClick={()=>setEmoji(e)} style={{fontSize:20, width:40, height:40, borderRadius:10, border:`1.5px solid ${emoji===e?'var(--teal)':'var(--line)'}`, background:emoji===e?'var(--teal-tint)':'var(--paper)', cursor:'pointer'}}>{e}</button>
              )}
            </div>
          </div>
          <div style={{flex:1, minWidth:200}}>
            <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Crew name</label>
            <input className="input" value={cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. Night Owls" onKeyDown={e=>{if(e.key==='Enter')create();}} />
          </div>
          <div style={{flex:'1 1 100%', minWidth:200}}>
            <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Description (optional)</label>
            <input className="input" value={cdesc} onChange={e=>setCdesc(e.target.value)} placeholder="What's this crew about?" onKeyDown={e=>{if(e.key==='Enter')create();}} />
          </div>
          <button className="btn btn-primary" onClick={create} disabled={!cname.trim()} style={!cname.trim()?{opacity:.5}:{}}>Create</button>
        </div>
      )}

      {mine.length > 0 && (<>
        <div className="section-head"><h3>Your crews</h3><span className="meta">{mine.length} joined</span></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:12, marginBottom:8}}>
          {mine.map(c => (
            <div key={c.id} className="card card-pad" style={{display:'flex', gap:12, alignItems:'center', cursor:'pointer'}} onClick={()=>setOpenCrewId(c.id)}>
              <div className="crew-icon" style={{width:48, height:48, fontSize:22, backgroundImage: c.photo?`url(${c.photo})`:undefined, backgroundSize:'cover', backgroundPosition:'center'}}>{!c.photo && c.emoji}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, color:'var(--navy)'}}>{c.name}</div>
                <div style={{fontSize:12, color:'var(--ink-soft)'}}>You're a member</div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={(e)=>{e.stopPropagation(); Store.leaveCrew(c.id);}}>Leave</button>
            </div>
          ))}
        </div>
      </>)}

      <div className="section-head"><h3>{mine.length ? 'Discover more crews' : 'Popular crew ideas'}</h3><span className="meta">tap to join</span></div>
      {(() => {
        const discover = Store.discoverCrews();
        const ideaCards = CREW_IDEAS.filter(i => !Store.allCrews().some(c => c.name.toLowerCase() === i.name.toLowerCase()));
        if (discover.length === 0 && ideaCards.length === 0) {
          return <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>You're in every crew going — make your own above! 🎉</div>;
        }
        return (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12}}>
            {discover.map(c => (
              <div key={c.id} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:10}}>
                <div className="crew-icon" style={{width:48, height:48, fontSize:24}}>{c.emoji}</div>
                <div style={{fontWeight:600, fontSize:14.5}}>{c.name}</div>
                <div style={{fontSize:12, color:'var(--ink-soft)'}}>{Store.crewMemberCount(c.id)} member{Store.crewMemberCount(c.id)!==1?'s':''}</div>
                <button className="btn btn-sm" style={{alignSelf:'flex-start'}} onClick={()=>Store.joinCrew(c.id)}>+ Join</button>
              </div>
            ))}
            {ideaCards.map(c => (
              <div key={c.name} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:10, cursor:'pointer'}} onClick={()=>Store.addCrew(c)}>
                <div className="crew-icon" style={{width:48, height:48, fontSize:24}}>{c.emoji}</div>
                <div style={{fontWeight:600, fontSize:14.5}}>{c.name}</div>
                <button className="btn btn-sm" style={{alignSelf:'flex-start'}}>+ Create &amp; join</button>
              </div>
            ))}
          </div>
        );
      })()}
    </>
  );
};

// ============================================================
//  EVENTS — create & RSVP
// ============================================================
const EventForm = ({ onClose, crewId }) => {
  const [title, setTitle] = useState2('');
  const [date, setDate] = useState2('');
  const [time, setTime] = useState2('');
  const [where, setWhere] = useState2('');
  const [desc, setDesc] = useState2('');
  const [image, setImage] = useState2(null);
  const [uploading, setUploading] = useState2(false);
  const [tag, setTag] = useState2('Social');
  const [color, setColor] = useState2('peach');
  const fileRef = React.useRef(null);
  const lbl = { display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'14px 0 6px' };
  const pickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try { setImage(await readScaledImage(file, 1200)); } catch (e) {}
    setUploading(false);
  };
  const submit = () => {
    if (!title.trim()) return;
    let d = '', m = 'MAY', day = '';
    if (date) { const dt = new Date(date + 'T00:00'); d = dt.getDate(); m = dt.toLocaleDateString([], {month:'short'}).toUpperCase(); day = dt.toLocaleDateString([], {weekday:'long'}); }
    Store.addEvent({ title: title.trim(), d, m, day, time: time || 'TBD', where: where.trim(), tag, color, description: desc.trim(), image, crewId });
    onClose();
  };
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(520px,100%)', maxHeight:'90vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:28, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <h2 style={{fontSize:22}}>New event</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <label style={lbl}>Event image (optional)</label>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>pickImage(e.target.files[0])} />
        {image ? (
          <div style={{position:'relative', borderRadius:14, overflow:'hidden', border:'1px solid var(--line)'}}>
            <div style={{aspectRatio:'16/8', backgroundImage:`url(${image})`, backgroundSize:'cover', backgroundPosition:'center'}} />
            <button className="btn btn-sm" style={{position:'absolute', top:8, right:8, background:'rgba(255,255,255,.9)'}} onClick={()=>setImage(null)}>Remove</button>
          </div>
        ) : (
          <div className="btn" style={{width:'100%', justifyContent:'center', cursor:'pointer', borderStyle:'dashed'}} onClick={()=>fileRef.current && fileRef.current.click()}>
            <Icon name="image" size={16}/> {uploading ? 'Uploading…' : 'Add a photo to feature this event'}
          </div>
        )}
        <label style={lbl}>Title *</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Potluck Friday — Comfort Food" />
        <label style={lbl}>Description (optional)</label>
        <textarea className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="A short line about what to expect" rows={2} style={{resize:'vertical', fontFamily:'inherit'}} />
        <div style={{display:'flex', gap:12}}>
          <div style={{flex:1}}><label style={lbl}>Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
          <div style={{flex:1}}><label style={lbl}>Time</label><input className="input" value={time} onChange={e=>setTime(e.target.value)} placeholder="12:30 PM" /></div>
        </div>
        <label style={lbl}>Location</label>
        <input className="input" value={where} onChange={e=>setWhere(e.target.value)} placeholder="e.g. Staff Lounge" />
        <label style={lbl}>Category</label>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {[['Social','peach'],['Wellness','mint'],['Learning','lavender'],['Crew','butter'],['Patient','navy'],['Volunteer','mint']].map(([t,c]) => (
            <button key={t} onClick={()=>{setTag(t);setColor(c);}} className={`pill ${tag===t?'pill-teal':''}`} style={{cursor:'pointer', border: tag===t?'1.5px solid var(--teal)':'1.5px solid var(--line)'}}>{t}</button>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:20}}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!title.trim()} style={!title.trim()?{opacity:.5}:{}} onClick={submit}>Create event</button>
        </div>
      </div>
    </div>
  );
};

const CalendarBanner = () => {
  useStore();
  const cover = Store.calendarCover();
  const fileRef = React.useRef(null);
  const pick = async (file) => {
    if (!file) return;
    try { Store.setCalendarCover(await readScaledImage(file, 1600)); } catch (e) {}
  };
  return (
    <div className="calendar-banner" style={cover ? {backgroundImage:`url(${cover})`} : {}}>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>pick(e.target.files[0])} />
      {!cover && (
        <div className="calendar-banner-empty" onClick={()=>fileRef.current && fileRef.current.click()}>
          <Icon name="image" size={18}/> Add a cover photo for the calendar
        </div>
      )}
      {cover && (
        <div className="calendar-banner-actions">
          <button className="btn btn-sm" onClick={()=>fileRef.current && fileRef.current.click()}>Change</button>
          <button className="btn btn-sm" onClick={()=>Store.clearCalendarCover()}>Remove</button>
        </div>
      )}
    </div>
  );
};

const EventsScreen = () => {
  const [view, setView] = useState2('list');
  const [creating, setCreating] = useState2(false);
  useStore();
  const events = Store.events().slice().sort((a,b)=>(a.d||99)-(b.d||99));
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">coming up</span></div>
          <h1 className="page-title">Events</h1>
        </div>
        <div style={{display:'flex', gap:8}}>
          <div className="feed-tabs">
            <button className={`feed-tab ${view==='list'?'active':''}`} onClick={()=>setView('list')}>List</button>
            <button className={`feed-tab ${view==='calendar'?'active':''}`} onClick={()=>setView('calendar')}>Calendar</button>
          </div>
          <button className="btn btn-primary" onClick={()=>setCreating(true)}><Icon name="plus" size={16}/> New event</button>
        </div>
      </div>

      {view === 'calendar' && events.length > 0 && <CalendarBanner />}

      {events.length === 0 ? (
        <EmptyState emoji="📅" title="No events yet"
          sub="Plan a potluck, a CEU session, a trail walk, a talent show — anything that brings the team together. Create the first one."
          action="Create an event" onAction={()=>setCreating(true)} />
      ) : view === 'list' ? (
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {events.map(e => (
            <div key={e.id} className="event-card">
              {e.image ? (
                <div className="event-banner event-banner-img" style={{backgroundImage:`url(${e.image})`}}>
                  <div className="event-banner-d">{e.d || '·'}</div>
                  <div className="event-banner-m">{e.m}</div>
                </div>
              ) : (
                <div className={`event-banner ${e.color}`}>
                  <div className="event-banner-d">{e.d || '·'}</div>
                  <div className="event-banner-m">{e.m}</div>
                </div>
              )}
              <div className="event-content">
                <div style={{display:'flex', gap:6, marginBottom:4}}>
                  <span className="pill" style={{fontSize:11}}>{e.tag}</span>
                  {e.day && <span className="pill pill-slate" style={{fontSize:11}}>{e.day}</span>}
                </div>
                <div className="event-title">{e.title}</div>
                {e.description && <div className="event-desc">{e.description}</div>}
                <div className="event-detail">
                  <span><Icon name="clock" size={14}/> {e.time}</span>
                  {e.location && <span><Icon name="location" size={14}/> {e.location}</span>}
                  <span><Icon name="crew" size={14}/> {Store.goingCount(e.id)} going</span>
                </div>
                <div className="event-foot">
                  <span style={{display:'flex', gap:8, alignItems:'center', fontSize:13}}>
                    <Avatar person={FIND(e.host)} size="sm" />
                    <span className="muted">hosted by <strong style={{color:'var(--navy)'}}>{e.host === Store.meId() || e.host === 'me' ? 'you' : (FIND(e.host)||{}).first || 'a teammate'}</strong></span>
                  </span>
                  <div style={{display:'flex', gap:6}}>
                    {(e.host === Store.meId() || e.host === 'me' || Store.isAdmin()) && <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.deleteEvent(e.id)}>Delete</button>}
                    <button className={`btn btn-sm ${Store.isGoing(e.id) ? '' : 'btn-primary'}`} onClick={() => Store.toggleGoing(e.id)}>{Store.isGoing(e.id) ? '✓ Going' : 'Going'}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card card-pad">
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:0.08, textAlign:'center', marginBottom:8}}>
            {'Sun Mon Tue Wed Thu Fri Sat'.split(' ').map(d => <div key={d}>{d}</div>)}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
            {(() => {
              const now = new Date();
              const year = now.getFullYear(), month = now.getMonth();
              const firstWeekday = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = now.getDate();
              const rows = Math.ceil((firstWeekday + daysInMonth) / 7);
              return Array.from({length: rows * 7}, (_, i) => {
                const day = i - firstWeekday + 1;
                const inMonth = day >= 1 && day <= daysInMonth;
                const has = inMonth ? events.filter(e => e.d === day) : [];
                const isToday = inMonth && day === today;
                return (
                  <div key={i} style={{aspectRatio:'1', borderRadius:10, padding:6, background: isToday ? 'var(--teal-tint)' : inMonth ? 'var(--paper)' : 'transparent', border: `1px solid ${isToday ? 'var(--teal)' : inMonth ? 'var(--line)' : 'transparent'}`, display:'flex', flexDirection:'column', gap:3, overflow:'hidden'}}>
                    <div style={{fontSize:12, fontWeight:600, color: isToday ? 'var(--teal-deep)' : inMonth ? 'var(--navy)' : 'transparent'}}>{inMonth ? day : ''}</div>
                    {has.map(e => (
                      <div key={e.id} style={{fontSize:10, padding: e.image ? '2px' : '2px 5px', borderRadius:6, display:'flex', alignItems:'center', gap:5, background:`var(--${e.color === 'navy' ? 'navy' : e.color}${e.color === 'navy' ? '' : '-soft'})`, color: e.color === 'navy' ? 'white' : 'var(--navy)', overflow:'hidden', fontWeight:600}}>
                        {e.image && <span style={{width:22, height:22, borderRadius:5, flexShrink:0, backgroundImage:`url(${e.image})`, backgroundSize:'cover', backgroundPosition:'center'}} />}
                        <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.title.split(' ').slice(0,2).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
      {creating && <EventForm onClose={()=>setCreating(false)} />}
    </>
  );
};

Object.assign(window, {
  AuxRail, HomeScreen, ProfileScreen, CrewsScreen, EventsScreen,
  AuxSpotlight, AuxEvents, AuxCrews, AuxCapsule, AuxPulse,
});
