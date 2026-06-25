// ════════════════════════════════════════════════════════════════
//  MySalma — Supabase connection
// ════════════════════════════════════════════════════════════════
//
//  HOW TO TURN ON THE SHARED, MULTI-USER NETWORK:
//
//  1. Create a free project at https://supabase.com
//  2. In Supabase → SQL Editor, paste the contents of `supabase-schema.sql`
//     and click Run. (This creates the tables and security rules.)
//  3. In Supabase → Project Settings → API, copy your Project URL and the
//     "anon / public" key.
//  4. Paste them into the two lines below, replacing the placeholders.
//  5. In Supabase → Authentication → Providers → Email, turn OFF
//     "Confirm email" (so staff can sign in immediately on an internal tool).
//  6. Save this file and reload. MySalma is now a shared hospital network —
//     everyone who signs up sees the same live feed, events, crews and swaps.
//
//  Leave the placeholders as-is to keep running in offline/local mode
//  (single user, data saved only in this browser — great for demos).
// ════════════════════════════════════════════════════════════════

window.SUPABASE_URL      = 'YOUR_SUPABASE_URL';        // e.g. https://abcdefgh.supabase.co
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';   // the long "anon public" key

// --- do not edit below this line ---------------------------------
window.SUPABASE_ENABLED = !!(
  window.SUPABASE_URL &&
  window.SUPABASE_URL.indexOf('http') === 0 &&
  window.SUPABASE_URL.indexOf('YOUR_') === -1 &&
  window.SUPABASE_ANON_KEY &&
  window.SUPABASE_ANON_KEY.length > 20 &&
  window.SUPABASE_ANON_KEY.indexOf('YOUR_') === -1
);
