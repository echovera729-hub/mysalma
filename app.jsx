// MySalma — app shell, sidebar, router

const { useState: useStateApp, useEffect: useEffectApp } = React;

const NAV = [
  { id: 'home',     label: 'Home',          icon: 'home',     primary: true },
  { id: 'shift',    label: 'On Shift',      icon: 'roster',   primary: true },
  { id: 'search',   label: 'Discover',      icon: 'search',   primary: true },
  { id: 'crews',    label: 'Crews',         icon: 'crew' },
  { id: 'events',   label: 'Events',        icon: 'calendar', primary: true },
  { id: 'chat',     label: 'Chat',          icon: 'chat' },
  { id: 'notifs',   label: 'Notifications', icon: 'bell' },
  { id: 'admin',    label: 'Approvals',     icon: 'shield', admin: true },
  { id: 'profile',  label: 'My profile',    icon: 'spark',    primary: true },
  { id: 'settings', label: 'Settings',      icon: 'settings' },
];

// Bottom-bar order on phones (5 primary items, left-to-right)
const MOBILE_NAV = ['home', 'shift', 'search', 'events', 'profile'];
const MORE_NAV = ['crews', 'chat', 'notifs', 'settings'];

// ---- Mobile top bar (phones only; hidden by CSS on larger screens) ----
const MobileTopBar = ({ page, setPage, onCompose }) => (
  <header className="mobile-topbar">
    <div className="brand" onClick={() => setPage('home')} style={{cursor:'pointer'}}>
      <div className="brand-mark" style={{width:32, height:32, fontSize:15}}>M<span style={{opacity:.7}}>s</span></div>
      <div className="brand-name" style={{fontSize:19}}>My<span className="dot">·</span>Salma</div>
    </div>
    <div className="mobile-topbar-actions">
      <button className={`topbar-btn ${page==='notifs'?'active':''}`} onClick={() => setPage('notifs')} aria-label="Notifications"><Icon name="bell"/></button>
      <button className={`topbar-btn ${page==='chat'?'active':''}`} onClick={() => setPage('chat')} aria-label="Chat"><Icon name="chat"/></button>
      <button className="topbar-btn topbar-compose" onClick={onCompose} aria-label="New post"><Icon name="plus"/></button>
    </div>
  </header>
);

