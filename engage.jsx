// MySalma — engagement features: The Daily One, today digest, Shift hub

const { useState: useEng } = React;

// ============================================================
//  THE DAILY ONE — daily prompt ritual (your answer persists)
// ============================================================
const DailyOne = () => {
  useStore();
  const idx = (Math.floor(Date.now() / 8.64e7)) % DAILY_PROMPTS.length;
  const prompt = DAILY_PROMPTS[idx];
  const saved = Store.dailyToday();
  const answered = !!saved;
  const [val, setVal] = useEng('');
  const answer = (v) => { if (v && v.trim()) Store.setDaily(v.trim()); };
  const quick = prompt.quick || null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
      borderRadius: 'var(--r-lg)', padding: 20, color: 'white', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{position:'absolute', top:-24, right:-12, fontSize:120, opacity:.08, lineHeight:1}}>{prompt.emoji}</div>
      <div style={{display:'flex', alignItems:'center', gap:8, position:'relative'}}>
        <span style={{fontFamily:'var(--font-hand)', fontSize:22, color:'var(--butter)', lineHeight:1}}>the daily one</span>
        <span className="pill" style={{background:'rgba(255,255,255,.12)', color:'rgba(255,255,255,.85)', fontSize:10.5, padding:'2px 8px'}}>resets at midnight</span>
      </div>
      <h2 style={{color:'white', fontSize:23, marginTop:10, lineHeight:1.15, maxWidth:'80%', position:'relative'}}>
        {prompt.emoji} {prompt.q}
      </h2>

      {!answered ? (
        <div style={{marginTop:16, position:'relative'}}>
          {quick && (
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:10}}>
              {quick.map(opt => (
                <button key={opt} onClick={() => answer(opt)} style={{
                  padding:'7px 14px', background:'rgba(255,255,255,.12)', color:'white',
                  border:'1px solid rgba(255,255,255,.2)', borderRadius:999, cursor:'pointer',
                  fontFamily:'inherit', fontWeight:600, fontSize:13
                }}>{opt}</button>
              ))}
            </div>
          )}
          <div style={{display:'flex', gap:8}}>
            <input className="input" value={val} onChange={e=>setVal(e.target.value)}
              placeholder={prompt.kind === 'word' ? 'one word…' : 'your answer…'}
              style={{background:'rgba(255,255,255,.1)', color:'white', border:'1px solid rgba(255,255,255,.2)'}}
              onKeyDown={e => { if (e.key === 'Enter') answer(val); }} />
            <button className="btn" style={{background:'var(--butter)', color:'#8C6A1A', borderColor:'var(--butter)', flexShrink:0}}
              onClick={() => answer(val)}>Answer</button>
          </div>
        </div>
      ) : (
        <div style={{marginTop:16, position:'relative'}}>
          <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center'}}>
            <span style={{display:'flex', alignItems:'center', gap:7, padding:'6px 14px 6px 5px', background:'var(--butter)', color:'#8C6A1A', borderRadius:999, fontWeight:700, fontSize:13.5}}>
              <Avatar person="me" size="sm" /> You: {saved}
            </span>
            <button onClick={() => Store.setDaily('')} style={{background:'transparent', border:0, color:'rgba(255,255,255,.6)', fontSize:12, cursor:'pointer', textDecoration:'underline'}}>change</button>
          </div>
          <div style={{marginTop:12, fontSize:12.5, color:'rgba(255,255,255,.7)'}}>
            Answered for today 🎉 — come back tomorrow for a new one.
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
//  TODAY — a real, data-driven welcome card (no fake activity)
// ============================================================
const TodayCard = ({ onCompose }) => {
  useStore();
  const name = Store.profile().name.split(' ')[0];
  const myPosts = Store.myPosts().length;
  const mood = Store.moodToday();
  const events = Store.events().filter(e => Store.isGoing(e.id)).length;
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:16, padding:'16px 18px',
      background:'linear-gradient(135deg, var(--teal-tint) 0%, var(--mint-soft) 100%)',
      border:'1px solid var(--teal-soft)', borderRadius:'var(--r-lg)'
    }}>
      <div style={{width:46, height:46, borderRadius:12, background:'var(--paper)', display:'grid', placeItems:'center', fontSize:24, flexShrink:0}}>
        {mood ? MOODS.find(m=>m.id===mood)?.emoji : '👋'}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontWeight:700, color:'var(--navy)', fontSize:15}}>Welcome back, {name}.</div>
        <div style={{fontSize:13, color:'var(--ink-soft)', marginTop:2}}>
          {myPosts > 0
            ? <>You've shared <strong style={{color:'var(--teal-deep)'}}>{myPosts} moment{myPosts!==1?'s':''}</strong>{events > 0 && <> · {events} event{events!==1?'s':''} on your calendar</>}. Keep the team's day a little brighter.</>
            : <>Your hospital's space is a blank canvas. Share the first moment to get things going.</>}
        </div>
      </div>
      <button className="btn btn-sm btn-primary" onClick={onCompose} style={{flexShrink:0}}>Share something</button>
    </div>
  );
};

