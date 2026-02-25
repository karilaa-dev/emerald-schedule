const CACHE_NAME = "eccc-v3";

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

  if (url.pathname === "/api/schedules/status") {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (url.pathname === "/api/schedules") {
    event.respondWith(networkFirstSchedule(event.request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // CSS/JS assets — network-first to avoid stale bundles after code changes
  event.respondWith(networkFirst(event.request));
});

function withOfflineHeader(cached) {
  const headers = new Headers(cached.headers);
  headers.set("X-SW-Cache", "1");
  return new Response(cached.body, { status: cached.status, headers });
}

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

    // Remove stale schedule entries (different hash) before storing new one
    const keys = await c.keys();
    await Promise.all(
      keys
        .filter((k) => new URL(k.url).pathname === "/api/schedules" && k.url !== request.url)
        .map((k) => c.delete(k))
    );

    c.put(request, response.clone());
    return response;
  } catch {
    // Offline: serve any cached schedule entry (stale data > no data)
    const c = await caches.open(CACHE_NAME);
    const keys = await c.keys();
    for (const key of keys) {
      if (new URL(key.url).pathname === "/api/schedules") {
        const cached = await c.match(key);
        if (cached) return withOfflineHeader(cached);
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
    if (cached) return withOfflineHeader(cached);
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
