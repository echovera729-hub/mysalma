// MySalma — sign in / sign up (only shown in Supabase multi-user mode)

const { useState: useAuthState } = React;

const AuthScreen = () => {
  const [mode, setMode] = useAuthState('signin'); // signin | signup
  const [email, setEmail] = useAuthState('');
  const [password, setPassword] = useAuthState('');
  const [name, setName] = useAuthState('');
  const [role, setRole] = useAuthState('');
  const [team, setTeam] = useAuthState('PT');
  const [busy, setBusy] = useAuthState(false);
  const [err, setErr] = useAuthState('');
  const [msg, setMsg] = useAuthState('');

  const submit = async () => {
    setErr(''); setMsg('');
    if (!email.trim() || !password) { setErr('Email and password are required.'); return; }
    if (mode === 'signup' && !name.trim()) { setErr('Please add your name.'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await Store.signIn(email.trim(), password);
      } else {
        const { needsConfirm } = await Store.signUp(email.trim(), password, { name: name.trim(), role: role.trim() || 'Team member', team });
        if (needsConfirm) {
          setMsg('Account created! Check your email to confirm, then sign in. (Tip: an admin can turn off email confirmation in Supabase for instant access.)');
          setMode('signin');
        }
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  };

  const lbl = { display:'block', fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', margin:'14px 0 6px' };

  return (
    <div className="onboard">
      <div className="onboard-card" style={{maxWidth:440}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
          <div className="brand-mark" style={{width:44, height:44, fontSize:18}}>R<span style={{opacity:.7}}>W</span></div>
          <div className="brand-name" style={{fontSize:24}}>Rehab<span className="dot">.</span>Wisal</div>
        </div>

        <h2 className="onboard-title" style={{fontSize:26}}>{mode === 'signin' ? 'Welcome back' : 'Join your team'}</h2>
        <p className="onboard-sub">{mode === 'signin' ? 'Sign in to your hospital’s space.' : 'Create your account — internal staff only.'}</p>
        {mode === 'signup' && (
          <div className="banner" style={{marginTop:12}}>🔐 New accounts are reviewed by an administrator before access is granted.</div>
        )}

        {mode === 'signup' && (<>
          <div style={{display:'flex', gap:12}}>
            <div style={{flex:1}}>
              <label style={lbl}>Name</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Sara Mendoza" />
            </div>
            <div style={{flex:1}}>
              <label style={lbl}>Role</label>
              <input className="input" value={role} onChange={e=>setRole(e.target.value)} placeholder="Physiotherapist" />
            </div>
          </div>
          <label style={lbl}>Team</label>
          <select className="input" value={team} onChange={e=>setTeam(e.target.value)}>
            {Object.entries(TEAMS).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </>)}

        <label style={lbl}>Work email</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@rehabwisal.org"
          onKeyDown={e=>{ if(e.key==='Enter') submit(); }} />
        <label style={lbl}>Password</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e=>{ if(e.key==='Enter') submit(); }} />

        {err && <div style={{marginTop:14, padding:'10px 12px', background:'var(--blush-soft)', color:'#B05050', borderRadius:10, fontSize:13}}>{err}</div>}
        {msg && <div className="banner" style={{marginTop:14}}>{msg}</div>}

        <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', marginTop:20, padding:'12px'}} onClick={submit} disabled={busy}>
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
        </button>

        <div style={{textAlign:'center', marginTop:16, fontSize:13.5, color:'var(--ink-soft)'}}>
          {mode === 'signin' ? "New to Rehab.Wisal? " : 'Already have an account? '}
          <button onClick={()=>{ setMode(mode==='signin'?'signup':'signin'); setErr(''); setMsg(''); }}
            style={{background:'transparent', border:0, color:'var(--teal-deep)', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:13.5}}>
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

window.AuthScreen = AuthScreen;
