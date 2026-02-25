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

async function ensureCached(endpoint: string): Promise<void> {
  const now = Date.now();
  const cached = cache.get(endpoint);
  if (cached && now - cached.timestamp < CACHE_TTL) return;

  const url = `${BASE_URL}/${endpoint}?key=${API_KEY}`;
  const upstream = await fetch(url);
  const data = await upstream.text();
  cache.set(endpoint, { data, hash: Bun.hash(data).toString(36), timestamp: now });
}

const port = Number(process.env.PORT) || 3000;

Bun.serve({
  port,
  development: process.env.NODE_ENV !== "production",
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
    "/robots.txt": {
      GET() {
        return new Response(
          "User-agent: *\nAllow: /\nSitemap: https://eccc26.karilaa.dev/sitemap.xml\n",
          { headers: { "Content-Type": "text/plain" } },
        );
      },
    },
    "/api/schedules": {
      async GET(req: Request) {
        const requestedHash = new URL(req.url).searchParams.get("hash");

        await ensureCached("schedules");
        const entry = cache.get("schedules")!;

        if (requestedHash && requestedHash !== entry.hash) {
          return Response.json(
            { error: "hash_mismatch", currentHash: entry.hash },
            {
              status: 404,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }

        const parsed = JSON.parse(entry.data);
        const body = JSON.stringify({ ...parsed, hash: entry.hash, cachedAt: entry.timestamp });

        return new Response(body, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": requestedHash
              ? "public, max-age=300, s-maxage=86400"
              : "public, max-age=60, s-maxage=300",
          },
        });
      },
    },
    "/api/schedules/status": {
      async GET(req: Request) {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        if (isRateLimited(ip)) {
          return new Response("Too Many Requests", { status: 429 });
        }

        await ensureCached("schedules");
        const entry = cache.get("schedules")!;

        const clientHash = new URL(req.url).searchParams.get("hash");
        const headers = {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        };

        if (clientHash && clientHash === entry.hash) {
          return new Response(JSON.stringify({ changed: false }), { headers });
        }

        return new Response(
          JSON.stringify({ changed: true, hash: entry.hash }),
          { headers },
        );
      },
    },
    "/api/people": {
      async GET() {
        await ensureCached("people?schedule=1");
        const entry = cache.get("people?schedule=1")!;
        return new Response(entry.data, {
          headers: { "Content-Type": "application/json" },
        });
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
    if (url.pathname === "/public/manifest.json") {
      return new Response(Bun.file("public/manifest.json"), {
        headers: { "Content-Type": "application/manifest+json" },
      });
    }
    if (url.pathname === "/og-image.png") {
      return new Response(Bun.file("public/og-image.png"), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${port}`);
