// MySalma — remaining screens: composer, notifications, chat, search, onboarding, settings

const { useState: useS3 } = React;

// ============================================================
//  COMPOSER (modal-style screen)
// ============================================================
const ComposerScreen = ({ onClose }) => {
  const [type, setType] = useS3('moment'); // moment | kudos | win | capsule | watch
  const [body, setBody] = useS3('');
  const [photos, setPhotos] = useS3([]); // [{ src }]
  const [kudosTo, setKudosTo] = useS3([]); // typed/tagged names
  const [kudosInput, setKudosInput] = useS3('');
  const [kudosFocus, setKudosFocus] = useS3(false);
  const [tag, setTag] = useS3('Calm under pressure');
  const [capsuleWhen, setCapsuleWhen] = useS3('1 year');
  const [busy, setBusy] = useS3(false);
  const fileRef = React.useRef(null);
  const addKudosName = (name) => { const n = (name != null ? name : kudosInput).trim(); if (n && !kudosTo.includes(n)) setKudosTo([...kudosTo, n]); setKudosInput(''); };
  const kudosSuggestions = kudosInput.trim()
    ? Store.teammates().filter(m => !kudosTo.includes(m.name) && m.name.toLowerCase().includes(kudosInput.trim().toLowerCase())).slice(0, 5)
    : [];

  const addPhotos = async (files) => {
    setBusy(true);
    const out = [];
    for (const f of Array.from(files).slice(0, 4)) {
      try { out.push({ src: await readScaledImage(f) }); } catch (e) {}
    }
    setPhotos(p => [...p, ...out].slice(0, 4));
    setBusy(false);
  };

  const canPost = !!(body.trim() || photos.length || (type === 'kudos' && kudosTo.length));

  const submit = () => {
    if (!canPost) return;
    const base = { body: body.trim(), media: photos.length ? photos : undefined };
    if (type === 'kudos') {
      base.featured = 'kudos'; base.kudosNames = kudosTo; base.kudosTag = tag;
      if (!base.body) base.body = `A bright spot for ${kudosTo.join(' & ') || 'a teammate'} — ${tag}. ✦`;
    }
    if (type === 'win') base.featured = 'win';
    if (type === 'capsule') base.capsule = capsuleWhen;
    Store.addPost(base);
    onClose();
  };

  const types = [
    { id: 'moment', label: 'Moment',      emoji: '✨', desc: 'Share a photo, story, or update' },
    { id: 'kudos',  label: 'Bright Spot', emoji: '✦',  desc: 'Public kudos for a coworker' },
    { id: 'win',    label: 'Win Wall',    emoji: '🌱', desc: 'Celebrate a patient or staff win' },
    { id: 'capsule',label: 'Time Capsule',emoji: '⏳', desc: 'Schedule for the future' },
    { id: 'watch',  label: 'Watch Party', emoji: '📺', desc: 'Co-watch / co-listen room' },
  ];

  return (
    <div className="modal-overlay" style={{
      position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', padding:20, zIndex:200
    }} onClick={onClose}>
      <div className="modal-sheet" style={{
        width:'min(640px, 100%)', maxHeight:'90vh', overflow:'auto',
        background:'var(--cream)', borderRadius:24, padding:28,
        boxShadow:'0 30px 60px rgba(0,0,0,.3)', border:'1px solid var(--line)'
      }} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
          <h2 style={{fontSize:22}}>New post</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:18}}>
          {types.map(t => (
            <button key={t.id} onClick={()=>setType(t.id)} style={{
              border: `1.5px solid ${type===t.id ? 'var(--teal)' : 'var(--line)'}`,
              background: type===t.id ? 'var(--teal-tint)' : 'var(--paper)',
              borderRadius:14, padding:'12px 8px', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              fontFamily:'inherit', transition:'all .15s'
            }}>
              <span style={{fontSize:22}}>{t.emoji}</span>
              <span style={{fontSize:12, fontWeight:600, color:'var(--navy)'}}>{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex', gap:12, alignItems:'flex-start', marginBottom:14}}>
          <Avatar person="me" size="md" />
          <div style={{flex:1}}>
            <div style={{fontWeight:600, fontSize:14, color:'var(--navy)'}}>{Store.profile().name}</div>
            <div style={{display:'flex', gap:6, marginTop:4}}>
              <span className="pill" style={{fontSize:11, cursor:'pointer'}}>👥 Whole hospital</span>
              <span className="pill" style={{fontSize:11, cursor:'pointer'}}>{(TEAMS[Store.profile().team]||{}).label || 'My team'}</span>
            </div>
          </div>
        </div>

        {type === 'kudos' && (
          <div style={{padding:14, background:'var(--butter-soft)', border:'1px solid #F0E5C0', borderRadius:14, marginBottom:14}}>
            <div className="kudos-eyebrow">✦ a bright spot for…</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:10, alignItems:'center'}}>
              {kudosTo.map(n => (
                <span key={n} style={{display:'flex', alignItems:'center', gap:6, padding:'5px 8px 5px 12px', background:'var(--navy)', color:'white', borderRadius:999, fontWeight:600, fontSize:13}}>
                  {n}
                  <button onClick={()=>setKudosTo(kudosTo.filter(x=>x!==n))} style={{background:'rgba(255,255,255,.2)', border:0, color:'white', width:18, height:18, borderRadius:'50%', cursor:'pointer', display:'grid', placeItems:'center', fontSize:11}}>×</button>
                </span>
              ))}
              <div style={{position:'relative', flex:1, minWidth:160}}>
                <input className="input" value={kudosInput} onChange={e=>setKudosInput(e.target.value)}
                  onFocus={()=>setKudosFocus(true)} onBlur={()=>setTimeout(()=>setKudosFocus(false), 120)}
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addKudosName(); } }}
                  placeholder={kudosTo.length ? 'add another…' : "type a coworker's name…"}
                  style={{width:'100%'}} />
                {kudosFocus && kudosSuggestions.length > 0 && (
                  <div style={{position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:10, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, boxShadow:'var(--shadow-md)', overflow:'hidden'}}>
                    {kudosSuggestions.map(m => (
                      <div key={m.id} onMouseDown={()=>addKudosName(m.name)}
                        style={{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', cursor:'pointer'}}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--cream)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <Avatar person={m} size="sm" />
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:13.5, fontWeight:600, color:'var(--navy)'}}>{m.name}</div>
                          <div style={{fontSize:11.5, color:'var(--ink-soft)'}}>{m.role || (TEAMS[m.team]||{}).label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{marginTop:14, fontSize:12.5, fontWeight:600, color:'#8C6A1A', marginBottom:6}}>FOR…</div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {['Calm under pressure', 'Above & beyond', 'Mentor', 'Quiet hero', 'Patient whisperer', 'Team player'].map(t => (
                <button key={t} onClick={()=>setTag(t)} style={{
                  padding:'5px 12px', borderRadius:999,
                  background: tag===t ? '#8C6A1A' : 'var(--paper)',
                  color: tag===t ? 'white' : 'var(--navy)',
                  border: `1px solid ${tag===t ? '#8C6A1A' : 'var(--line)'}`,
                  cursor:'pointer', fontWeight:600, fontSize:12.5
                }}>✦ {t}</button>
              ))}
            </div>
          </div>
        )}

        {type === 'capsule' && (
          <div className="capsule-card" style={{marginBottom:14}}>
            <div className="capsule-icon">⏳</div>
            <div className="capsule-info">
              <div className="capsule-tag">opens for you in…</div>
              <div style={{display:'flex', gap:6, marginTop:8}}>
                {['1 month','6 months','1 year','5 years'].map(w => (
                  <button key={w} onClick={()=>setCapsuleWhen(w)} style={{
                    padding:'5px 12px', borderRadius:999,
                    background: capsuleWhen===w ? '#524FA3' : 'var(--paper)',
                    color: capsuleWhen===w ? 'white' : 'var(--navy)',
                    border: `1px solid ${capsuleWhen===w ? '#524FA3' : 'var(--lavender)'}`,
                    cursor:'pointer', fontWeight:600, fontSize:12.5
                  }}>{w}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'win' && (
          <div style={{padding:12, background:'var(--mint-soft)', border:'1px solid var(--mint)', borderRadius:14, marginBottom:14, fontSize:13, color:'var(--teal-deep)'}}>
            🌱 <strong>Patient win etiquette:</strong> use first initials only, confirm consent for any photos, and skip clinical details. The Win Wall is for celebrating, not charting.
          </div>
        )}

        {type === 'watch' && (
          <div className="watch-card" style={{marginBottom:14}}>
            <span className="watch-live">SETTING UP</span>
            <h3 style={{color:'white', marginTop:10, fontSize:20}}>Watch Party</h3>
            <p style={{margin:'6px 0 0', opacity:.85, fontSize:13.5}}>Drop a link (Youtube, internal training, podcast) — everyone in the room watches in sync.</p>
            <input className="input" placeholder="paste link…" style={{marginTop:12, background:'rgba(255,255,255,.1)', color:'white', border:'1px solid rgba(255,255,255,.2)'}} />
          </div>
        )}

        <textarea
          className="input input-lg"
          placeholder={
            type === 'kudos' ? `${kudosTo.length ? kudosTo[0] + ' was…' : 'Tell us why they deserve this Bright Spot…'}` :
            type === 'win'   ? "What happened? Who's it about? (initials only please)" :
            type === 'capsule' ? "Write a note to future-you (or future-team)…" :
            type === 'watch' ? "Optional message for the room…" :
            "What's a bright spot from today? ✨"
          }
          value={body}
          onChange={e=>setBody(e.target.value)}
          style={{minHeight:120, resize:'vertical'}}
        />

        {photos.length > 0 && (
          <div style={{display:'grid', gridTemplateColumns:`repeat(${Math.min(photos.length,3)},1fr)`, gap:6, marginTop:12}}>
            {photos.map((p, i) =>
              <div key={i} style={{position:'relative', aspectRatio:1, borderRadius:12, overflow:'hidden', backgroundImage:`url(${p.src})`, backgroundSize:'cover', backgroundPosition:'center'}}>
                <button onClick={() => setPhotos(ph => ph.filter((_, j) => j !== i))} style={{position:'absolute', top:6, right:6, width:26, height:26, borderRadius:'50%', border:0, background:'rgba(20,36,71,.7)', color:'white', cursor:'pointer', display:'grid', placeItems:'center'}}><Icon name="close" size={14}/></button>
              </div>
            )}
          </div>
        )}
        {busy && <div style={{fontSize:12, color:'var(--ink-soft)', marginTop:8}}>Adding photos…</div>}

        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:14, padding:'10px 0', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)'}}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}}
            onChange={e => { addPhotos(e.target.files); e.target.value = ''; }} />
          <button className="composer-action" style={{color:'var(--teal-deep)', cursor:'pointer', background:'transparent', border:0}} onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="image" size={16}/> Photo
          </button>
          <button className="composer-action" style={{color:'#B86833', cursor:'pointer', background:'transparent', border:0}}>
            <Icon name="video" size={16}/> Video
          </button>
          <button className="composer-action" style={{color:'#524FA3', cursor:'pointer', background:'transparent', border:0}}>
            <Icon name="poll" size={16}/> Poll
          </button>
          <button className="composer-action" style={{color:'var(--slate)', cursor:'pointer', background:'transparent', border:0}}>
            <Icon name="location" size={16}/> Place
          </button>
          <button className="composer-action" style={{color:'#C9A645', cursor:'pointer', background:'transparent', border:0}}>
            <Icon name="smile" size={16}/> Mood
          </button>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16}}>
          <div style={{fontSize:12, color:'var(--ink-soft)'}}>
            {type === 'capsule' ? `📦 Sealed until ${capsuleWhen} from now` :
             type === 'kudos' ? `✦ ${kudosTo.length} ${kudosTo.length===1?'person':'people'} · ${tag}` :
             '👁 visible to: whole hospital'}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!canPost} style={!canPost ? {opacity:.5, cursor:'not-allowed'} : {}} onClick={submit}>Post{type === 'capsule' ? ' + Seal' : ''}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  NOTIFICATIONS panel (full screen mode)
// ============================================================
const NotifsScreen = () => (
  <>
    <div className="page-head">
      <div>
        <div className="page-greet"><span className="hand">all caught up</span></div>
        <h1 className="page-title">Notifications</h1>
      </div>
    </div>
    <EmptyState emoji="🔔" title="You're all caught up"
      sub="Reactions, replies, Bright Spots, event invites and mentions will land here as your team starts using Rehab.Wisal." />
  </>
);

// ============================================================
//  CHAT screen
// ============================================================
const NewGroupModal = ({ onClose, onCreated }) => {
  const [name, setName] = useS3('');
  const [picked, setPicked] = useS3([]);
  const mates = Store.teammates();
  const toggle = (id) => setPicked(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  const create = () => { if (!name.trim()) return; const id = Store.createGroup(name.trim(), picked); onClose(); if (id) onCreated(id); };
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(420px,100%)', maxHeight:'86vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:26, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <h2 style={{fontSize:20}}>New group chat</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Group name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Night Shift Crew" autoFocus />
        <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'16px 0 8px'}}>Add teammates</label>
        {mates.length === 0 ? (
          <div style={{fontSize:13, color:'var(--ink-soft)'}}>No teammates yet — invite people to join first.</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:2, maxHeight:260, overflow:'auto'}}>
            {mates.map(m => (
              <div key={m.id} className="chat-list-item" style={{cursor:'pointer'}} onClick={()=>toggle(m.id)}>
                <Avatar person={m} size="sm" />
                <div className="chat-list-info">
                  <div className="chat-list-name">{m.name}</div>
                </div>
                <input type="checkbox" readOnly checked={picked.includes(m.id)} />
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:20}}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!name.trim()} style={!name.trim()?{opacity:.5}:{}} onClick={create}>Create group</button>
        </div>
      </div>
    </div>
  );
};

const GroupSettingsModal = ({ group, onClose }) => {
  useStore();
  const [name, setName] = useS3(group.name);
  const owner = Store.isGroupOwner(group.id);
  const members = Store.groupMembers(group.id);
  const mates = Store.teammates().filter(m => !members.some(x=>x.id===m.id));
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(440px,100%)', maxHeight:'86vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:26, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <h2 style={{fontSize:20}}>Group settings</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        {owner ? (
          <>
            <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Group name</label>
            <div style={{display:'flex', gap:8}}>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} />
              <button className="btn btn-sm" onClick={()=>Store.renameGroup(group.id, name)}>Save</button>
            </div>
          </>
        ) : <div style={{fontWeight:600, color:'var(--navy)'}}>{group.name}</div>}
        <div style={{fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'18px 0 8px'}}>Members ({members.length})</div>
        <div style={{display:'flex', flexDirection:'column', gap:2}}>
          {members.map(m => (
            <div key={m.id} className="chat-list-item" style={{cursor:'default'}}>
              <Avatar person={m} size="sm" />
              <div className="chat-list-info"><div className="chat-list-name">{m.name}{m.id===Store.meId()?' (you)':''}</div></div>
              {owner && m.id !== Store.meId() && <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.removeGroupMember(group.id, m.id)}>Remove</button>}
            </div>
          ))}
        </div>
        {owner && mates.length > 0 && (<>
          <div style={{fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'18px 0 8px'}}>Add more</div>
          <div style={{display:'flex', flexDirection:'column', gap:2, maxHeight:180, overflow:'auto'}}>
            {mates.map(m => (
              <div key={m.id} className="chat-list-item" style={{cursor:'pointer'}} onClick={()=>Store.addGroupMember(group.id, m.id)}>
                <Avatar person={m} size="sm" />
                <div className="chat-list-info"><div className="chat-list-name">{m.name}</div></div>
                <Icon name="plus" size={14}/>
              </div>
            ))}
          </div>
        </>)}
        <div style={{display:'flex', justifyContent:'space-between', marginTop:20}}>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-sm" style={{color:'#B05050'}} onClick={()=>{ Store.leaveGroup(group.id); onClose(); }}>Leave group</button>
            {owner && <button className="btn btn-sm" style={{color:'#B05050'}} onClick={()=>{ if (confirm('Delete this group chat for everyone? This can\'t be undone.')) { Store.deleteGroup(group.id); onClose(); } }}>Delete group</button>}
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const ChatScreen = () => {
  useStore();
  const convos = Store.conversations();
  const [active, setActive] = useS3('team');
  const [draft, setDraft] = useS3('');
  const [showNewGroup, setShowNewGroup] = useS3(false);
  const [showGroupSettings, setShowGroupSettings] = useS3(false);
  const bodyRef = React.useRef(null);
  const activeConv = convos.find(c => c.id === active) || convos[0];
  const msgs = Store.messagesWith(active);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs.length, active]);

  const send = () => { if (draft.trim()) { Store.sendMessage(active, draft.trim()); setDraft(''); } };
  const dayLabel = (iso) => {
    const d = new Date(iso); const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="page-head" style={{marginBottom:14}}>
        <div>
          <div className="page-greet"><span className="hand">messages</span></div>
          <h1 className="page-title">Chat</h1>
        </div>
      </div>
      <div className="chat-layout">
        <div className="chat-list">
          <div style={{display:'flex', gap:8, marginBottom:12}}>
            <div className="search-bar" style={{flex:1, padding:'8px 14px'}}>
              <Icon name="search" size={16}/>
              <input placeholder="Search people…" />
            </div>
            <button className="btn btn-icon" title="New group chat" onClick={()=>setShowNewGroup(true)}><Icon name="plus" size={16}/></button>
          </div>
          {convos.map(c => {
            const on = c.id === active;
            const isTeam = c.id === 'team';
            return (
              <div key={c.id} className={`chat-list-item ${on ? 'active' : ''}`} onClick={() => setActive(c.id)}>
                {isTeam
                  ? <div style={{width:40, height:40, borderRadius:12, background:'var(--teal-tint)', display:'grid', placeItems:'center', fontSize:20, flexShrink:0}}>🏥</div>
                  : c.isGroup
                  ? <div style={{width:40, height:40, borderRadius:12, background: c.photo?`url(${c.photo}) center/cover`:'var(--lavender-soft)', display:'grid', placeItems:'center', fontSize:18, flexShrink:0}}>{!c.photo && '👥'}</div>
                  : <Avatar person={c} size="md" />}
                <div className="chat-list-info">
                  <div className="chat-list-name">
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{isTeam ? 'Whole Hospital' : c.name}</span>
                    {c.lastAt && <span className="chat-list-time">{timeAgo(c.lastAt)}</span>}
                  </div>
                  <div className="chat-list-msg">{c.last || (isTeam ? 'Team-wide room — say hi 👋' : c.isGroup ? `${c.memberCount} member${c.memberCount!==1?'s':''}` : 'No messages yet')}</div>
                </div>
              </div>
            );
          })}
          {convos.length <= 1 && (
            <div style={{fontSize:12.5, color:'var(--ink-soft)', padding:'12px 8px', lineHeight:1.5}}>
              Teammates appear here as they join Rehab.Wisal. The <strong>Whole Hospital</strong> room is always open.
            </div>
          )}
        </div>

        <div className="chat-thread">
          <div className="chat-head">
            {activeConv && activeConv.id === 'team'
              ? <div style={{width:40, height:40, borderRadius:12, background:'var(--teal-tint)', display:'grid', placeItems:'center', fontSize:20}}>🏥</div>
              : activeConv && activeConv.isGroup
              ? <div style={{width:40, height:40, borderRadius:12, background: activeConv.photo?`url(${activeConv.photo}) center/cover`:'var(--lavender-soft)', display:'grid', placeItems:'center', fontSize:18}}>{!activeConv.photo && '👥'}</div>
              : <Avatar person={activeConv} size="md" />}
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:600, color:'var(--navy)'}}>{activeConv ? (activeConv.id === 'team' ? 'Whole Hospital' : activeConv.name) : 'Chat'}</div>
              <div style={{fontSize:12, color:'var(--ink-soft)'}}>{activeConv && activeConv.id === 'team' ? 'Everyone on Rehab.Wisal' : activeConv && activeConv.isGroup ? `${activeConv.memberCount} member${activeConv.memberCount!==1?'s':''} · group chat` : (activeConv ? (activeConv.role || (TEAMS[activeConv.team]||{}).label) : '')}</div>
            </div>
            {activeConv && activeConv.isGroup && (
              <button className="btn btn-icon btn-ghost" title="Group settings" onClick={()=>setShowGroupSettings(true)}><Icon name="settings" size={16}/></button>
            )}
          </div>

          <div className="chat-body" ref={bodyRef}>
            {msgs.length === 0 ? (
              <div style={{margin:'auto', textAlign:'center', color:'var(--ink-soft)', maxWidth:280}}>
                <div style={{fontSize:38}}>{activeConv && activeConv.isRoom ? (activeConv.isGroup ? '👥' : '🏥') : '👋'}</div>
                <div style={{marginTop:8, fontSize:14}}>{activeConv && activeConv.isRoom ? `Start the conversation with ${activeConv.isGroup ? 'this group' : 'your whole team'}.` : `Say hello to ${activeConv ? activeConv.first : ''}.`}</div>
              </div>
            ) : msgs.map((m, i) => {
              const mine = m.sender === Store.meId();
              const sender = FIND(m.sender);
              const showDay = i === 0 || dayLabel(m.created_at) !== dayLabel(msgs[i-1].created_at);
              return (
                <React.Fragment key={m.id}>
                  {showDay && <div className="chat-day">{dayLabel(m.created_at)}</div>}
                  <div className={`chat-msg ${mine ? 'me' : ''}`}>
                    {!mine && <Avatar person={sender} size="sm" />}
                    <div>
                      {!mine && activeConv && activeConv.isRoom && <div style={{fontSize:11, color:'var(--ink-soft)', margin:'0 0 2px 4px', fontWeight:600}}>{sender ? sender.first : 'Teammate'}</div>}
                      <div className="chat-bubble">{m.text}</div>
                      <div style={{fontSize:10.5, color:'var(--ink-soft)', marginTop:3, padding:'0 4px', textAlign: mine ? 'right' : 'left'}}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="chat-input">
            <input className="input" placeholder={`Message ${activeConv ? (activeConv.id === 'team' ? 'the team' : activeConv.isGroup ? 'the group' : activeConv.first) : ''}…`}
              value={draft} onChange={e=>setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }} />
            <button className="btn btn-primary btn-icon" onClick={send}><Icon name="send" size={16}/></button>
          </div>
        </div>
      </div>
      {showNewGroup && <NewGroupModal onClose={()=>setShowNewGroup(false)} onCreated={(id)=>setActive(id)} />}
      {showGroupSettings && activeConv && activeConv.isGroup && <GroupSettingsModal group={activeConv} onClose={()=>setShowGroupSettings(false)} />}
    </>
  );
};

// ============================================================
//  SEARCH / DISCOVER screen
// ============================================================
const SearchScreen = ({ go }) => {
  const [q, setQ] = useS3('');
  useStore();
  const crews = Store.crews();
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">discover</span></div>
          <h1 className="page-title">Search &amp; explore</h1>
        </div>
      </div>
      <div className="search-bar" style={{padding:'14px 20px', marginBottom:18}}>
        <Icon name="search" size={20}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search people, crews, posts, events…" style={{fontSize:16}}/>
        <span className="pill" style={{fontSize:11}}>⌘K</span>
      </div>

      <div className="section-head"><h3>Crews to start</h3><span className="meta">interest groups across teams</span></div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12}}>
        {CREW_IDEAS.filter(c => !Store.hasCrew(c.name)).map(c => (
          <div key={c.name} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:8, cursor:'pointer'}} onClick={()=>Store.addCrew(c)}>
            <div className="crew-icon" style={{width:48, height:48, fontSize:24}}>{c.emoji}</div>
            <div style={{fontWeight:600, fontSize:14.5}}>{c.name}</div>
            <button className="btn btn-sm" style={{alignSelf:'flex-start'}}>+ Create &amp; join</button>
          </div>
        ))}
        {crews.map(c => (
          <div key={c.id} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:8}}>
            <div className="crew-icon" style={{width:48, height:48, fontSize:24}}>{c.emoji}</div>
            <div style={{fontWeight:600, fontSize:14.5}}>{c.name}</div>
            <span className="pill pill-teal" style={{alignSelf:'flex-start', fontSize:11}}>✓ Joined</span>
          </div>
        ))}
      </div>

      <div style={{marginTop:22}}>
        <div className="section-head"><h3>People</h3><span className="meta">follow teammates to fill your Following tab</span></div>
        {(() => {
          const mates = Store.teammates().filter(m => !q.trim() || m.name.toLowerCase().includes(q.trim().toLowerCase()));
          if (mates.length === 0) {
            return (
              <EmptyState emoji="👥" title="No teammates yet"
                sub="As coworkers join Rehab.Wisal, they'll show up here so you can follow them." />
            );
          }
          return (
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              {mates.map(m => {
                const following = Store.isFollowing(m.id);
                return (
                  <div key={m.id} className="crew-row" style={{cursor:'default'}}>
                    <Avatar person={m} size="md" />
                    <div className="crew-info">
                      <div className="crew-name">{m.name}</div>
                      <div className="crew-meta">{m.role || (TEAMS[m.team]||{}).label}</div>
                    </div>
                    <button className={`btn btn-sm ${following ? '' : 'btn-primary'}`} onClick={()=>Store.toggleFollow(m.id)}>{following ? '✓ Following' : 'Follow'}</button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div style={{marginTop:22}}>
        <EmptyState emoji="🔍" title="Posts &amp; events will be searchable here"
          sub="Once your hospital is on Rehab.Wisal, search finds Bright Spots, wins, events and photos across every team." />
      </div>
    </>
  );
};

// ============================================================
//  ONBOARDING flow
// ============================================================
const OnboardingScreen = ({ onDone }) => {
  const [step, setStep] = useS3(0);
  const [name, setName] = useS3('');
  const [role, setRole] = useS3('');
  const [team, setTeam] = useS3(null);
  const [mood, setMood] = useS3(null);
  const [crews, setCrews] = useS3([]);

  const finish = () => {
    const patch = {};
    if (name.trim()) patch.name = name.trim();
    if (role.trim()) patch.role = role.trim();
    if (team) patch.team = team;
    if (Object.keys(patch).length) Store.setProfile(patch);
    if (mood) Store.setMood(mood);
    crews.forEach(idx => Store.addCrew(CREW_IDEAS[idx]));
    onDone();
  };

  const steps = [
    {
      emoji: '👋',
      title: <>Welcome to <span style={{color:'var(--teal)'}}>Rehab.Wisal</span></>,
      sub: 'A little corner of the internet just for our team. Photos, wins, weird-shift-stories, the occasional banana bread sighting.',
      body: (
        <div style={{marginTop:22}}>
          <div style={{display:'flex', gap:12}}>
            <div style={{flex:1}}>
              <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Your name</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sara Mendoza" />
            </div>
            <div style={{flex:1}}>
              <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Your role</label>
              <input className="input" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Physiotherapist" />
            </div>
          </div>
          <div style={{marginTop:16, padding:16, background:'var(--cream)', borderRadius:14, border:'1px solid var(--line)'}}>
            <div style={{display:'flex', gap:14, alignItems:'flex-start'}}>
              <span style={{fontSize:24}}>🤝</span>
              <div style={{fontSize:13.5, lineHeight:1.55, color:'var(--ink)'}}>
                <strong style={{color:'var(--navy)'}}>The promise.</strong> This space is internal-only. Patient details stay anonymous. Pulse moods are aggregate. You can mute, leave, or quit anytime. Be kind, be real.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      emoji: '🩺',
      title: 'Which team are you on?',
      sub: "We'll auto-add you to the right channels — you can always tweak this later.",
      body: (
        <div className="team-select-grid">
          {Object.entries(TEAMS).map(([k, t]) => (
            <div key={k} className={`team-select-card ${team===k?'selected':''}`} onClick={()=>setTeam(k)}>
              <div className="team-select-icon">{
                {PT:'🦵', OT:'✋', SLP:'🗣️', RT:'🎨', NUR:'💉', ADM:'📋', RES:'🫁', DIE:'🥗'}[k]
              }</div>
              <div className="team-select-name">{t.label}</div>
              <div className="team-select-desc">{
                {PT:'Movement & strength', OT:'Daily living skills', SLP:'Speech & swallow', RT:'Music, art, play', NUR:'Care & coordination', ADM:'Behind the scenes', RES:'Breath & airways', DIE:'Nutrition'}[k]
              }</div>
            </div>
          ))}
        </div>
      )
    },
    {
      emoji: '✨',
      title: "Find your crews",
      sub: "Mini-communities by interest, not job. You can join more later.",
      body: (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:20}}>
          {CREW_IDEAS.map((c, idx) => {
            const on = crews.includes(idx);
            return (
              <div key={c.name} onClick={()=>setCrews(on ? crews.filter(x=>x!==idx) : [...crews, idx])} style={{
                display:'flex', gap:10, alignItems:'center', padding:12, borderRadius:12,
                border:`1.5px solid ${on?'var(--teal)':'var(--line)'}`,
                background: on ? 'var(--teal-tint)' : 'var(--paper)',
                cursor:'pointer'
              }}>
                <div className="crew-icon">{c.emoji}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:13.5}}>{c.name}</div>
                </div>
                {on && <Icon name="check" size={18} style={{color:'var(--teal)'}} />}
              </div>
            );
          })}
        </div>
      )
    },
    {
      emoji: '🫧',
      title: 'How are you, today?',
      sub: "We'll ask once a shift. It's anonymous in aggregate — only your team's vibe shape is shared. (You can skip whenever.)",
      body: (
        <div className="pulse-moods" style={{justifyContent:'center', marginTop:24}}>
          {MOODS.map(m => (
            <button key={m.id} className={`mood-chip ${mood === m.id ? 'selected' : ''}`} onClick={() => setMood(m.id)} style={{minWidth:70, padding:'12px 14px'}}>
              <span className="mood-emoji" style={{fontSize:28}}>{m.emoji}</span>
              <span className="mood-name">{m.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      emoji: '🌿',
      title: name.trim() ? `You're all set, ${name.trim().split(' ')[0]}.` : "You're all set.",
      sub: "Welcome to the team's space. Three things to try first:",
      body: (
        <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:20}}>
          {[
            ['✨','Share your first Moment — even a coffee photo counts'],
            ['✦','Send a Bright Spot to someone who helped you this week'],
            ['📅','Plan an event, or start a crew for something you love'],
          ].map(([e,t]) => (
            <div key={t} style={{display:'flex', gap:14, padding:14, background:'var(--cream)', borderRadius:12, border:'1px solid var(--line)'}}>
              <span style={{fontSize:22}}>{e}</span>
              <span style={{fontSize:14, color:'var(--ink)'}}>{t}</span>
            </div>
          ))}
        </div>
      )
    }
  ];

  const s = steps[step];

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-steps">
          {steps.map((_, i) => <div key={i} className={`onboard-step ${i<step?'done':''} ${i===step?'active':''}`}></div>)}
        </div>
        <div className="onboard-emoji">{s.emoji}</div>
        <h2 className="onboard-title" style={{marginTop:12}}>{s.title}</h2>
        <p className="onboard-sub">{s.sub}</p>
        {s.body}
        <div className="onboard-actions">
          <button className="btn btn-ghost" onClick={() => step === 0 ? onDone() : setStep(s => s-1)}>
            {step === 0 ? 'Skip tour' : '← Back'}
          </button>
          <button className="btn btn-primary" onClick={() => step === steps.length-1 ? finish() : setStep(s => s+1)}>
            {step === steps.length-1 ? 'Take me in →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  SETTINGS
// ============================================================
const SettingsScreen = ({ go }) => {
  useStore();
  const prof = Store.profile();
  const [section, setSection] = useS3('account');
  const avRef = React.useRef(null);
  const setAvatar = async (file) => { try { Store.setProfile({ avatar: await readScaledImage(file, 512) }); } catch (e) {} };
  const [toggles, setToggles] = useS3({
    quietMode: true,
    pulse: true,
    capsule: true,
    kudos: true,
    digest: false,
    nightShift: false,
    away: false,
  });
  const T = (k, txt, sub) => (
    <div className="settings-row">
      <div className="settings-row-info"><h4>{txt}</h4><p>{sub}</p></div>
      <div className={`toggle ${toggles[k]?'on':''}`} onClick={() => setToggles(t => ({...t, [k]:!t[k]}))}></div>
    </div>
  );

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="settings-grid">
        <div className="settings-nav">
          {[
            ['account','Account'],
            ['privacy','Privacy & Pulse'],
            ['notifs','Notifications'],
            ['shift','Shift & Quiet hours'],
            ['appearance','Appearance'],
            ['team','My team & crews'],
            ['help','Help & feedback']
          ].map(([k,l]) => (
            <button key={k} className={`nav-item ${section===k?'active':''}`} onClick={()=>setSection(k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="card card-pad" style={{padding:24}}>
          {section === 'account' && (<>
            <h3 style={{fontSize:20, marginBottom:18}}>Account</h3>
            {Store.mode === 'supabase' && (() => {
              const admin = Store.isAdmin();
              const status = Store.myStatus();
              const stMeta = { approved: ['✓ Approved', 'pill-teal'], pending: ['⏳ Pending', 'pill-butter'], rejected: ['Rejected', 'pill-blush'] }[status] || ['—', 'pill'];
              return (
                <div style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px', marginBottom:20, borderRadius:'var(--r-md)',
                  background: admin ? 'linear-gradient(135deg, var(--teal-tint), var(--mint-soft))' : 'var(--cream)', border:'1px solid var(--line)'}}>
                  <div style={{width:46, height:46, borderRadius:12, flexShrink:0, display:'grid', placeItems:'center', fontSize:22,
                    background: admin ? 'var(--navy)' : 'var(--paper)', color: admin ? 'white' : 'var(--ink-soft)', border: admin ? 'none' : '1px solid var(--line)'}}>
                    {admin ? '🛡️' : '🪪'}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:15, color:'var(--navy)'}}>{admin ? 'Administrator' : 'Team member'}</div>
                    <div style={{fontSize:12.5, color:'var(--ink-soft)'}}>{admin ? 'You can approve or reject new sign-ups in the Approvals tab.' : 'Standard member access.'}</div>
                  </div>
                  <span className={`pill ${stMeta[1]}`}>{stMeta[0]}</span>
                </div>
              );
            })()}
            <div style={{display:'flex', gap:18, alignItems:'center', marginBottom:24}}>
              <Avatar person="me" size="xl" />
              <div>
                <div style={{fontWeight:600, fontSize:18, color:'var(--navy)'}}>{prof.name}</div>
                <div style={{color:'var(--ink-soft)'}}>{prof.name.toLowerCase().replace(/[^a-z]+/g,'.')}@rehabwisal.org</div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  <input ref={avRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) setAvatar(e.target.files[0]); e.target.value=''; }} />
                  <button className="btn btn-sm" onClick={()=>avRef.current.click()}>Change photo</button>
                  {prof.avatar && <button className="btn btn-sm btn-ghost" onClick={()=>Store.setProfile({avatar:null})}>Remove</button>}
                </div>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Display name</h4><p>How you appear to coworkers</p></div>
              <input className="input" style={{maxWidth:240}} value={prof.name} onChange={e=>Store.setProfile({name:e.target.value})} />
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Role</h4><p>Your job title on your profile</p></div>
              <input className="input" style={{maxWidth:240}} value={prof.role} onChange={e=>Store.setProfile({role:e.target.value})} />
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Tagline</h4><p>That hand-lettered note under your name</p></div>
              <input className="input" style={{maxWidth:240, fontFamily:'var(--font-hand)', fontSize:17, color:'var(--teal-deep)'}} value={prof.tagline} maxLength={48} onChange={e=>Store.setProfile({tagline:e.target.value})} />
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4 style={{color:'#B05050'}}>{Store.mode === 'supabase' ? 'Sign out' : 'Reset Rehab.Wisal'}</h4><p>{Store.mode === 'supabase' ? 'Sign out of Rehab.Wisal on this device' : 'Clear all your posts, reactions, photos & profile changes on this device'}</p></div>
              <button className="btn btn-sm" style={{borderColor:'#E7B7B7', color:'#B05050'}} onClick={()=>Store.reset()}>{Store.mode === 'supabase' ? 'Sign out' : 'Reset data'}</button>
            </div>
          </>)}

          {section === 'privacy' && (<>
            <h3 style={{fontSize:20, marginBottom:18}}>Privacy & Pulse</h3>
            <div className="banner" style={{marginBottom:18}}>🔒 Rehab.Wisal is internal-only. Nothing here is indexed publicly or shared with outside services.</div>
            {T('pulse', 'Daily Pulse check-ins', 'Show me the mood prompt at the start of each shift')}
            {T('kudos', 'Public Bright Spots', "Allow coworkers to send me kudos publicly. (Private ones still work.)")}
            {T('capsule', 'Time Capsule reminders', 'Email me when a sealed capsule is about to open')}
            <div className="settings-row"><div><h4>Profile visibility</h4><p>Who can find me in search</p></div><span className="pill pill-teal">Whole hospital</span></div>
            <div className="settings-row"><div><h4>Patient win photos</h4><p>Default consent prompt for any Win Wall posts</p></div><span className="pill">Always ask</span></div>
          </>)}

          {section === 'shift' && (<>
            <h3 style={{fontSize:20, marginBottom:18}}>Shift & quiet hours</h3>
            {T('quietMode','Quiet during shift', "Mute non-urgent notifications when I'm clocked in")}
            {T('nightShift','Night-shift mode', 'Auto dark mode + softer pings between 8pm and 6am')}
            {T('away','Away today', "I'm off — pause Pulse, Bright Spot reminders, and group pings")}
            <div className="settings-row"><div><h4>My usual schedule</h4><p>Helps the app know when to nudge gently</p></div><span>Mon–Thu · 7am–4pm</span></div>
          </>)}

          {section === 'notifs' && (<>
            <h3 style={{fontSize:20, marginBottom:18}}>Notifications</h3>
            {T('digest', 'Weekly Friday digest', 'A wrap-up of the best moments + Win Wall posts')}
            <div className="settings-row"><div><h4>Bright Spots</h4></div><span>In-app + email</span></div>
            <div className="settings-row"><div><h4>Mentions</h4></div><span>In-app</span></div>
            <div className="settings-row"><div><h4>Events</h4></div><span>In-app · 1 day before</span></div>
            <div className="settings-row"><div><h4>Spotlight nomination</h4></div><span>In-app + email</span></div>
          </>)}

          {section === 'appearance' && (() => {
            const th = Store.theme();
            const curAccent = (th.accent && th.accent[0]) || null;
            const curFont = th.fontPair || 'jakarta';
            const curDensity = th.density || 'comfortable';
            const FONT_OPTS = [
              ['jakarta','Jakarta + Bricolage','warm, modern'],
              ['inter','Manrope + Fraunces','editorial'],
              ['dm','DM Sans + DM Serif','clean'],
              ['classic','Helvetica','classic'],
            ];
            const DENS_OPTS = [['compact','Compact'],['comfortable','Comfortable'],['spacious','Spacious']];
            return (<>
            <h3 style={{fontSize:20, marginBottom:6}}>Appearance</h3>
            <p style={{color:'var(--ink-soft)', fontSize:13.5, margin:'0 0 20px'}}>Personalize how Rehab.Wisal looks for you. Your choices are saved on this device.</p>

            <h4 style={{fontSize:14.5, marginBottom:4}}>Color theme</h4>
            <p style={{color:'var(--ink-soft)', fontSize:12.5, margin:'0 0 12px'}}>Tap a palette to recolor the whole app.</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(112px, 1fr))', gap:10, marginBottom:8}}>
              {(window.THEMES || []).map(tm => {
                const on = curAccent === tm.colors[0];
                return (
                  <button key={tm.id} onClick={() => Store.setTheme({ accent: tm.colors })} style={{
                    display:'flex', flexDirection:'column', gap:8, padding:10, cursor:'pointer',
                    borderRadius:14, background:'var(--paper)',
                    border:`2px solid ${on ? tm.colors[0] : 'var(--line)'}`,
                    boxShadow: on ? '0 4px 14px '+tm.colors[3] : 'none', transition:'all .15s',
                  }}>
                    <div style={{display:'flex', gap:4, alignItems:'center'}}>
                      <span style={{width:26, height:26, borderRadius:8, background:tm.colors[0]}}></span>
                      <span style={{width:16, height:26, borderRadius:6, background:tm.colors[1]}}></span>
                      <span style={{width:12, height:26, borderRadius:6, background:tm.colors[2]}}></span>
                      {on && <span style={{marginLeft:'auto', color:tm.colors[0], fontWeight:700}}>✓</span>}
                    </div>
                    <span style={{fontSize:12.5, fontWeight:600, color:'var(--navy)', textAlign:'left'}}>{tm.name}</span>
                  </button>
                );
              })}
            </div>
            {curAccent && <button className="btn btn-sm btn-ghost" style={{marginBottom:8}} onClick={() => Store.resetTheme()}>Reset to default</button>}

            <div className="divider" style={{margin:'20px 0'}}></div>

            <h4 style={{fontSize:14.5, marginBottom:10}}>Font style</h4>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:8}}>
              {FONT_OPTS.map(([id,label,desc]) => {
                const on = curFont === id;
                return (
                  <button key={id} onClick={() => Store.setTheme({ fontPair: id })} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                    borderRadius:12, background: on ? 'var(--teal-tint)' : 'var(--paper)',
                    border:`1.5px solid ${on ? 'var(--teal)' : 'var(--line)'}`,
                  }}>
                    <span style={{fontFamily: (window.FONTS && window.FONTS[id] ? window.FONTS[id].display : 'inherit'), fontSize:19, fontWeight:700, color:'var(--navy)', minWidth:34}}>Aa</span>
                    <span style={{flex:1}}><div style={{fontWeight:600, fontSize:14}}>{label}</div><div style={{fontSize:12, color:'var(--ink-soft)'}}>{desc}</div></span>
                    {on && <span style={{color:'var(--teal-deep)', fontWeight:700}}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="divider" style={{margin:'20px 0'}}></div>

            <h4 style={{fontSize:14.5, marginBottom:10, marginTop:0}}>Density</h4>
            <div style={{display:'flex', gap:8}}>
              {DENS_OPTS.map(([id,label]) => {
                const on = curDensity === id;
                return (
                  <button key={id} onClick={() => Store.setTheme({ density: id })} className={`pill ${on ? 'pill-teal' : ''}`}
                    style={{cursor:'pointer', padding:'8px 16px', border:`1.5px solid ${on ? 'var(--teal)' : 'var(--line)'}`}}>{label}</button>
                );
              })}
            </div>
            </>);
          })()}

          {section === 'team' && (() => {
            const crews = Store.crews();
            const team = (TEAMS[prof.team] || {}).label || prof.team;
            return (<>
              <h3 style={{fontSize:20, marginBottom:18}}>My team & crews</h3>
              <div className="settings-row">
                <div className="settings-row-info"><h4>Department</h4><p>Sets who counts as "my team" in your feed</p></div>
                <select className="input" style={{maxWidth:200}} value={prof.team} onChange={e=>Store.setProfile({team:e.target.value})}>
                  {Object.keys(TEAMS).map(k => <option key={k} value={k}>{TEAMS[k].label}</option>)}
                </select>
              </div>
              <div className="divider" style={{margin:'8px 0 18px'}}></div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                <h4 style={{fontSize:14.5}}>Your crews ({crews.length})</h4>
                <button className="btn btn-sm" onClick={()=>go && go('crews')}>Discover crews →</button>
              </div>
              {crews.length === 0 ? (
                <div className="card card-pad" style={{textAlign:'center', color:'var(--ink-soft)'}}>
                  You haven't joined any crews yet. <span style={{color:'var(--teal-deep)', fontWeight:600, cursor:'pointer'}} onClick={()=>go && go('crews')}>Find your people →</span>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:2}}>
                  {crews.map(c => (
                    <div key={c.id} className="crew-row" onClick={()=>go && go('crews')}>
                      <div className="crew-icon" style={{backgroundImage: c.photo?`url(${c.photo})`:undefined, backgroundSize:'cover', backgroundPosition:'center'}}>{!c.photo && c.emoji}</div>
                      <div className="crew-info">
                        <div className="crew-name">{c.name}</div>
                        <div className="crew-meta">{Store.crewMemberCount(c.id)} member{Store.crewMemberCount(c.id)!==1?'s':''}{c.created_by===Store.meId()?' · you own this':''}</div>
                      </div>
                      {c.created_by !== Store.meId() && <button className="btn btn-sm btn-ghost" onClick={(e)=>{e.stopPropagation(); Store.leaveCrew(c.id);}}>Leave</button>}
                    </div>
                  ))}
                </div>
              )}
            </>);
          })()}

          {section === 'help' && (<>
            <h3 style={{fontSize:20, marginBottom:18}}>Help & feedback</h3>
            <div className="banner" style={{marginBottom:18}}>🫶 Rehab.Wisal is built for and with your team — feedback shapes what gets built next.</div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Contact support</h4><p>Questions, bugs, or access issues</p></div>
              <a className="btn btn-sm" href="mailto:support@rehabwisal.org">Email support</a>
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Send feedback or a feature idea</h4><p>Tell us what's working and what's missing</p></div>
              <a className="btn btn-sm btn-primary" href="mailto:feedback@rehabwisal.org?subject=Rehab.Wisal%20feedback">Send feedback</a>
            </div>
            <div className="settings-row">
              <div className="settings-row-info"><h4>Admin approvals</h4><p>{Store.isAdmin() ? 'You can review pending sign-ups' : 'Ask your administrator to approve new teammates'}</p></div>
              {Store.isAdmin() && <button className="btn btn-sm" onClick={()=>go && go('admin')}>Go to approvals →</button>}
            </div>
            <div className="settings-row"><div><h4>Version</h4></div><span className="pill">Rehab.Wisal · {Store.mode === 'supabase' ? 'connected' : 'local demo'}</span></div>
          </>)}
        </div>
      </div>
    </>
  );
};

Object.assign(window, {
  ComposerScreen, NotifsScreen, ChatScreen, SearchScreen, OnboardingScreen, SettingsScreen
});
