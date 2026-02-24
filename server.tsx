import homepage from "./public/index.html";

const API_KEY = "c21df843-40f8-490a-b09c-ea3399be72cf";
const BASE_URL = "https://conventions.leapevent.tech/api";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

async function fetchCached(endpoint: string): Promise<Response> {
  const now = Date.now();
  const cached = cache.get(endpoint);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return new Response(cached.data, {
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = `${BASE_URL}/${endpoint}?key=${API_KEY}`;
  const upstream = await fetch(url);
  const data = await upstream.text();

  cache.set(endpoint, { data, timestamp: now });

  return new Response(data, {
    headers: { "Content-Type": "application/json" },
  });
}

Bun.serve({
  port: 3000,
  development: true,
  routes: {
    "/": homepage,
    "/sw.js": {
      GET() {
        return new Response(Bun.file("public/sw.js"), {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
    "/manifest.json": {
      GET() {
        return new Response(Bun.file("public/manifest.json"), {
          headers: { "Content-Type": "application/manifest+json" },
        });
      },
    },
    "/api/schedules": {
      async GET() {
        return fetchCached("schedules");
      },
    },
    "/api/people": {
      async GET() {
        return fetchCached("people?schedule=1");
      },
    },
  },
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/icons/")) {
      return new Response(Bun.file(`public${url.pathname}`), {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running at http://localhost:3000");
