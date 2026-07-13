// MySalma — feed + post variants (Home)

const { useState } = React;

// Render uploaded (src) or placeholder (tone/label) media
const MediaTile = ({ m, className, style }) =>
  m.src
    ? <div className={className} style={{ ...style, backgroundImage:`url(${m.src})`, backgroundSize:'cover', backgroundPosition:'center' }} />
    : <ImgPh tone={m.tone} label={m.label} className={className} style={style} />;

// ============================================================
//  POST card (Cards layout — default)
// ============================================================
const Post = ({ post }) => {
  useStore();
  const author = FIND(post.author);
  const id = post.id;

  const display = Store.countsFor(id);
  const userReacts = Store.reactsFor(id);
  const total = Object.values(display).reduce((s, n) => s + n, 0);

  const liked = userReacts.includes('❤️');
  const starred = userReacts.includes('✦');
  const saved = Store.isSaved(id);
  const comments = Store.commentsFor(id);
  const commentCount = comments.length;
  const isMine = post.author === Store.meId() || post.author === 'me' || post.author === 'sara';

  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState('');
  const [menu, setMenu] = useState(false);

  let wrapStyle = {};
  if (post.featured === 'kudos') wrapStyle = { background: 'linear-gradient(135deg, #FBF7E7 0%, #FFFCF5 60%)', borderColor: '#F0E5C0' };
  if (post.featured === 'win')   wrapStyle = { background: 'linear-gradient(135deg, var(--mint-soft) 0%, #F4FBF7 70%)', borderColor: 'var(--mint)' };
  if (post.featured === 'soft')  wrapStyle = { background: 'linear-gradient(135deg, var(--blush-soft) 0%, #FFF8F7 70%)', borderColor: 'var(--blush)' };

  const sendComment = () => { if (draft.trim()) { Store.addComment(id, draft.trim()); setDraft(''); } };
  const myFirst = Store.profile().name.split(/\s+/)[0];
  const mentionsMe = Store.settings().notifMentions && post.body && !isMine &&
    new RegExp('@' + myFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(post.body);

  return (
    <article className="post" style={wrapStyle}>
      <div className="post-header">
        <Avatar person={author} size="md" />
        <div className="post-meta">
          <div className="post-author">{author.name.replace(' (You)','')}{isMine && <span style={{fontWeight:400, color:'var(--ink-mute)', fontSize:12}}> · you</span>}</div>
          <div className="post-sub">
            <TeamPill team={author.team} mini />
            <span className="dot"></span>
            <span>{post.when || timeAgo(post.created_at)}</span>
            {post.featured === 'win' && <><span className="dot"></span><span style={{color:'var(--teal-deep)', fontWeight:600}}>✦ Win Wall</span></>}
            {post.featured === 'kudos' && <><span className="dot"></span><span style={{color:'#8C6A1A', fontWeight:600}}>✦ Bright Spot</span></>}
            {post.capsule && <><span className="dot"></span><span style={{color:'#524FA3', fontWeight:600}}>⏳ Capsule · {post.capsule}</span></>}
            {mentionsMe && <><span className="dot"></span><span style={{color:'var(--teal-deep)', fontWeight:600}}>🔔 You were mentioned</span></>}
          </div>
        </div>
        <div style={{position:'relative'}}>
          <button className="btn btn-icon btn-ghost" onClick={() => setMenu(m => !m)}><Icon name="more"/></button>
          {menu && (
            <div style={{position:'absolute', top:'100%', right:0, zIndex:20, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, boxShadow:'var(--shadow-md)', padding:6, minWidth:150}}>
              <button className="post-foot-btn" style={{width:'100%', justifyContent:'flex-start'}} onClick={() => { Store.toggleSave(id); setMenu(false); }}>
                <Icon name="bookmark"/> {saved ? 'Unsave' : 'Save post'}
              </button>
              <button className="post-foot-btn" style={{width:'100%', justifyContent:'flex-start', color:'#B05050'}} onClick={() => { Store.deletePost(id); setMenu(false); }}>
                <Icon name="close"/> {(isMine || Store.isManager()) ? 'Delete' : 'Hide'} post
              </button>
            </div>
          )}
        </div>
      </div>

      {post.body && (
        <div className="post-body" dangerouslySetInnerHTML={{__html: post.body
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/@(\w+)/g, (_, n) => {
            const p = FIND(n); return p ? `<a style="color:var(--teal-deep); font-weight:600; text-decoration:none;">@${p.first}</a>` : '@'+n;
          })
        }} />
      )}

      {((post.kudos_names || post.kudosNames)?.length || post.kudosTo?.length) > 0 && (
        <div style={{padding: '0 18px 14px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(245,221,157,.22)', borderRadius:12, border:'1px solid #F0E5C0', flexWrap:'wrap'}}>
            <span style={{fontSize:18}}>✦</span>
            <span style={{fontSize:13, color:'#8C6A1A', fontWeight:600}}>Bright Spot to:</span>
            <span style={{fontSize:13, color:'var(--navy)', fontWeight:600}}>{((post.kudos_names || post.kudosNames) || (post.kudosTo || []).map(p => FIND(p)?.first || p)).join(' & ')}</span>
            {(post.kudos_tag || post.kudosTag) && <span className="pill pill-butter" style={{fontSize:11}}>✦ {post.kudos_tag || post.kudosTag}</span>}
          </div>
        </div>
      )}

      {(post.place || post.mood_tag) && (
        <div style={{padding: '0 18px 10px', display:'flex', gap:8, flexWrap:'wrap'}}>
          {post.place && <span className="pill pill-slate" style={{fontSize:12}}><Icon name="location" size={12}/> {post.place}</span>}
          {post.mood_tag && (() => { const m = MOODS.find(x=>x.id===post.mood_tag); return m ? <span className="pill pill-butter" style={{fontSize:12}}>{m.emoji} {m.label}</span> : null; })()}
        </div>
      )}

      {post.video_url && (
        <div style={{padding: '0 18px 14px'}}>
          <a href={post.video_url} target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--navy)', borderRadius:12, textDecoration:'none'}}>
            <div style={{width:38, height:38, borderRadius:10, background:'rgba(255,255,255,.15)', display:'grid', placeItems:'center', color:'white', flexShrink:0}}><Icon name="video" size={18}/></div>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:600, fontSize:13.5, color:'white'}}>Watch</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,.7)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{post.video_url}</div>
            </div>
          </a>
        </div>
      )}

      {post.poll && (() => {
        const totalVotes = post.poll.options.reduce((s,o)=>s+(o.votes||[]).length, 0);
        const myVote = Store.myPollVote(post.id);
        return (
          <div style={{padding: '0 18px 14px'}}>
            <div style={{padding:14, background:'#F1EEFA', borderRadius:12, border:'1px solid var(--lavender)'}}>
              <div style={{fontWeight:600, fontSize:14, color:'var(--navy)', marginBottom:10}}>{post.poll.question}</div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {post.poll.options.map((o, i) => {
                  const count = (o.votes || []).length;
                  const pct = totalVotes ? Math.round(count / totalVotes * 100) : 0;
                  const mine = myVote === i;
                  return (
                    <button key={i} onClick={() => Store.votePoll(post.id, i)} style={{
                      position:'relative', textAlign:'left', padding:'8px 12px', borderRadius:10, cursor:'pointer',
                      border: `1.5px solid ${mine ? '#524FA3' : 'var(--lavender)'}`, background:'var(--paper)', overflow:'hidden'
                    }}>
                      <div style={{position:'absolute', inset:0, width: pct+'%', background:'#E6E1F6', zIndex:0}} />
                      <div style={{position:'relative', display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'var(--navy)'}}>
                        <span>{mine ? '✓ ' : ''}{o.text}</span>
                        <span>{pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:11.5, color:'var(--ink-soft)', marginTop:8}}>{totalVotes} vote{totalVotes!==1?'s':''}</div>
            </div>
          </div>
        );
      })()}

      {post.eventChip && (
        <div style={{padding: '0 18px 14px'}}>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--peach-soft)', borderRadius:12, border:'1px solid #F3D7BA'}}>
            <div style={{width:42, height:42, borderRadius:10, background:'var(--peach)', display:'grid', placeItems:'center', color:'white', fontFamily:'var(--font-display)', fontWeight:700, lineHeight:1, textAlign:'center'}}>
              <div><div style={{fontSize:16}}>17</div><div style={{fontSize:9, letterSpacing:.06, marginTop:1}}>MAY</div></div>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:600, fontSize:14, color:'var(--navy)'}}>{post.eventChip}</div>
              <div style={{fontSize:12, color:'var(--ink-soft)'}}>34 people going · 8 maybe</div>
            </div>
            <button className="btn btn-sm btn-primary">Going</button>
          </div>
        </div>
      )}

      {post.media && post.media.length > 0 && (
        <div className="post-media">
          {post.media.length === 1 ? (
            <MediaTile m={post.media[0]} className="post-media-img" style={{aspectRatio:'16/10'}} />
          ) : (
            <div className={`post-media-grid ${post.layout || 'g'+Math.min(post.media.length,3)}`}>
              {post.media.slice(0,4).map((m, i) => <MediaTile key={i} m={m} />)}
            </div>
          )}
          {post.featured === 'win' && <div className="post-media-tag">✦ Win Wall · Consented</div>}
        </div>
      )}

      <div className="post-foot">
        <div className="post-reactions">
          {total > 0 && <Reactions map={display} total={total} />}
          {commentCount > 0 && <span style={{fontSize:12.5, color:'var(--ink-soft)', marginLeft: total>0?4:0, cursor:'pointer'}} onClick={()=>setShowComments(true)}>{commentCount} comment{commentCount!==1?'s':''}</span>}
        </div>
        <button className={`post-foot-btn ${liked ? 'liked' : ''}`} onClick={() => Store.toggleReaction(id, '❤️')}>
          <Icon name="heart"/> <span className="pfb-label">{liked ? 'Loved' : 'Love'}</span>
        </button>
        <button className="post-foot-btn" onClick={() => setShowComments(s => !s)}><Icon name="comment"/> <span className="pfb-label">Reply</span></button>
        <button className={`post-foot-btn ${starred ? 'liked' : ''}`} onClick={() => Store.toggleReaction(id, '✦')}><Icon name="star"/> <span className="pfb-label">Bright Spot</span></button>
        <button className="post-foot-btn" style={saved ? {color:'var(--teal-deep)'} : {}} onClick={() => Store.toggleSave(id)}><Icon name="bookmark"/></button>
      </div>

      {showComments && (
        <div style={{padding:'4px 18px 16px', borderTop:'1px solid var(--line-soft)'}}>
          {comments.map((c) => {
            const ca = FIND(c.user_id);
            const mine = c.user_id === Store.meId();
            return (
              <div key={c.id} style={{display:'flex', gap:10, marginTop:12}}>
                <Avatar person={ca} size="sm" />
                <div style={{background:'var(--cream)', borderRadius:14, padding:'8px 12px', flex:1}}>
                  <div style={{fontWeight:600, fontSize:13, color:'var(--navy)'}}>{mine ? 'You' : (ca ? ca.name : 'Teammate')} <span style={{fontWeight:400, color:'var(--ink-mute)', fontSize:11}}>· {c.when || timeAgo(c.created_at)}</span></div>
                  <div style={{fontSize:13.5, color:'var(--ink)'}}>{c.text}</div>
                </div>
              </div>
            );
          })}
          <div style={{display:'flex', gap:10, marginTop:12, alignItems:'center'}}>
            <Avatar person="me" size="sm" />
            <input className="input" placeholder="Write a kind reply…" value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendComment(); }}
              style={{borderRadius:'var(--r-pill)'}} />
            <button className="btn btn-primary btn-icon" onClick={sendComment}><Icon name="send" size={15}/></button>
          </div>
        </div>
      )}
    </article>
  );
};