// ============================================================
//  POST A SWAP — modal form
// ============================================================
const SwapForm = ({ onClose }) => {
  const prof = Store.profile();
  const [need, setNeed] = useEng('');
  const [offer, setOffer] = useEng('');
  const [note, setNote] = useEng('');
  const [urgency, setUrgency] = useEng('med');
  const [team, setTeam] = useEng(prof.team || 'PT');
  const lbl = { display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'14px 0 6px' };
  const submit = () => { if (!need.trim()) return; Store.addSwap({ need: need.trim(), offer: offer.trim() || 'Open to options', note: note.trim(), urgency, team }); onClose(); };
  return (
    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(20,36,71,.55)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', padding:20, zIndex:200}} onClick={onClose}>
      <div className="modal-sheet" style={{width:'min(520px,100%)', maxHeight:'90vh', overflow:'auto', background:'var(--cream)', borderRadius:24, padding:28, border:'1px solid var(--line)', boxShadow:'0 30px 60px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <h2 style={{fontSize:22}}>Post a shift swap</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="close"/></button>
        </div>
        <p style={{fontSize:13, color:'var(--ink-soft)', margin:0}}>Charge-nurse sign-off is still needed before any swap is final.</p>
        <label style={lbl}>Shift you need covered *</label>
        <input className="input" value={need} onChange={e=>setNeed(e.target.value)} placeholder="e.g. Thu May 22 · Night 7p–7a" />
        <label style={lbl}>What you can offer back</label>
        <input className="input" value={offer} onChange={e=>setOffer(e.target.value)} placeholder="e.g. Any Saturday AM, or I owe you one" />
        <label style={lbl}>A short note (optional)</label>
        <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. kid's recital 🎭" />
        <label style={lbl}>Your team</label>
        <select className="input" value={team} onChange={e=>setTeam(e.target.value)}>
          {Object.entries(TEAMS).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
        <label style={lbl}>Urgency</label>
        <div style={{display:'flex', gap:8}}>
          {Object.entries(URGENCY).map(([k,u]) => (
            <button key={k} onClick={()=>setUrgency(k)} className={`pill ${urgency===k ? u.cls : ''}`}
              style={{cursor:'pointer', border: urgency===k ? '1.5px solid currentColor' : '1.5px solid var(--line)'}}>{u.label}</button>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:20}}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!need.trim()} style={!need.trim()?{opacity:.5}:{}} onClick={submit}>Post swap</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  Shared empty-state block
// ============================================================
const EmptyState = ({ emoji, title, sub, action, onAction }) => (
  <div className="card card-pad" style={{textAlign:'center', padding:'48px 32px'}}>
    <div style={{fontSize:46, lineHeight:1}}>{emoji}</div>
    <h3 style={{fontSize:22, marginTop:14}}>{title}</h3>
    <p style={{color:'var(--ink-soft)', fontSize:14.5, maxWidth:420, margin:'8px auto 0', lineHeight:1.5}}>{sub}</p>
    {action && <button className="btn btn-primary" style={{marginTop:20}} onClick={onAction}>{action}</button>}
  </div>
);

// ============================================================
//  SHIFT HUB — Who's on now + Swap board + Lunch
// ============================================================
const ShiftScreen = () => {
  useStore();
  const [tab, setTab] = useEng('now');
  const [posting, setPosting] = useEng(false);
  const prof = Store.profile();
  const me = currentUser();
  const swaps = Store.swaps();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dayStr = now.toLocaleDateString([], { weekday: 'long' });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">right now</span> &nbsp;· {dayStr}, {timeStr}</div>
          <h1 className="page-title">On Shift</h1>
        </div>
        <div className="feed-tabs">
          <button className={`feed-tab ${tab==='now'?'active':''}`} onClick={()=>setTab('now')}>Who's on now</button>
          <button className={`feed-tab ${tab==='swap'?'active':''}`} onClick={()=>setTab('swap')}>Swap board{swaps.length ? ` · ${swaps.length}` : ''}</button>
          <button className={`feed-tab ${tab==='lunch'?'active':''}`} onClick={()=>setTab('lunch')}>Lunch roulette</button>
        </div>
      </div>

      {tab === 'now' && (() => {
        const mates = Store.teammates();
        const total = mates.length + 1;
        return (<>
        <div style={{display:'flex', gap:12, marginBottom:18, flexWrap:'wrap'}}>
          {[['👥', total, 'on the team', 'var(--teal-tint)'], ['☕', 0, 'on break', 'var(--butter-soft)'], ['🚪', 0, 'just arriving', 'var(--slate-tint)'], ['🏥', 1, 'floors active', 'var(--mint-soft)']].map(([e,n,l,bg],i)=>(
            <div key={i} className="card" style={{flex:1, minWidth:130, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, background:bg, border:'none'}}>
              <span style={{fontSize:24}}>{e}</span>
              <div><div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--navy)', lineHeight:1}}>{n}</div><div style={{fontSize:12, color:'var(--ink-soft)'}}>{l}</div></div>
            </div>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <span style={{width:9, height:9, borderRadius:'50%', background:'var(--teal)'}}></span>
          <span style={{fontFamily:'var(--font-display)', fontWeight:600, fontSize:15, color:'var(--navy)'}}>On the team</span>
          <span style={{fontSize:12.5, color:'var(--ink-soft)'}}>· {total}</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:10}}>
          <div className="card" style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:12}}>
            <Avatar person="me" size="md" status="online" />
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:600, fontSize:14, color:'var(--navy)'}}>{me.name} <span style={{fontWeight:400, color:'var(--ink-mute)', fontSize:12}}>· you</span></div>
              <div style={{fontSize:12, color:'var(--ink-soft)'}}>{me.role}</div>
            </div>
            <span className="pill pill-teal" style={{fontSize:11}}>You</span>
          </div>
          {mates.map(p => (
            <div key={p.id} className="card" style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:12}}>
              <Avatar person={p} size="md" status="online" />
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:14, color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.name}</div>
                <div style={{fontSize:12, color:'var(--ink-soft)'}}>{p.role || (TEAMS[p.team]||{}).label}</div>
              </div>
              <TeamPill team={p.team} mini />
            </div>
          ))}
        </div>
        {mates.length === 0 && (
          <div style={{marginTop:18}}>
            <EmptyState emoji="🏥" title="Your teammates will show up here"
              sub="As coworkers join MySalma they appear on this roster. With the live backend connected, this updates in real time as people sign in." />
          </div>
        )}
      </>); })()}

      {tab === 'swap' && (<>
        <div className="banner" style={{marginBottom:16}}>
          🔄 <span><strong>Swap board</strong> — post a shift you need covered, or pick up one of someone else's. All swaps need charge-nurse sign-off before they're final.</span>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10}}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {['All teams','My team','Needs cover','This week'].map((c,i)=><span key={c} className={`pill ${i===0?'pill-teal':''}`} style={{cursor:'pointer'}}>{c}</span>)}
          </div>
          <button className="btn btn-primary" onClick={()=>setPosting(true)}><Icon name="plus" size={16}/> Post a swap</button>
        </div>
        {swaps.length === 0 ? (
          <EmptyState emoji="🔄" title="No open swaps right now"
            sub="Need a shift covered? Post it here and the right person can pick it up — no more group-text chaos."
            action="Post a swap" onAction={()=>setPosting(true)} />
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14}}>
            {swaps.map((s) => {
              const u = URGENCY[s.urgency] || URGENCY.med;
              const covered = Store.isCovered(s.id);
              const mine = s.by === Store.meId() || s.by === 'me';
              const by = FIND(s.by);
              const covers = Store.coverCount(s.id);
              return (
                <div key={s.id} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:12}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <Avatar person={by} size="md" />
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:14, color:'var(--navy)'}}>{mine ? (by ? by.name : 'You') : (by ? by.name : 'Teammate')}{mine && <span style={{fontWeight:400, color:'var(--ink-mute)', fontSize:12}}> · you</span>}</div>
                      <div style={{fontSize:12, color:'var(--ink-soft)'}}>{(TEAMS[s.team]||{}).label || ''}</div>
                    </div>
                    <span className={`pill ${u.cls}`}>{u.label}</span>
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <div style={{flex:1, padding:'10px 12px', background:'var(--blush-soft)', borderRadius:12}}>
                      <div style={{fontSize:10.5, fontWeight:700, letterSpacing:0.04, textTransform:'uppercase', color:'#B05050'}}>needs covered</div>
                      <div style={{fontSize:13, fontWeight:600, color:'var(--navy)', marginTop:3}}>{s.need}</div>
                    </div>
                    <div style={{display:'grid', placeItems:'center', color:'var(--ink-mute)'}}><Icon name="swap" size={18}/></div>
                    <div style={{flex:1, padding:'10px 12px', background:'var(--mint-soft)', borderRadius:12}}>
                      <div style={{fontSize:10.5, fontWeight:700, letterSpacing:0.04, textTransform:'uppercase', color:'var(--teal-deep)'}}>offers back</div>
                      <div style={{fontSize:13, fontWeight:600, color:'var(--navy)', marginTop:3}}>{s.offer}</div>
                    </div>
                  </div>
                  {s.note && <div style={{fontSize:13, color:'var(--ink-soft)', fontStyle:'italic'}}>"{s.note}"</div>}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto'}}>
                    {mine ? (
                      <>
                        <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.deleteSwap(s.id)}>Remove</button>
                        <span style={{fontSize:12, color:'var(--ink-soft)'}}>{covers > 0 ? `${covers} can cover 🎉` : 'Waiting for cover…'}</span>
                      </>
                    ) : (
                      <>
                        <span style={{fontSize:12, color:'var(--ink-soft)'}}>{covers > 0 ? `${covers} offered` : 'Be the first to help'}</span>
                        <button className={`btn btn-sm ${covered ? '' : 'btn-primary'}`} onClick={()=>Store.toggleCovered(s.id)}>{covered ? '✓ Offered' : 'I can cover'}</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {posting && <SwapForm onClose={()=>setPosting(false)} />}
      </>)}

      {tab === 'lunch' && (
        <div style={{maxWidth:560}}>
          <div className="card card-pad" style={{textAlign:'center', padding:32, background:'linear-gradient(135deg, var(--peach-soft) 0%, var(--butter-soft) 100%)', border:'none'}}>
            <div style={{fontSize:48}}>🍜</div>
            <h2 style={{fontSize:24, marginTop:8}}>Don't eat alone today</h2>
            <p style={{color:'var(--ink-soft)', fontSize:14, maxWidth:400, margin:'8px auto 0'}}>Set yourself "on break" and Lunch Roulette will match you with whoever else is free — so no one eats alone. Live matching turns on once your team's on MySalma.</p>
            <button className="btn btn-primary" style={{padding:'12px 28px', marginTop:18}}>🎲 I'm free for lunch</button>
            <div style={{fontSize:12, color:'var(--ink-soft)', marginTop:12}}>Cafeteria · OT Lounge · Courtyard</div>
          </div>
        </div>
      )}
    </>
  );
};

Object.assign(window, { DailyOne, TodayCard, ShiftScreen, SwapForm, EmptyState });
