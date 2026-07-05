// MySalma — configuration + a clean slate.
// No fake people, posts, events, or chats. The only "person" is the
// current signed-in user, whose details come live from their saved profile.
// Real teammates/content appear once a backend is connected (see README).

// The rehab hospital's real disciplines — this is configuration, not mock data.
const TEAMS = {
  PT:  { label: 'Physiotherapy',         short: 'PT',  cls: 'team-pt',      color: '#2BA39A' },
  OT:  { label: 'Occupational Therapy',  short: 'OT',  cls: 'team-ot',      color: '#E0894B' },
  SLP: { label: 'Speech-Language',       short: 'SLP', cls: 'team-slp',     color: '#7771C9' },
  RT:  { label: 'Recreational Therapy',  short: 'RT',  cls: 'team-rt',      color: '#C9A645' },
  NUR: { label: 'Nursing',               short: 'NUR', cls: 'team-nursing', color: '#D17474' },
  ADM: { label: 'Admin',                 short: 'ADM', cls: 'team-admin',   color: '#6783B0' },
  RES: { label: 'Respiratory Therapy',   short: 'RES', cls: 'team-allied',  color: '#2BA39A' },
  DIE: { label: 'Dietetics',             short: 'DIE', cls: 'team-allied',  color: '#2BA39A' },
};

// Build the current user as a "person" object from their saved profile.
function currentUser() {
  if (window.Store && Store.personById) {
    const me = Store.personById('me');
    if (me) return me;
  }
  return { id: 'me', name: 'You', first: 'You', role: 'Team member', team: 'PT', color: TEAMS.PT.color, emoji: 'U' };
}

// FIND resolves a person id to a renderable person object.
// In Supabase mode it looks up the live profiles cache (real teammates).
// In local mode only the current user exists; unknown ids get a safe placeholder.
const FIND = id => {
  if (!id) return null;
  if (window.Store && Store.personById) {
    const p = Store.personById(id);
    if (p) return p;
  }
  if (id === 'me' || id === 'sara') return currentUser();
  return { id, name: String(id), first: String(id), role: '', team: 'PT', color: '#94A0B8', emoji: (String(id)[0] || '?').toUpperCase() };
};

// Mood options for the Pulse check-in — feature config.
const MOODS = [
  { id: 'great',  emoji: '🌞', label: 'Glowing'   },
  { id: 'good',   emoji: '🌿', label: 'Steady'    },
  { id: 'meh',    emoji: '☁️',  label: 'Foggy'     },
  { id: 'tired',  emoji: '🥱', label: 'Wiped'     },
  { id: 'spicy',  emoji: '🌶️', label: 'Energized' },
  { id: 'soft',   emoji: '🫧', label: 'Tender'    },
];

// The Daily One prompt rotation — feature content, no fake answers.
const DAILY_PROMPTS = [
  { q: "What's the best snack in the building right now?", emoji: '🍪', kind: 'text' },
  { q: "Tag the coworker who saved your shift today.",     emoji: '🦸', kind: 'text' },
  { q: "One word for how the floor feels today.",          emoji: '🌡️', kind: 'word', quick: ['steady','hopeful','wired','tender','proud'] },
  { q: "What song is getting you through this shift?",     emoji: '🎧', kind: 'text' },
  { q: "What's one small win from today?",                 emoji: '🌱', kind: 'text' },
];

// Empty content — the app starts as a clean slate. Users create everything.
const POSTS = [];
const STORIES = [];

// Status groupings for the On-Shift roster (config).
const STATUS_META = {
  charge:   { label: 'Charge / Lead', dot: 'var(--peach)',     pill: 'pill-peach' },
  floor:    { label: 'On the floor',  dot: 'var(--teal)',      pill: 'pill-teal',   emoji: '🟢' },
  break:    { label: 'On break',      dot: 'var(--butter)',    pill: 'pill-butter', emoji: '☕' },
  arriving: { label: 'Just arriving', dot: 'var(--slate)',     pill: 'pill-slate',  emoji: '🚪' },
  leaving:  { label: 'Heading out',   dot: 'var(--slate-soft)', pill: 'pill-slate' },
};

// Floor / unit options for the shift-status picker (config).
const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'ER', 'Outpatient', 'Admin'];
const URGENCY = {
  high: { label: 'Needs cover',    cls: 'pill-blush' },
  med:  { label: 'Hoping to swap', cls: 'pill-butter' },
  low:  { label: 'Flexible',       cls: 'pill-mint' },
};

// Suggested crew templates the user can spin up in one tap (not fake members).
const CREW_IDEAS = [
  { emoji: '☕', name: 'Coffee Crew' },
  { emoji: '🥾', name: 'Trail Walkers' },
  { emoji: '📚', name: 'Bookworms' },
  { emoji: '🌿', name: 'Plant Parents' },
  { emoji: '🐾', name: 'Pet People' },
  { emoji: '🍼', name: 'Tired Parents Club' },
  { emoji: '🍜', name: 'Lunch Adventurers' },
  { emoji: '🎧', name: 'Shift Soundtrack' },
];

const EVENT_COLORS = ['peach','mint','lavender','butter','navy'];

Object.assign(window, {
  TEAMS, FIND, currentUser, MOODS, DAILY_PROMPTS, POSTS, STORIES,
  STATUS_META, URGENCY, CREW_IDEAS, EVENT_COLORS, FLOORS,
});
