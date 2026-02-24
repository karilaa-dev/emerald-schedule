import homepage from "./public/index.html";

const API_KEY = "c21df843-40f8-490a-b09c-ea3399be72cf";
const BASE_URL = "https://conventions.leapevent.tech/api";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: string;
  hash: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

const RATE_LIMIT = 4;
const RATE_WINDOW = 60_000; // 1 minute
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  requestLog.set(ip, timestamps);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  return false;
}

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

  cache.set(endpoint, { data, hash: Bun.hash(data).toString(36), timestamp: now });

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
      GET(req: Request) {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        if (isRateLimited(ip)) {
          return new Response("Too Many Requests", { status: 429 });
        }
        return fetchCached("schedules");
      },
    },
    "/api/schedules/status": {
      async GET() {
        const entry = cache.get("schedules");
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          return Response.json({ hash: entry.hash, cachedAt: entry.timestamp });
        }
        await fetchCached("schedules");
        const filled = cache.get("schedules")!;
        return Response.json({ hash: filled.hash, cachedAt: filled.timestamp });
      },
    },
    "/api/people": {
      GET: () => fetchCached("people?schedule=1"),
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
