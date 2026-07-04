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
      <div className="brand-mark" style={{width:32, height:32, fontSize:14}}>R<span style={{opacity:.7}}>W</span></div>
      <div className="brand-name" style={{fontSize:19}}>Rehab<span className="dot">.</span>Wisal</div>
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
      <div className="brand-mark">R<span style={{opacity:.7}}>W</span></div>
      <div className="brand-name">Rehab<span className="dot">.</span>Wisal</div>
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

const THEMES = [
  { id:'teal',       name:'Sea Teal',        colors:['#2BA39A','#1F7A73','#D9EBE8','#EEF6F4'] },
  { id:'navy',       name:'Deep Navy',       colors:['#3A5A9E','#1F3A7A','#DCE5F4','#EEF2F9'] },
  { id:'slate',      name:'Slate Blue',      colors:['#6783B0','#4A6390','#E4ECF6','#EFF3F9'] },
  { id:'peach',      name:'Warm Peach',      colors:['#E0894B','#B86833','#FBE5D3','#FCF1E6'] },
  { id:'burgundy',   name:'Burgundy',        colors:['#8E3B4E','#6E2A3A','#F3DDE3','#FAEEF1'] },
  { id:'rose',       name:'Rose',            colors:['#B5566E','#8E3E53','#F7DCE3','#FCEFF2'] },
  { id:'plum',       name:'Plum',            colors:['#9B6A9E','#76497A','#EEDFEF','#F8F1F8'] },
  { id:'lavender',   name:'Lavender',        colors:['#7C6BC4','#5B4C9C','#E6E1F6','#F3F1FA'] },
  { id:'sage',       name:'Sage Green',      colors:['#5E8C6A','#46694F','#DBEBE0','#EFF6F1'] },
  { id:'terracotta', name:'Terracotta',      colors:['#C27A52','#9C5C39','#F6E2D4','#FBF1EA'] },
  { id:'mustard',    name:'Mustard Gold',    colors:['#C9A24B','#9E7C2E','#F6EBCB','#FBF6E6'] },
  { id:'dustyteal',  name:'Dusty Teal',      colors:['#4C9CB0','#357586','#D6ECF1','#EEF7F9'] },
  { id:'dustypink',  name:'Dusty Pink',      colors:['#D08398','#AC6076','#F8DEE6','#FCEFF3'] },
  { id:'powder',     name:'Powder Blue',     colors:['#6B8FA8','#4D6E86','#DEEAF1','#EFF5F8'] },
  { id:'clay',       name:'Clay Red',        colors:['#A8584C','#843F35','#F4DAD4','#FBEDEA'] },
  { id:'eucalyptus', name:'Eucalyptus',      colors:['#5F7A6E','#445A50','#DCE8E2','#EFF5F2'] },
  { id:'mocha',      name:'Mocha',           colors:['#7E6552','#5E4A3B','#EBE0D6','#F7F1EA'] },
  { id:'orchid',     name:'Orchid',          colors:['#9A6FB0','#74508A','#EBDFF2','#F6F1F9'] },
];
const ACCENT_PALETTES = THEMES.map(t => t.colors);
const FONTS = {
  jakarta: { body: "'Plus Jakarta Sans', sans-serif", display: "'Bricolage Grotesque', sans-serif" },
  inter:   { body: "'Manrope', sans-serif", display: "'Fraunces', serif" },
  dm:      { body: "'DM Sans', sans-serif", display: "'DM Serif Display', serif" },
  classic: { body: "Helvetica, Arial, sans-serif", display: "Helvetica, Arial, sans-serif" },
};

const TweaksUI = ({ t, set }) => (
  <TweaksPanel title="Tweaks · Rehab.Wisal">
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

  // Apply tweak side-effects (CSS vars, fonts, density).
  // A user's saved in-app theme (Store) takes precedence over the design-time Tweaks values,
  // so the picker in Settings works on the live site for everyone.
  const th = Store.theme();
  useEffectApp(() => {
    const root = document.documentElement;
    const a = (th && th.accent) || (Array.isArray(t.accent) ? t.accent : ACCENT_PALETTES[0]);
    root.style.setProperty('--teal', a[0]);
    root.style.setProperty('--teal-deep', a[1]);
    root.style.setProperty('--teal-tint', a[3]);
    root.style.setProperty('--teal-soft', a[2]);
    const f = FONTS[(th && th.fontPair) || t.fontPair] || FONTS.jakarta;
    root.style.setProperty('--font-body', f.body);
    root.style.setProperty('--font-display', f.display);
    document.body.setAttribute('data-density', (th && th.density) || t.density);
  }, [t.accent, t.fontPair, t.density, th && th.accent && th.accent[0], th && th.fontPair, th && th.density]);

  useEffectApp(() => { setOnboarded(t.skipOnboarding); }, [t.skipOnboarding]);

  // While the store boots (e.g. checking a Supabase session)
  if (!Store.isReady()) {
    return (
      <div className="onboard">
        <div style={{textAlign:'center'}}>
          <div className="brand-mark" style={{width:64, height:64, fontSize:26, margin:'0 auto'}}>R<span style={{opacity:.7}}>W</span></div>
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
          {page === 'settings' && <SettingsScreen go={setPage} />}
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
Object.assign(window, { THEMES, FONTS });