const Sidebar = ({ page, setPage, onCompose }) => {
  useStore();
  const prof = Store.profile();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const go = id => { setPage(id); setMoreOpen(false); };
  const moreActive = MORE_NAV.includes(page);
  return (
  <aside className="rail">
    <div className="brand">
      <div className="brand-mark">M<span style={{opacity:.7}}>s</span></div>
      <div className="brand-name">My<span className="dot">·</span>Salma</div>
    </div>

    <button className="compose-btn" onClick={onCompose}>
      <Icon name="plus"/> New post
    </button>

    <nav className="nav">
      {NAV.filter(n => !n.admin || Store.isAdmin()).map(n => {
        const meta = n.id === 'admin' ? (Store.pendingCount() || null) : n.meta;
        return (
        <button key={n.id} data-primary={n.primary ? '1' : undefined}
          className={`nav-item ${page===n.id?'active':''}`} onClick={() => go(n.id)}>
          <Icon name={n.icon} className="nav-item-icon"/>
          <span className="nav-label">{n.label}</span>
          {meta && <span className="nav-item-meta">{meta}</span>}
        </button>
        );
      })}
      {/* Phone-only “More” entry into the overflow sheet */}
      <button className={`nav-item nav-more ${moreActive?'active':''}`} onClick={() => setMoreOpen(true)}>
        <Icon name="more" className="nav-item-icon"/>
        <span className="nav-label">More</span>
      </button>
    </nav>

    <div className="me-card" onClick={() => setPage('profile')}>
      <Avatar person="me" size="md" status="online" />
      <div className="me-card-text">
        <div className="me-card-name">{prof.name}</div>
        <div className="me-card-role">{prof.role}</div>
      </div>
    </div>

    {moreOpen && (
      <div className="more-overlay" onClick={() => setMoreOpen(false)}>
        <div className="more-sheet" onClick={e => e.stopPropagation()}>
          <div className="more-grip"></div>
          <div className="more-head">
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <Avatar person="me" size="md" />
              <div><div style={{fontWeight:600, color:'var(--navy)'}}>{prof.name}</div><div style={{fontSize:12, color:'var(--ink-soft)'}}>{prof.role}</div></div>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={() => setMoreOpen(false)}><Icon name="close"/></button>
          </div>
          <button className="compose-btn" style={{width:'100%', marginBottom:6}} onClick={() => { onCompose(); setMoreOpen(false); }}><Icon name="plus"/> New post</button>
          {[...MORE_NAV, ...(Store.isAdmin() ? ['admin'] : [])].map(id => {
            const n = NAV.find(x => x.id === id);
            const meta = id === 'admin' ? (Store.pendingCount() || null) : null;
            return (
              <button key={id} className={`more-row ${page===id?'active':''}`} onClick={() => go(id)}>
                <Icon name={n.icon}/>
                <span>{n.label}</span>
                {meta ? <span className="nav-item-meta" style={{marginLeft:'auto'}}>{meta}</span> : (page===id && <span className="more-dot"></span>)}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </aside>
  );
};

// ============================================================
//  Tweaks
// ============================================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "feedLayout": "cards",
  "density": "comfortable",
  "fontPair": "jakarta",
  "accent": ["#2BA39A","#1F7A73","#D9EBE8","#EEF6F4"],
  "showPulse": true,
  "showDailyOne": true,
  "showDigest": true,
  "showCrews": true,
  "showCapsule": true,
  "showSpotlight": true,
  "skipOnboarding": true
}/*EDITMODE-END*/;

const ACCENT_PALETTES = [
  ['#2BA39A','#1F7A73','#D9EBE8','#EEF6F4'], // sea teal
  ['#3A5A9E','#1F3A7A','#DCE5F4','#EEF2F9'], // deep navy
  ['#6783B0','#4A6390','#E4ECF6','#EFF3F9'], // slate blue
  ['#E0894B','#B86833','#FBE5D3','#FCF1E6'], // warm peach
];
const FONTS = {
  jakarta: { body: "'Plus Jakarta Sans', sans-serif", display: "'Bricolage Grotesque', sans-serif" },
  inter:   { body: "'Manrope', sans-serif", display: "'Fraunces', serif" },
  dm:      { body: "'DM Sans', sans-serif", display: "'DM Serif Display', serif" },
  classic: { body: "Helvetica, Arial, sans-serif", display: "Helvetica, Arial, sans-serif" },
};

const TweaksUI = ({ t, set }) => (
  <TweaksPanel title="Tweaks · MySalma">
    <TweakSection title="Layout">
      <TweakSelect label="Feed layout" value={t.feedLayout} onChange={v => set('feedLayout', v)} options={[
        { value:'cards',     label:'Cards (default)' },
        { value:'magazine',  label:'Magazine (editorial)' },
        { value:'minimal',   label:'Minimal (single column)' },
      ]} />
      <TweakRadio label="Density" value={t.density} onChange={v => set('density', v)} options={[
        { value:'compact',     label:'Tight' },
        { value:'comfortable', label:'Comfy' },
        { value:'spacious',    label:'Roomy' },
      ]} />
    </TweakSection>
    <TweakSection title="Look & feel">
      <TweakColor label="Accent" value={t.accent} onChange={v => set('accent', v)} options={ACCENT_PALETTES} />
      <TweakSelect label="Type pairing" value={t.fontPair} onChange={v => set('fontPair', v)} options={[
        { value:'jakarta', label:'Jakarta + Bricolage (warm, modern)' },
        { value:'inter',   label:'Manrope + Fraunces (editorial)' },
        { value:'dm',      label:'DM Sans + DM Serif (clean)' },
        { value:'classic', label:'Helvetica only (classic)' },
      ]} />
    </TweakSection>
    <TweakSection title="Unique features">
      <TweakToggle label="The Daily One · daily prompt"  value={t.showDailyOne}   onChange={v => set('showDailyOne', v)} />
      <TweakToggle label="Welcome / today card"          value={t.showDigest}     onChange={v => set('showDigest', v)} />
      <TweakToggle label="Pulse · mood check-in"      value={t.showPulse}     onChange={v => set('showPulse', v)} />
      <TweakToggle label="Spotlight · weekly feature" value={t.showSpotlight} onChange={v => set('showSpotlight', v)} />
      <TweakToggle label="Crews · interest groups"    value={t.showCrews}     onChange={v => set('showCrews', v)} />
      <TweakToggle label="Time capsule"               value={t.showCapsule}   onChange={v => set('showCapsule', v)} />
    </TweakSection>
    <TweakSection title="Demo flow">
      <TweakToggle label="Skip onboarding" value={t.skipOnboarding} onChange={v => set('skipOnboarding', v)} />
    </TweakSection>
  </TweaksPanel>
);

// ============================================================
//  App
// ============================================================
const App = () => {
  useStore();
  const [page, setPage] = useStateApp('home');
  const [showCompose, setShowCompose] = useStateApp(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const set = (k, v) => setTweak({[k]: v});
  const [onboarded, setOnboarded] = useStateApp(t.skipOnboarding);

  // Boot the data store once (loads localStorage, or connects Supabase + checks session)
  useEffectApp(() => { Store.init(); }, []);

  // Home-screen shortcuts (manifest): ?screen=shift jumps to a tab, ?action=compose opens the composer
  useEffectApp(() => {
    try {
      const params = new URLSearchParams(location.search);
      const screen = params.get('screen');
      if (screen && NAV.some(n => n.id === screen)) setPage(screen);
      if (params.get('action') === 'compose') setShowCompose(true);
    } catch (e) {}
  }, []);

  // Apply tweak side-effects (CSS vars, fonts, density)
  useEffectApp(() => {
    const root = document.documentElement;
    const a = Array.isArray(t.accent) ? t.accent : ACCENT_PALETTES[0];
    root.style.setProperty('--teal', a[0]);
    root.style.setProperty('--teal-deep', a[1]);
    root.style.setProperty('--teal-tint', a[3]);
    root.style.setProperty('--teal-soft', a[2]);
    const f = FONTS[t.fontPair] || FONTS.jakarta;
    root.style.setProperty('--font-body', f.body);
    root.style.setProperty('--font-display', f.display);
    document.body.setAttribute('data-density', t.density);
  }, [t.accent, t.fontPair, t.density]);

  useEffectApp(() => { setOnboarded(t.skipOnboarding); }, [t.skipOnboarding]);

  // While the store boots (e.g. checking a Supabase session)
  if (!Store.isReady()) {
    return (
      <div className="onboard">
        <div style={{textAlign:'center'}}>
          <div className="brand-mark" style={{width:64, height:64, fontSize:30, margin:'0 auto'}}>M<span style={{opacity:.7}}>s</span></div>
          <div style={{marginTop:16, color:'var(--ink-soft)', fontFamily:'var(--font-hand)', fontSize:24}}>warming up…</div>
        </div>
      </div>
    );
  }

  // Supabase mode: require sign-in before the app
  if (Store.mode === 'supabase' && !Store.isAuthed()) {
    return (<><AuthScreen /><TweaksUI t={t} set={set} /></>);
  }

  // Supabase mode: signed in but awaiting admin approval (or rejected)
  if (Store.mode === 'supabase' && Store.isAuthed()) {
    const status = Store.myStatus();
    if (status === 'pending')  return (<><PendingScreen /><TweaksUI t={t} set={set} /></>);
    if (status === 'rejected') return (<><RejectedScreen /><TweaksUI t={t} set={set} /></>);
  }

  // Onboarding tour (local mode only — in Supabase mode signup collects the same info)
  if (Store.mode === 'local' && !onboarded) {
    return (
      <>
        <OnboardingScreen onDone={() => { setOnboarded(true); }} />
        <TweaksUI t={t} set={set} />
      </>
    );
  }

  return (
    <>
      <MobileTopBar page={page} setPage={setPage} onCompose={() => setShowCompose(true)} />
      <div className="app">
        <Sidebar page={page} setPage={setPage} onCompose={() => setShowCompose(true)} />
        <main className="main">
          {page === 'home'     && <HomeScreen tweak={t} onCompose={() => setShowCompose(true)} />}
          {page === 'shift'    && <ShiftScreen />}
          {page === 'profile'  && <ProfileScreen />}
          {page === 'crews'    && <CrewsScreen />}
          {page === 'events'   && <EventsScreen />}
          {page === 'chat'     && <ChatScreen />}
          {page === 'notifs'   && <NotifsScreen />}
          {page === 'admin'    && Store.isAdmin() && <AdminScreen />}
          {page === 'search'   && <SearchScreen go={setPage} />}
          {page === 'settings' && <SettingsScreen />}
        </main>
        <aside className="aux">
          {page === 'home' ? <AuxRail tweak={t} go={setPage} /> :
           page === 'chat' || page === 'search' || page === 'settings' || page === 'shift' ? (
             <>{t.showSpotlight && <AuxSpotlight />}<AuxEvents go={setPage} /></>
           ) : (
             <>{t.showSpotlight && <AuxSpotlight />}<AuxEvents go={setPage} />{t.showCrews && <AuxCrews go={setPage} />}</>
           )}
        </aside>
      </div>

      {showCompose && <ComposerScreen onClose={() => setShowCompose(false)} />}
      <TweaksUI t={t} set={set} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
