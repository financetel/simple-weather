const OPENWEATHER_BASE = "https://api.openweathermap.org";
const REQUEST_TIMEOUT_MS = 15_000;

type City = {
  name: string;
  country: string;
  state: string;
  lat: number;
  lon: number;
};

type JsonRecord = Record<string, unknown>;

function jsonResponse(body: JsonRecord, status: number, corsHeaders: HeadersInit): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function corsFor(request: Request): HeadersInit | null {
  const origin = request.headers.get("Origin");
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!configured.length) return null;
  if (origin && !configured.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin ?? configured[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

async function openWeather(path: string, params: Record<string, string | number>): Promise<unknown> {
  const key = Deno.env.get("OPENWEATHER_API_KEY");
  if (!key) throw new Error("서버에 OpenWeather API 키가 설정되지 않았어요.");
  const url = new URL(`${OPENWEATHER_BASE}${path}`);
  for (const [name, value] of Object.entries({ ...params, appid: key })) {
    url.searchParams.set(name, String(value));
  }
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("요청 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.");
    }
    throw new Error("OpenWeather 서비스에 연결할 수 없어요.");
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (response.ok) return payload;
  if (response.status === 401) throw new Error("API 키가 유효하지 않거나 아직 활성화되지 않았어요.");
  if (response.status === 404) throw new Error("요청한 날씨 정보를 찾지 못했어요.");
  if (response.status === 429) throw new Error("API 호출 한도에 도달했어요. 잠시 후 다시 시도해 주세요.");
  if (response.status >= 500) throw new Error("OpenWeather 서비스에 일시적인 문제가 있어요.");
  throw new Error("날씨 요청을 처리할 수 없어요.");
}

async function searchCities(query: string): Promise<City[]> {
  const result = await openWeather("/geo/1.0/direct", { q: query.trim(), limit: 5 });
  const items = Array.isArray(result) ? result as JsonRecord[] : [];
  return items
    .map((item) => {
      const localNames = item.local_names && typeof item.local_names === "object"
        ? item.local_names as Record<string, string>
        : {};
      return {
        name: localNames.ko || String(item.name || ""),
        country: String(item.country || ""),
        state: String(item.state || ""),
        lat: Number(item.lat),
        lon: Number(item.lon),
      };
    })
    .filter((city) => city.name && Number.isFinite(city.lat) && Number.isFinite(city.lon));
}

function isCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

Deno.serve(async (request) => {
  const corsHeaders = corsFor(request);
  if (!corsHeaders) return new Response("Origin is not allowed or ALLOWED_ORIGINS is not configured.", { status: 403 });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "지원하지 않는 요청 방식이에요." }, 405, corsHeaders);

  let body: JsonRecord;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse({ error: "요청 형식이 올바르지 않아요." }, 400, corsHeaders);
    }
    body = parsed as JsonRecord;
  } catch {
    return jsonResponse({ error: "요청 형식이 올바르지 않아요." }, 400, corsHeaders);
  }

  try {
    if (body.action === "search") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!query || query.length > 80) {
        return jsonResponse({ error: "검색어를 1~80자로 입력해 주세요." }, 400, corsHeaders);
      }
      return jsonResponse({ cities: await searchCities(query) }, 200, corsHeaders);
    }
    if (body.action === "weather") {
      if (!isCoordinate(body.lat) || !isCoordinate(body.lon) || body.lat > 90 || body.lat < -90) {
        return jsonResponse({ error: "위치 좌표가 올바르지 않아요." }, 400, corsHeaders);
      }
      const params = { lat: body.lat, lon: body.lon, units: "metric", lang: "kr" };
      const [current, forecast] = await Promise.all([
        openWeather("/data/2.5/weather", params),
        openWeather("/data/2.5/forecast", params),
      ]);
      return jsonResponse({ current, forecast }, 200, corsHeaders);
    }
    return jsonResponse({ error: "요청 종류를 확인할 수 없어요." }, 400, corsHeaders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "요청을 처리하는 중 문제가 생겼어요.";
    return jsonResponse({ error: message }, 502, corsHeaders);
  }
});
