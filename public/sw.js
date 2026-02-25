const CACHE_NAME = "eccc-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Status endpoint: network-only, never cached by SW
  if (url.pathname === "/api/schedules/status") {
    event.respondWith(networkOnly(event.request));
    return;
  }

  // Schedule endpoint: network-first, clean old hash entries on cache put
  if (url.pathname === "/api/schedules") {
    event.respondWith(networkFirstSchedule(event.request));
    return;
  }

  // Other API requests: network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Google Fonts: cache-first
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Navigation requests (HTML shell): network-first
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Static assets (JS, CSS, images): cache-first
  event.respondWith(cacheFirst(event.request));
});

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "X-SW-Cache": "1", "Content-Type": "application/json" },
    });
  }
}

async function networkFirstSchedule(request) {
  try {
    const response = await fetch(request);
    const c = await caches.open(CACHE_NAME);

    // Clean old /api/schedules entries before storing new one
    const keys = await c.keys();
    for (const key of keys) {
      const keyUrl = new URL(key.url);
      if (keyUrl.pathname === "/api/schedules" && key.url !== request.url) {
        await c.delete(key);
      }
    }

    c.put(request, response.clone());
    return response;
  } catch {
    // Offline: serve any cached schedule entry (stale data > no data)
    const c = await caches.open(CACHE_NAME);
    const keys = await c.keys();
    for (const key of keys) {
      if (new URL(key.url).pathname === "/api/schedules") {
        const cached = await c.match(key);
        if (cached) {
          const headers = new Headers(cached.headers);
          headers.set("X-SW-Cache", "1");
          return new Response(cached.body, { status: cached.status, headers });
        }
      }
    }
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      // Mark as served from SW cache so client knows it's offline
      const headers = new Headers(cached.headers);
      headers.set("X-SW-Cache", "1");
      return new Response(cached.body, { status: cached.status, headers });
    }
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}
