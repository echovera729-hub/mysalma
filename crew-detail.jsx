// MySalma — Crew detail: wall, events, chat, member + owner admin controls

const { useState: useStateCrew } = React;

const CrewWall = ({ crewId }) => {
  useStore();
  const [draft, setDraft] = useStateCrew('');
  const posts = Store.crewPosts(crewId);
  const post = () => { if (draft.trim()) { Store.addPost({ body: draft.trim(), crewId }); setDraft(''); } };
  return (
    <>
      <div className="composer-trigger" style={{cursor:'default', marginBottom:18}}>
        <Avatar person="me" size="md" />
        <input className="input" style={{border:0, background:'transparent', flex:1, fontSize:15, padding:0}}
          placeholder="Share something with the crew…" value={draft}
          onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') post();}} />
        <button className="btn btn-primary btn-sm" disabled={!draft.trim()} style={!draft.trim()?{opacity:.5}:{}} onClick={post}>Post</button>
      </div>
      {posts.length === 0 ? (
        <EmptyState emoji="💬" title="No posts yet" sub="Be the first to share something with this crew." />
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {posts.map(p => <Post key={p.id} post={p} />)}
        </div>
      )}
    </>
  );
};

const CrewEvents = ({ crewId }) => {
  useStore();
  const [creating, setCreating] = useStateCrew(false);
  const events = Store.crewEvents(crewId).slice().sort((a,b)=>(a.d||99)-(b.d||99));
  return (
    <>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:14}}>
        <button className="btn btn-primary btn-sm" onClick={()=>setCreating(true)}><Icon name="plus" size={15}/> New crew event</button>
      </div>
      {events.length === 0 ? (
        <EmptyState emoji="📅" title="No crew events yet" sub="Plan something just for this crew." />
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {events.map(e => (
            <div key={e.id} className="event-card">
              {e.image
                ? <div className="event-banner event-banner-img" style={{backgroundImage:`url(${e.image})`}}><div className="event-banner-d">{e.d || '·'}</div><div className="event-banner-m">{e.m}</div></div>
                : <div className={`event-banner ${e.color}`}><div className="event-banner-d">{e.d || '·'}</div><div className="event-banner-m">{e.m}</div></div>}
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
                    <span className="muted">hosted by <strong style={{color:'var(--navy)'}}>{e.host === Store.meId() ? 'you' : (FIND(e.host)||{}).first || 'a teammate'}</strong></span>
                  </span>
                  <div style={{display:'flex', gap:6}}>
                    {e.host === Store.meId() && <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.deleteEvent(e.id)}>Delete</button>}
                    <button className={`btn btn-sm ${Store.isGoing(e.id) ? '' : 'btn-primary'}`} onClick={() => Store.toggleGoing(e.id)}>{Store.isGoing(e.id) ? '✓ Going' : 'Going'}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {creating && <EventForm crewId={crewId} onClose={()=>setCreating(false)} />}
    </>
  );
};

const CrewChat = ({ crewId }) => {
  useStore();
  const [draft, setDraft] = useStateCrew('');
  const msgs = Store.messagesWith(crewId);
  const bodyRef = React.useRef(null);
  React.useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs.length]);
  const send = () => { if (draft.trim()) { Store.sendMessage(crewId, draft.trim()); setDraft(''); } };
  return (
    <div className="chat-thread" style={{border:'1px solid var(--line)', borderRadius:'var(--r-lg)', background:'var(--paper)', minHeight:440}}>
      <div className="chat-body" ref={bodyRef} style={{minHeight:340}}>
        {msgs.length === 0 ? (
          <div style={{margin:'auto', textAlign:'center', color:'var(--ink-soft)', maxWidth:280}}>
            <div style={{fontSize:38}}>💬</div>
            <div style={{marginTop:8, fontSize:14}}>Start the conversation with this crew.</div>
          </div>
        ) : msgs.map(m => {
          const mine = m.sender === Store.meId();
          const sender = FIND(m.sender);
          return (
            <div key={m.id} className={`chat-msg ${mine ? 'me' : ''}`}>
              {!mine && <Avatar person={sender} size="sm" />}
              <div>
                {!mine && <div style={{fontSize:11, color:'var(--ink-soft)', margin:'0 0 2px 4px', fontWeight:600}}>{sender ? sender.first : 'Teammate'}</div>}
                <div className="chat-bubble">{m.text}</div>
                <div style={{fontSize:10.5, color:'var(--ink-soft)', marginTop:3, padding:'0 4px', textAlign: mine ? 'right' : 'left'}}>{timeAgo(m.created_at)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input">
        <input className="input" placeholder="Message the crew…" value={draft} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }} />
        <button className="btn btn-primary btn-icon" onClick={send}><Icon name="send" size={16}/></button>
      </div>
    </div>
  );
};

const CrewEditForm = ({ crew, onClose }) => {
  const [name, setName] = useStateCrew(crew.name);
  const [description, setDescription] = useStateCrew(crew.description || '');
  const [photo, setPhoto] = useStateCrew(crew.photo || null);
  const fileRef = React.useRef(null);
  const pick = async (file) => { if (!file) return; try { setPhoto(await readScaledImage(file, 900)); } catch (e) {} };
  const save = () => { Store.updateCrew(crew.id, { name: name.trim() || crew.name, description: description.trim(), photo }); onClose(); };
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(480px,100%)', maxHeight:'90vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:28, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <h2 style={{fontSize:20}}>Edit crew</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>pick(e.target.files[0])} />
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
          <div className="crew-icon" style={{width:56, height:56, fontSize:26, backgroundImage: photo?`url(${photo})`:undefined, backgroundSize:'cover', backgroundPosition:'center'}}>{!photo && crew.emoji}</div>
          <button className="btn btn-sm" onClick={()=>fileRef.current && fileRef.current.click()}>{photo ? 'Change photo' : 'Add photo'}</button>
          {photo && <button className="btn btn-sm btn-ghost" onClick={()=>setPhoto(null)}>Remove</button>}
        </div>
        <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', marginBottom:6}}>Name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        <label style={{display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'14px 0 6px'}}>Description</label>
        <textarea className="input" value={description} onChange={e=>setDescription(e.target.value)} rows={3} style={{resize:'vertical', fontFamily:'inherit'}} />
        <div style={{display:'flex', justifyContent:'space-between', marginTop:20}}>
          <button className="btn btn-sm" style={{color:'#B05050'}} onClick={()=>{ if (confirm('Delete this crew for everyone?')) { Store.deleteCrew(crew.id); onClose(); } }}>Delete crew</button>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CrewDetailScreen = ({ crewId, onBack }) => {
  useStore();
  const [tab, setTab] = useStateCrew('wall');
  const [editing, setEditing] = useStateCrew(false);
  const crew = Store.crewById(crewId);
  if (!crew) { onBack(); return null; }
  const owner = Store.isCrewOwner(crewId);
  const members = Store.crewMembers(crewId);

  return (
    <>
      <button className="btn btn-sm btn-ghost" style={{marginBottom:14}} onClick={onBack}><Icon name="back" size={15}/> All crews</button>

      <div className="card card-pad" style={{display:'flex', gap:16, alignItems:'center', marginBottom:18, flexWrap:'wrap'}}>
        <div className="crew-icon" style={{width:64, height:64, fontSize:30, borderRadius:16, backgroundImage: crew.photo?`url(${crew.photo})`:undefined, backgroundSize:'cover', backgroundPosition:'center'}}>{!crew.photo && crew.emoji}</div>
        <div style={{flex:1, minWidth:200}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--navy)'}}>{crew.name}</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:2}}>{crew.description || 'No description yet.'}</div>
          <div style={{fontSize:12, color:'var(--ink-soft)', marginTop:6}}>{members.length} member{members.length!==1?'s':''}</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          {owner && <button className="btn btn-sm" onClick={()=>setEditing(true)}><Icon name="settings" size={14}/> Manage</button>}
          {!owner && <button className="btn btn-sm btn-ghost" onClick={()=>{ Store.leaveCrew(crewId); onBack(); }}>Leave crew</button>}
        </div>
      </div>

      <div className="profile-tabs">
        {['wall','events','chat','members'].map(t => (
          <div key={t} className={`profile-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      {tab === 'wall' && <CrewWall crewId={crewId} />}
      {tab === 'events' && <CrewEvents crewId={crewId} />}
      {tab === 'chat' && <CrewChat crewId={crewId} />}
      {tab === 'members' && (
        <div style={{display:'flex', flexDirection:'column', gap:2}}>
          {members.map(m => (
            <div key={m.id} className="crew-row" style={{cursor:'default'}}>
              <Avatar person={m} size="md" />
              <div className="crew-info">
                <div className="crew-name">{m.name}{m.id===Store.meId() && ' (you)'}</div>
                <div className="crew-meta">{m.role}{crew.created_by===m.id ? ' · Crew owner' : ''}</div>
              </div>
              {owner && m.id !== Store.meId() && (
                <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.removeCrewMember(crewId, m.id)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && <CrewEditForm crew={crew} onClose={()=>setEditing(false)} />}
    </>
  );
};

Object.assign(window, { CrewDetailScreen });
