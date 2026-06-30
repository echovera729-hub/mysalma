// MySalma — membership gate screens + admin approvals
// (only meaningful in Supabase multi-user mode)

const { useState: useAdminState } = React;

// ─────────────────────────────────────────────────────────────
//  Shown to a signed-in user whose account is still PENDING
// ─────────────────────────────────────────────────────────────
const PendingScreen = () => {
  useStore();
  const name = (Store.profile().name || '').split(' ')[0];
  return (
    <div className="onboard">
      <div className="onboard-card" style={{maxWidth:460, textAlign:'center'}}>
        <div className="brand-mark" style={{width:56, height:56, fontSize:24, margin:'0 auto'}}>R<span style={{opacity:.7}}>W</span></div>
        <div style={{fontSize:42, marginTop:18}}>⏳</div>
        <h2 className="onboard-title" style={{fontSize:26, marginTop:10}}>You're on the list{name ? `, ${name}` : ''}!</h2>
        <p className="onboard-sub" style={{maxWidth:380, margin:'8px auto 0'}}>
          Your account is waiting for an administrator to approve it. This keeps Rehab.Wisal to verified hospital staff only.
        </p>
        <div className="banner" style={{marginTop:20, textAlign:'left'}}>
          🔔 You'll get straight in the moment you're approved — this page updates automatically, no need to refresh.
        </div>
        <button className="btn" style={{marginTop:20}} onClick={() => Store.signOut()}>Sign out</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Shown to a user whose account was REJECTED
// ─────────────────────────────────────────────────────────────
const RejectedScreen = () => {
  useStore();
  return (
    <div className="onboard">
      <div className="onboard-card" style={{maxWidth:460, textAlign:'center'}}>
        <div className="brand-mark" style={{width:56, height:56, fontSize:24, margin:'0 auto'}}>R<span style={{opacity:.7}}>W</span></div>
        <div style={{fontSize:42, marginTop:18}}>🚪</div>
        <h2 className="onboard-title" style={{fontSize:26, marginTop:10}}>Access not granted</h2>
        <p className="onboard-sub" style={{maxWidth:380, margin:'8px auto 0'}}>
          This account wasn't approved for Rehab.Wisal. If you think that's a mistake, reach out to your administrator and they can re-approve you.
        </p>
        <button className="btn" style={{marginTop:20}} onClick={() => Store.signOut()}>Sign out</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  ADMIN — member approvals
// ─────────────────────────────────────────────────────────────
const MemberRow = ({ m, actions }) => (
  <div className="card card-pad" style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px'}}>
    <Avatar person={m} size="md" />
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontWeight:600, color:'var(--navy)', fontSize:14.5, display:'flex', alignItems:'center', gap:8}}>
        {m.name}
        {m.isAdmin && <span className="pill pill-teal" style={{fontSize:10.5}}>Admin</span>}
      </div>
      <div style={{fontSize:12.5, color:'var(--ink-soft)'}}>{m.role || 'Team member'} · {(TEAMS[m.team]||{}).label || m.team}</div>
    </div>
    {actions}
  </div>
);

const AdminScreen = () => {
  useStore();
  const [tab, setTab] = useAdminState('pending');
  const pending = Store.membersByStatus('pending');
  const approved = Store.membersByStatus('approved');
  const rejected = Store.membersByStatus('rejected');
  const meId = Store.meId();
  const list = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-greet"><span className="hand">admin</span></div>
          <h1 className="page-title">Member approvals</h1>
        </div>
        <div className="feed-tabs">
          <button className={`feed-tab ${tab==='pending'?'active':''}`} onClick={()=>setTab('pending')}>Pending{pending.length ? ` · ${pending.length}` : ''}</button>
          <button className={`feed-tab ${tab==='approved'?'active':''}`} onClick={()=>setTab('approved')}>Approved · {approved.length}</button>
          <button className={`feed-tab ${tab==='rejected'?'active':''}`} onClick={()=>setTab('rejected')}>Rejected{rejected.length ? ` · ${rejected.length}` : ''}</button>
        </div>
      </div>

      {tab === 'pending' && (
        <div className="banner" style={{marginBottom:16}}>
          ✅ <span>New sign-ups land here. <strong>Approve</strong> to let them into Rehab.Wisal, or <strong>reject</strong> to keep them out. Approval is instant on their end.</span>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          emoji={tab === 'pending' ? '🎉' : tab === 'approved' ? '👥' : '🗂️'}
          title={tab === 'pending' ? 'No one waiting' : tab === 'approved' ? 'No approved members yet' : 'No rejected members'}
          sub={tab === 'pending'
            ? "You're all caught up — every sign-up has been reviewed. New requests will appear here automatically."
            : tab === 'approved'
            ? 'Approved teammates will be listed here.'
            : 'Anyone you reject will be listed here — you can re-approve them anytime.'}
        />
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10, maxWidth:680}}>
          {list.map(m => (
            <MemberRow key={m.id} m={m} actions={
              m.id === meId ? (
                <span className="pill" style={{fontSize:11}}>You</span>
              ) : tab === 'pending' ? (
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-sm" style={{borderColor:'#E7B7B7', color:'#B05050'}} onClick={()=>Store.rejectUser(m.id)}>Reject</button>
                  <button className="btn btn-sm btn-primary" onClick={()=>Store.approveUser(m.id)}>Approve</button>
                </div>
              ) : tab === 'approved' ? (
                <button className="btn btn-sm btn-ghost" style={{color:'#B05050'}} onClick={()=>Store.rejectUser(m.id)}>Revoke</button>
              ) : (
                <button className="btn btn-sm btn-primary" onClick={()=>Store.approveUser(m.id)}>Approve</button>
              )
            } />
          ))}
        </div>
      )}
    </>
  );
};

Object.assign(window, { PendingScreen, RejectedScreen, AdminScreen });
