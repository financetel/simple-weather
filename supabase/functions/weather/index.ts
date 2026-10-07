const OPENWEATHER_BASE = "https://api.openweathermap.org";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const REQUEST_TIMEOUT_MS = 15_000;
const NOMINATIM_MIN_INTERVAL_MS = 1_100;

type City = {
  name: string;
  country: string;
  state: string;
  lat: number;
  lon: number;
  parent?: string;
  region?: string;
  district?: string;
  administrative_dong?: string;
  legal_dong?: string;
  address_warning?: string;
};

type JsonRecord = Record<string, unknown>;

const addressCache = new Map<string, Record<string, string>>();
let lastNominatimRequestAt = 0;
let nominatimQueue: Promise<void> = Promise.resolve();

function jsonResponse(body: JsonRecord, status: number, corsHeaders: HeadersInit): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
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

async function reverseKoreanAddress(lat: number, lon: number): Promise<Record<string, string>> {
  const cacheKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = addressCache.get(cacheKey);
  if (cached) return cached;

  const task = nominatimQueue.then(async () => {
    const queuedCache = addressCache.get(cacheKey);
    if (queuedCache) return queuedCache;
    const delay = NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimRequestAt);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    lastNominatimRequestAt = Date.now();
    let response: Response;
    try {
      response = await fetch(NOMINATIM_URL + "?" + new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        format: "jsonv2",
        zoom: "18",
        addressdetails: "1",
      }), {
        headers: { "User-Agent": "SimpleWeather/1.0 (Korean address lookup)" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new Error("동 주소 정보 서비스에 연결할 수 없어요.");
    }
    if (!response.ok) throw new Error("동 주소 정보를 가져오지 못했어요.");
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("동 주소 정보 서비스에서 올바르지 않은 응답을 받았어요.");
    }
    const address = (payload as JsonRecord)?.address;
    if (!address || typeof address !== "object") {
      throw new Error("해당 동의 상세 행정구역 정보를 찾지 못했어요.");
    }
    const values = address as Record<string, string>;
    const location = {
      region: values.province || values.state || "",
      city: values.city || values.town || values.municipality || "",
      district: values.borough || values.city_district || values.district || "",
      administrative_dong: values.suburb || values.city_block || "",
      legal_dong: values.quarter || values.neighbourhood || "",
    };
    addressCache.set(cacheKey, location);
    return location;
  });
  nominatimQueue = task.then(() => undefined, () => undefined);
  return task;
}

async function searchCities(query: string): Promise<City[]> {
  const normalized = query.toLocaleLowerCase("ko-KR").trim().replace(/\s+/g, " ");
  const searchQuery = normalized === "서울"
    ? "Seoul,KR"
    : normalized.endsWith("구") || normalized.endsWith("동")
    ? `${query},KR`
    : query;
  const result = await openWeather("/geo/1.0/direct", { q: searchQuery, limit: 5 });
  const items = Array.isArray(result) ? result as JsonRecord[] : [];
  const cities: City[] = [];
  const exactMatches: City[] = [];
  let reverseGeocodingUnavailable = false;

  for (const item of items) {
    const localNames = (item.local_names && typeof item.local_names === "object")
      ? item.local_names as Record<string, string>
      : {};
    const koreanName = localNames.ko || "";
    const city: City = {
      name: koreanName || String(item.name || ""),
      country: String(item.country || ""),
      state: String(item.state || ""),
      lat: Number(item.lat),
      lon: Number(item.lon),
    };
    const koreanDong = city.country === "KR"
      && koreanName.endsWith("동")
      && koreanName.toLocaleLowerCase("ko-KR").includes(normalized);
    if (city.country === "KR" && (normalized.endsWith("동") || koreanDong)) {
      if (!reverseGeocodingUnavailable) {
        try {
          const address = await reverseKoreanAddress(city.lat, city.lon);
          city.region = address.region;
          city.parent = address.city;
          city.district = address.district;
          city.administrative_dong = address.administrative_dong;
          city.legal_dong = address.legal_dong;
        } catch (error) {
          reverseGeocodingUnavailable = true;
          city.address_warning = "동 위치는 찾았지만 상세 행정구역 정보를 가져오지 못했어요.";
          console.warn("Korean reverse geocoding failed; returning the OpenWeather result.", error);
        }
      }
      if (reverseGeocodingUnavailable && !city.address_warning) {
        city.address_warning = "동 위치는 찾았지만 상세 행정구역 정보를 가져오지 못했어요.";
      }
    } else if (normalized.endsWith("구") && city.country === "KR" && !city.state) {
      const parents = await openWeather("/geo/1.0/reverse", { lat: city.lat, lon: city.lon, limit: 1 });
      if (Array.isArray(parents) && parents[0]) {
        const parent = parents[0] as JsonRecord;
        const names = parent.local_names && typeof parent.local_names === "object"
          ? parent.local_names as Record<string, string>
          : {};
        city.parent = names.ko || String(parent.name || "");
      }
    }
    cities.push(city);
    const allNames = [item.name, ...Object.values(localNames)];
    if (allNames.some((name) => String(name || "").toLocaleLowerCase("ko-KR").trim().replace(/\s+/g, " ") === normalized)) {
      exactMatches.push(city);
    }
  }
  return exactMatches.length === 1 ? exactMatches : cities;
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
