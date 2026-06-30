// MySalma — icons + shared components

const Icon = ({ name, size = 18, ...p }) => {
  const paths = {
    home:      <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    feed:      <><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></>,
    spark:     <><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6l4 4M5 19l4-4m6-6l4-4"/></>,
    crew:      <><circle cx="9" cy="9" r="3.5"/><circle cx="17" cy="10" r="2.5"/><path d="M2.5 19c.5-3 3-5 6.5-5s6 2 6.5 5"/><path d="M14 18.5c.4-2 2-3.5 4-3.5s3.6 1.5 4 3.5"/></>,
    star:      <path d="M12 2l2.6 6.6L22 9.2l-5.5 5 1.6 7.4-6.1-3.7-6.1 3.7 1.6-7.4L2 9.2l7.4-.6z"/>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chat:      <><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H8l-5 4V5z"/></>,
    bell:      <><path d="M6 8a6 6 0 1112 0v6l1.5 2h-15L6 14V8z"/><path d="M10 19a2 2 0 004 0"/></>,
    search:    <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    image:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
    video:     <><polygon points="6 4 20 12 6 20 6 4"/></>,
    poll:      <><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="17" y="9" width="4" height="11" rx="1"/></>,
    mood:      <><circle cx="12" cy="12" r="9"/><path d="M9 14c1 1.5 5 1.5 6 0"/><circle cx="9" cy="10" r=".5"/><circle cx="15" cy="10" r=".5"/></>,
    heart:     <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z"/>,
    comment:   <path d="M21 11.5a8.4 8.4 0 01-3.8 7L17 22l-4-2.5a9 9 0 01-1-.1 8.4 8.4 0 110-16.8 8.4 8.4 0 018.4 8.4z"/>,
    share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></>,
    bookmark:  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>,
    more:      <><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
    send:      <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></>,
    pin:       <><path d="M12 2v8l3 4-6 0 3-4V2z"/><path d="M12 14v8"/></>,
    location:  <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    clock:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    capsule:   <><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 016 0v2"/><path d="M9 13l3 3 3-3"/></>,
    live:      <><circle cx="12" cy="12" r="3"/><path d="M5 12a7 7 0 0114 0M2 12a10 10 0 0120 0"/></>,
    sparkle:   <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/>,
    check:     <path d="M5 12l5 5L20 7"/>,
    back:      <path d="M15 6l-6 6 6 6"/>,
    chevron:   <path d="M9 6l6 6-6 6"/>,
    close:     <><path d="M6 6l12 12M18 6L6 18"/></>,
    eye:       <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    smile:     <><circle cx="12" cy="12" r="9"/><path d="M9 14c1 1.5 5 1.5 6 0"/><circle cx="9" cy="10" r=".5"/><circle cx="15" cy="10" r=".5"/></>,
    party:     <><path d="M3 21l2-9 11 11-9 2zM12 8a4 4 0 014 4M14 4a8 8 0 016 6"/></>,
    swap:      <><path d="M7 4L3 8l4 4"/><path d="M3 8h12a4 4 0 014 4"/><path d="M17 20l4-4-4-4"/><path d="M21 16H9a4 4 0 01-4-4"/></>,
    roster:    <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v3h6V3"/><path d="M8 11h.01M8 15h.01"/><path d="M12 11h4M12 15h4"/></>,
    coffee:    <><path d="M4 8h13v5a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"/><path d="M17 9h2a2 2 0 010 4h-2"/><path d="M7 2v2M11 2v2"/></>,
    shield:    <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      {paths[name]}
    </svg>
  );
};

const Avatar = ({ person, size = 'md', status, ring }) => {
  if (typeof person === 'string') person = FIND(person);
  if (!person) return null;
  // Use an uploaded photo when the person has one (own profile or a teammate's)
  const photo = person.avatar
    || (((person.id === 'me' || person.id === 'sara') && window.Store) ? Store.profile().avatar : null);
  const style = {
    background: photo ? `url(${photo}) center/cover` : `linear-gradient(135deg, ${person.color}, ${person.color}cc)`,
    ...(ring ? { outline: `3px solid ${ring}`, outlineOffset: 0 } : {})
  };
  return (
    <span className={`avatar avatar-${size}`} style={style} title={person.name}>
      {!photo && person.emoji}
      {status && <span className={`avatar-status ${status === 'online' ? '' : status}`}></span>}
    </span>
  );
};

const AvatarStack = ({ people, size = 'sm', max = 4 }) => {
  const list = people.slice(0, max);
  return (
    <span className="avatar-stack">
      {list.map(p => <Avatar key={typeof p === 'string' ? p : p.id} person={p} size={size} />)}
    </span>
  );
};

const TeamPill = ({ team, mini }) => {
  const t = TEAMS[team];
  if (!t) return null;
  return <span className={`pill ${t.cls}`}>{mini ? t.short : t.label}</span>;
};

const ImgPh = ({ tone = 'teal', label, style, className = '' }) => (
  <div className={`imgph ${className}`} data-tone={tone} data-label={label} style={style} />
);

// Reaction strip rendered from a {emoji: count} dict
const Reactions = ({ map, total }) => {
  const entries = Object.entries(map);
  return (
    <span className="reaction-bar">
      <span className="reaction-emojis">
        {entries.slice(0, 3).map(([e]) => <span key={e}>{e}</span>)}
      </span>
      <span>{total || entries.reduce((s, [, n]) => s + n, 0)}</span>
    </span>
  );
};

Object.assign(window, { Icon, Avatar, AvatarStack, TeamPill, ImgPh, Reactions, timeAgo });

function timeAgo(iso) {
  if (!iso) return 'just now';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return 'just now';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24); if (d < 7) return d + 'd ago';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
