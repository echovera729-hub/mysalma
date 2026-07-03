/* MySalma — service worker
   Makes the app installable and work offline after the first load.
   Strategy:
     • App shell (same-origin files + CDN libs + fonts)  → cache-first
     • Page navigations                                  → network-first, fall back to cached index
     • Supabase API / realtime                           → never cached (always live)
*/

const CACHE = 'rehabwisal-v6';  // ⬆️ BUMP THIS on every code change, or installed apps keep running old cached JS.

// Same-origin files that make up the app shell (relative to this SW's scope).
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './supabase-config.js',
  './tweaks-panel.jsx',
  './data.jsx',
  './store.jsx',
  './components.jsx',
  './feed.jsx',
  './engage.jsx',
  './screens.jsx',
  './screens2.jsx',
  './crew-detail.jsx',
  './auth.jsx',
  './admin.jsx',
  './app.jsx',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {/* tolerate a missing file */}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSupabase(url) {
  return url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // never touch writes
  const url = new URL(req.url);

  // Supabase REST / auth / realtime must always hit the network — never serve stale data.
  if (isSupabase(url)) return;

  // App navigations: try the network first (fresh deploys), fall back to the cached shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Everything else (CSS/JS/JSX, CDN libs, fonts, icons): cache-first, then network (and cache it).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});