// ============================================================
//  Mood Pulse — daily check-in (persists)
// ============================================================
const PulseCheckin = () => {
  useStore();
  const mood = Store.moodToday();
  const name = Store.profile().name.split(' ')[0];
  const weekTally = Store.myMoodTally(7);
  return (
    <div className="pulse-card">
      <div className="pulse-label">Hey {name} — how's your shift starting?</div>
      <div className="pulse-sub">Your mood is private to the Pulse aggregate — only the team's <em style={{color:'var(--teal-deep)'}}>vibe shape</em> is shared.</div>
      <div className="pulse-moods">
        {MOODS.map(m => (
          <button key={m.id} className={`mood-chip ${mood === m.id ? 'selected' : ''}`} onClick={() => Store.setMood(mood === m.id ? null : m.id)}>
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-name">{m.label}</span>
          </button>
        ))}
      </div>
      {mood && (
        <div style={{marginTop:12, padding:'10px 12px', background:'var(--paper)', borderRadius:12, fontSize:13, color:'var(--navy)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          <span style={{fontSize:18}}>{MOODS.find(m=>m.id===mood).emoji}</span>
          <span>Logged for today, thank you.</span>
          {weekTally.length > 0 && (
            <span style={{color:'var(--ink-soft)'}}>
              Your last 7 days: {weekTally.map(t => `${MOODS.find(m=>m.id===t.mood)?.emoji || ''} ×${t.count}`).join(' · ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
//  Stories rail
// ============================================================
const Stories = ({ onCreate }) => (
  <div className="stories">
    <div className="story story-create" onClick={()=>onCreate()}>
      <div className="story-create-icon">+</div>
      <div className="story-create-text">Your<br/>Moment</div>
    </div>
    {STORIES.map((s, i) => {
      const author = FIND(s.author);
      return (
        <div key={i} className={`story ${s.unread ? 'unread' : ''}`}
             style={{background: `linear-gradient(0deg, rgba(20,36,71,.4), rgba(20,36,71,.1)), repeating-linear-gradient(135deg, ${
              {peach:'#FBE5D3', mint:'#E0F1EA', lavender:'#ECEAF7', navy:'#2A3D6B', butter:'#FBF1D2', teal:'#D9EBE8'}[s.tone]
             } 0 8px, ${
              {peach:'#FCEEDD', mint:'#EFF8F3', lavender:'#F5F3FB', navy:'#1F2F5C', butter:'#FCF7E2', teal:'#EEF6F4'}[s.tone]
             } 8px 16px)`}}>
          <div className="story-avatar"><Avatar person={author} size="sm" /></div>
          <div className="story-content">
            <div className="story-author">{author.first}</div>
            <div style={{fontSize:9.5, fontFamily:'var(--font-mono)', opacity:.85, letterSpacing:0.04}}>{s.label}</div>
          </div>
        </div>
      );
    })}
  </div>
);

// ============================================================
//  Composer trigger
// ============================================================
const ComposerTrigger = ({ onClick }) => {
  const name = Store.profile().name.split(' ')[0];
  return (
    <div className="composer-trigger">
      <Avatar person="me" size="md" />
      <div className="composer-trigger-input" style={{cursor:'pointer'}} onClick={()=>onClick()}>Hey {name} — what's a bright spot from today? ✨</div>
      <div className="composer-trigger-actions">
        <span className="composer-action" style={{color:'var(--teal-deep)', cursor:'pointer'}} onClick={()=>onClick('moment')}><Icon name="image" size={16}/> Photo</span>
        <span className="composer-action" style={{color:'#B86833', cursor:'pointer'}} onClick={()=>onClick('kudos')}><Icon name="star" size={16}/> Kudos</span>
        <span className="composer-action" style={{color:'#524FA3', cursor:'pointer'}} onClick={()=>onClick('capsule')}><Icon name="capsule" size={16}/> Capsule</span>
      </div>
    </div>
  );
};

// ============================================================
//  MAGAZINE feed
// ============================================================
const MagazinePost = ({ post }) => {
  const author = FIND(post.author);
  return (
    <div className="mag-card">
      {post.media && post.media[0] ? (
        <MediaTile m={post.media[0]} className="mag-card-img" />
      ) : (
        <ImgPh tone={post.featured === 'kudos' ? 'butter' : post.featured === 'win' ? 'mint' : 'lavender'}
               label={post.featured === 'kudos' ? 'BRIGHT SPOT' : post.featured === 'win' ? 'WIN WALL' : 'POST'}
               className="mag-card-img" />
      )}
      <div className="mag-card-body">
        <div style={{display:'flex', gap:6}}>
          <TeamPill team={author.team} mini />
          {post.featured === 'win' && <span className="pill pill-mint">✦ Win</span>}
          {post.featured === 'kudos' && <span className="pill pill-butter">✦ Bright Spot</span>}
        </div>
        <div className="mag-card-title">{(post.body||'A new moment').replace(/\*\*|\*/g, '').slice(0, 80)}{(post.body||'').length > 80 ? '…' : ''}</div>
        <div className="mag-card-foot">
          <span style={{display:'flex', alignItems:'center', gap:6}}>
            <Avatar person={author} size="sm" /> {author.first}
          </span>
          <span>❤️ {Object.values(post.reactions||{}).reduce((a,b)=>a+b,0)} · 💬 {post.comments||0}</span>
        </div>
      </div>
    </div>
  );
};

const MagazineFeed = ({ posts }) => {
  const hero = posts[0];
  if (!hero) return null;
  const author = FIND(hero.author);
  const heroTone = hero.media?.[0]?.tone === 'mint' ? '#B7DDD0' : '#FBE5D3';
  const heroBg = hero.media?.[0]?.src
    ? `linear-gradient(0deg, rgba(20,36,71,.5), rgba(20,36,71,.1)), url(${hero.media[0].src}) center/cover`
    : `repeating-linear-gradient(135deg, ${heroTone} 0 12px, ${hero.media?.[0]?.tone === 'mint' ? '#C8E6DD' : '#FCEEDD'} 12px 24px)`;
  return (
    <div className="mag-grid">
      <div className="mag-hero" style={{background: heroBg}}>
        <div className="mag-hero-text">
          <span className="mag-hero-tag">{hero.featured === 'win' ? '✦ Win Wall' : 'Featured'}</span>
          <h2>{(hero.body||'A new moment').replace(/\*\*|\*/g, '').split('.')[0]}.</h2>
          <div className="mag-by">{author.name.replace(' (You)','')} · {author.role} · {hero.when}</div>
        </div>
      </div>
      {posts.slice(1, 7).map(p => <MagazinePost key={p.id} post={p} />)}
    </div>
  );
};

// ============================================================
//  MINIMAL feed (single-column)
// ============================================================
const MinimalFeed = ({ posts }) => (
  <div className="feed-minimal" style={{display:'flex', flexDirection:'column'}}>
    {posts.map(p => <Post key={p.id} post={p} />)}
  </div>
);

Object.assign(window, { Post, MediaTile, PulseCheckin, Stories, ComposerTrigger, MagazineFeed, MinimalFeed });
