(() => {
  "use strict";

  const config = window.APP_CONFIG || {};
  const form = document.querySelector("#search-form");
  const queryInput = document.querySelector("#city-query");
  const searchButton = document.querySelector("#search-button");
  const pickerContainer = document.querySelector("#city-picker-container");
  const pickerList = document.querySelector("#city-picker-list");
  const pickerTitle = document.querySelector("#city-picker-title");
  const picker = document.querySelector("#city-picker");
  const status = document.querySelector("#status");
  const content = document.querySelector("#weather-content");

  let pendingCities = [];
  const addressCache = new Map();
  const localitySearchCache = new Map();
  const regionSearchCache = new Map();
  let addressQueue = Promise.resolve();
  let lastAddressRequestAt = 0;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.dataset.error = String(isError);
  }

  function setBusy(busy, message = "") {
    searchButton.disabled = busy;
    queryInput.disabled = busy;
    if (message) setStatus(message);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function cityLabel(city) {
    if (city.country === "KR") {
      const dong = city.legal_dong || city.administrative_dong || (city.name !== city.parent && city.name !== city.district ? city.name : "");
      const parts = [city.region, city.parent, city.district, dong].filter(Boolean);
      if (parts.length) {
        return [...new Set(parts.map((p) => p.toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim()))]
          .map((norm) => parts.find((p) => p.toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim() === norm))
          .join(" ");
      }
    }
    if (city.parent && city.country === "KR") return `${city.parent} ${city.name}, 대한민국`;
    const country = city.country === "KR" ? "대한민국" : city.country;
    return [city.name, city.state, country].filter(Boolean).join(", ");
  }

  function wmoWeatherToOpenWeather(code) {
    if (code === 0) return { id: 800, description: "맑음", icon: "01d" };
    if (code === 1) return { id: 801, description: "대체로 맑음", icon: "02d" };
    if (code === 2) return { id: 802, description: "구름 조금", icon: "03d" };
    if (code === 3) return { id: 804, description: "흐림", icon: "04d" };
    if (code >= 45 && code <= 48) return { id: 741, description: "안개", icon: "50d" };
    if (code >= 51 && code <= 67) return { id: 500, description: "비", icon: "10d" };
    if (code >= 71 && code <= 77) return { id: 600, description: "눈", icon: "13d" };
    if (code >= 80 && code <= 82) return { id: 502, description: "소나기", icon: "09d" };
    if (code >= 85 && code <= 86) return { id: 602, description: "눈보라", icon: "13d" };
    if (code >= 95) return { id: 200, description: "천둥번개", icon: "11d" };
    return { id: 800, description: "맑음", icon: "01d" };
  }

  async function fetchLocalWeatherFallback(payload) {
    if (payload.action === "search") {
      const q = encodeURIComponent(payload.query || "");
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=5&language=ko&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        const cities = (data.results || []).map((item) => ({
          name: item.name,
          country: item.country_code || "",
          state: item.admin1 || "",
          lat: item.latitude,
          lon: item.longitude,
          region: item.admin1 || "",
        }));
        return { cities };
      } catch {
        return { cities: [] };
      }
    }

    if (payload.action === "weather") {
      const lat = payload.lat;
      const lon = payload.lon;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto`;
      let res;
      try {
        res = await fetch(url);
      } catch {
        throw new Error("날씨 정보를 불러올 수 없어요. 인터넷 연결을 확인해 주세요.");
      }
      if (!res.ok) throw new Error("날씨 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.");
      const data = await res.json();
      const c = data.current || {};
      const d = data.daily || {};
      const h = data.hourly || {};
      const weatherInfo = wmoWeatherToOpenWeather(c.weather_code || 0);

      const current = {
        dt: Math.floor(new Date(c.time || Date.now()).getTime() / 1000),
        timezone: data.utc_offset_seconds || 0,
        main: {
          temp: c.temperature_2m ?? 0,
          feels_like: c.apparent_temperature ?? c.temperature_2m ?? 0,
          humidity: c.relative_humidity_2m ?? 0,
          pressure: Math.round(c.surface_pressure ?? 1013),
        },
        weather: [weatherInfo],
        wind: { speed: c.wind_speed_10m ?? 0 },
        rain: { "1h": c.rain || 0 },
        snow: { "1h": c.snowfall || 0 },
        clouds: { all: (c.weather_code === 3 ? 80 : (c.weather_code === 2 ? 40 : 10)) },
        sys: {
          sunrise: d.sunrise && d.sunrise[0] ? Math.floor(new Date(d.sunrise[0]).getTime() / 1000) : 0,
          sunset: d.sunset && d.sunset[0] ? Math.floor(new Date(d.sunset[0]).getTime() / 1000) : 0,
        },
      };

      const list = [];
      const times = h.time || [];
      for (let i = 0; i < times.length && list.length < 40; i += 3) {
        list.push({
          dt: Math.floor(new Date(times[i]).getTime() / 1000),
          main: { temp: h.temperature_2m ? h.temperature_2m[i] : 0 },
          weather: [wmoWeatherToOpenWeather(h.weather_code ? h.weather_code[i] : 0)],
          pop: h.precipitation_probability ? (h.precipitation_probability[i] || 0) / 100 : 0,
        });
      }

      return { current, forecast: { list } };
    }

    throw new Error("지원하지 않는 요청입니다.");
  }

  async function callWeatherFunction(payload) {
    const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
    const apiKey = String(config.supabaseApiKey || "");
    if (!baseUrl || !apiKey) {
      return fetchLocalWeatherFallback(payload);
    }
    let response;
    try {
      response = await fetch(`${baseUrl}/functions/v1/weather`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.");
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("서버에서 올바르지 않은 응답을 받았어요.");
    }
    if (!response.ok) throw new Error(result.error || "요청을 처리할 수 없어요.");
    return result;
  }

  async function searchKoreanLocalities(query) {
    const norm = query.trim().replace(/\s+/g, " ");
    const cacheKey = norm;
    const cached = localitySearchCache.get(cacheKey);
    if (cached) return cached;

    const request = addressQueue.then(async () => {
      const queuedCache = localitySearchCache.get(cacheKey);
      if (queuedCache) return queuedCache;

      const searchTerms = [];
      if (/[동리읍면구군시]$/.test(norm)) {
        searchTerms.push(norm);
      } else {
        searchTerms.push(`${norm}동`, `${norm}구`, norm);
      }

      const cities = [];

      for (const term of searchTerms) {
        const delay = 1100 - (Date.now() - lastAddressRequestAt);
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
        lastAddressRequestAt = Date.now();

        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({
          q: `${term}, 대한민국`,
          format: "jsonv2",
          addressdetails: "1",
          countrycodes: "kr",
          limit: "10",
        }).toString();

        let response;
        try {
          response = await fetch(url, {
            headers: { "Accept-Language": "ko" },
            signal: AbortSignal.timeout(15000),
          });
        } catch {
          continue;
        }
        if (!response.ok) continue;

        const results = await response.json();
        if (!Array.isArray(results)) continue;

        for (const result of results) {
          const values = result.address && typeof result.address === "object" ? result.address : {};
          const lat = Number(result.lat);
          const lon = Number(result.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

          const dong = values.quarter || values.suburb || values.neighbourhood || values.village || (/[동리읍면]$/.test(result.name) ? result.name : "");
          const district = values.borough || values.city_district || values.district || values.county || "";
          const parent = values.city || values.town || values.municipality || "";
          const region = values.province || values.state || "";

          const city = {
            name: dong || result.name || term,
            country: "KR",
            state: "",
            lat,
            lon,
            region,
            parent,
            district,
            administrative_dong: values.suburb || "",
            legal_dong: dong,
          };

          const label = cityLabel(city);
          const duplicate = cities.some((c) => cityLabel(c) === label
            || (Math.abs(c.lat - lat) < 0.005 && Math.abs(c.lon - lon) < 0.005));

          if (!duplicate) {
            cities.push(city);
          }
        }

        if (cities.length > 0 && /[동리읍면]$/.test(norm)) {
          break;
        }
      }

      localitySearchCache.set(cacheKey, cities);
      return cities;
    });

    addressQueue = request.then(() => undefined, () => undefined);
    return request;
  }

  async function resolveKoreanAddress(city) {
    if (city.country !== "KR") return city;
    const needsAddress = Boolean(city.address_warning)
      || (/[동리]$/.test(city.name) && (!city.parent || !city.district));
    if (!needsAddress) return city;
    const cacheKey = `${Number(city.lat).toFixed(5)},${Number(city.lon).toFixed(5)}`;
    let address = addressCache.get(cacheKey);
    if (!address) {
      const request = addressQueue.then(async () => {
        const queuedCache = addressCache.get(cacheKey);
        if (queuedCache) return queuedCache;
        const delay = 1100 - (Date.now() - lastAddressRequestAt);
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
        lastAddressRequestAt = Date.now();
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.search = new URLSearchParams({
          lat: String(city.lat),
          lon: String(city.lon),
          format: "jsonv2",
          zoom: "18",
          addressdetails: "1",
        }).toString();
        const response = await fetch(url, {
          headers: { "Accept-Language": "ko" },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(`Nominatim returned ${response.status}.`);
        const result = await response.json();
        if (!result.address || typeof result.address !== "object") {
          throw new Error("Nominatim did not return address details.");
        }
        const values = result.address;
        const resolved = {
          region: values.province || values.state || "",
          parent: values.city || values.town || values.municipality || "",
          district: values.borough || values.city_district || values.district || "",
          administrative_dong: values.suburb || values.city_block || "",
          legal_dong: values.quarter || values.neighbourhood || "",
        };
        addressCache.set(cacheKey, resolved);
        return resolved;
      });
      addressQueue = request.then(() => undefined, () => undefined);
      try {
        address = await request;
      } catch (error) {
        console.warn("Browser-side Korean address lookup failed.", error);
        return city;
      }
    }
    Object.assign(city, address);
    delete city.address_warning;
    return city;
  }

  function hideCandidatePicker() {
    if (pickerContainer) pickerContainer.hidden = true;
    if (picker) picker.hidden = true;
  }

  function showCandidatePicker(cities) {
    pendingCities = cities;
    if (!pickerContainer || !pickerList) return;

    pickerList.replaceChildren();
    if (pickerTitle) {
      pickerTitle.textContent = `여러 위치가 검색되었습니다 (${cities.length}곳). 원하시는 위치를 선택해 주세요:`;
    }

    cities.forEach((city, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "city-picker-btn";
      btn.setAttribute("role", "option");

      const icon = document.createElement("span");
      icon.className = "btn-icon";
      icon.textContent = "📍";
      icon.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.className = "btn-text";
      text.textContent = cityLabel(city);

      const badge = document.createElement("span");
      badge.className = "btn-badge";
      badge.textContent = "선택";

      btn.append(icon, text, badge);
      btn.addEventListener("click", () => {
        hideCandidatePicker();
        selectCity(city);
      });

      pickerList.appendChild(btn);
    });

    pickerContainer.hidden = false;
    setStatus("원하시는 위치를 위 목록에서 선택해 주세요.");

    const firstBtn = pickerList.querySelector("button");
    if (firstBtn) firstBtn.focus();
  }

  function selectCity(city) {
    hideCandidatePicker();
    setBusy(true, `${cityLabel(city)} 날씨를 불러오고 있어요…`);
    return resolveKoreanAddress(city)
      .then((resolvedCity) => callWeatherFunction({
        action: "weather",
        lat: resolvedCity.lat,
        lon: resolvedCity.lon,
      }).then((weather) => renderWeather(resolvedCity, weather)))
      .catch((error) => setStatus(error.message, true))
      .finally(() => setBusy(false));
  }

  async function searchCities(query) {
    hideCandidatePicker();
    content.replaceChildren();
    setBusy(true, `‘${query}’ 위치를 찾고 있어요…`);

    const normalized = query.trim().replace(/\s+/g, " ");

    // 1단계: 내장 대한민국 행정구역 DB 탐색
    let localMatches = [];
    if (typeof window.findKoreanDistricts === "function") {
      localMatches = window.findKoreanDistricts(normalized);
    }

    const isSpecificDong = /[동리읍면]$/.test(normalized) || /\s+[^\s]+[동리읍면]$/.test(normalized);

    if (localMatches.length === 1 && !isSpecificDong) {
      setBusy(false);
      return selectCity(localMatches[0]);
    }

    if (localMatches.length > 1 && !isSpecificDong) {
      setBusy(false);
      return showCandidatePicker(localMatches);
    }

    // 2단계: 동/읍/면 또는 세부 주소 Nominatim 지오코딩
    try {
      const localityResults = await searchKoreanLocalities(normalized);
      if (localityResults.length === 1) {
        setBusy(false);
        return selectCity(localityResults[0]);
      }
      if (localityResults.length > 1) {
        setBusy(false);
        return showCandidatePicker(localityResults);
      }
    } catch (err) {
      console.warn("Locality search failed:", err);
    }

    // 로컬 매칭 결과가 있었던 경우 그것이라도 표시
    if (localMatches.length > 0) {
      setBusy(false);
      if (localMatches.length === 1) return selectCity(localMatches[0]);
      return showCandidatePicker(localMatches);
    }

    // 3단계: 해외 도시 및 영문 폴백 (OpenWeather / Open-Meteo)
    try {
      const { cities } = await callWeatherFunction({ action: "search", query });
      setBusy(false);
      pendingCities = Array.isArray(cities) ? cities : [];
      if (!pendingCities.length) {
        setStatus("위치를 찾지 못했어요. 동·구·시 또는 한글·영문 이름으로 다시 검색해 주세요.", true);
        return;
      }
      if (pendingCities.length === 1) {
        return selectCity(pendingCities[0]);
      }
      showCandidatePicker(pendingCities);
    } catch (error) {
      setBusy(false);
      setStatus(error.message, true);
    }
  }

  function localDate(timestamp, offsetSeconds, options) {
    const local = new Date((Number(timestamp) + offsetSeconds) * 1000);
    return new Intl.DateTimeFormat("ko-KR", { ...options, timeZone: "UTC" }).format(local);
  }

  function weatherEmoji(weather = {}) {
    const code = Number(weather.id || 0);
    if (code >= 200 && code < 300) return "⛈️";
    if (code >= 300 && code < 600) return "🌧️";
    if (code >= 600 && code < 700) return "❄️";
    if (code >= 700 && code < 800) return "🌫️";
    if (code === 800) return String(weather.icon || "").endsWith("d") ? "☀️" : "🌙";
    if (code > 800) return "☁️";
    return "🌤️";
  }

  function metric(label, value) {
    const item = el("div", "metric");
    item.append(el("span", "metric-label", label), el("strong", "metric-value", value));
    return item;
  }

  function renderWeather(city, payload) {
    const current = payload.current || {};
    const forecast = (payload.forecast || {}).list || [];
    const main = current.main || {};
    const weather = (current.weather || [{}])[0];
    const offset = Number(current.timezone || 0);
    content.replaceChildren();

    const hero = el("section", "weather-hero");
    hero.setAttribute("aria-label", "현재 날씨");
    hero.append(
      el("h2", "weather-location", cityLabel(city)),
      el("p", "weather-stamp", `${localDate(current.dt, offset, { year: "numeric", month: "long", day: "numeric", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} 기준`)
    );
    if (city.address_warning) {
      hero.append(el("p", "weather-stamp", city.address_warning));
    }
    const line = el("div", "current-line");
    line.append(
      el("span", "weather-icon", weatherEmoji(weather)),
      el("strong", "current-temp", `${Math.round(Number(main.temp || 0))}°`)
    );
    const description = el("div", "");
    description.append(
      el("p", "current-description", weather.description || "날씨 정보"),
      el("p", "feels-like", `체감 ${Math.round(Number(main.feels_like ?? main.temp ?? 0))}°C`)
    );
    line.append(description);
    hero.append(line);
    content.append(hero);

    const rain = current.rain || {};
    const snow = current.snow || {};
    const wind = current.wind || {};
    const clouds = current.clouds || {};
    const system = current.sys || {};
    const metrics = el("section", "metrics");
    metrics.setAttribute("aria-label", "날씨 상세 정보");
    metrics.append(
      metric("습도", `${main.humidity ?? "—"}%`),
      metric("바람", `${Number(wind.speed || 0).toFixed(1)} m/s`),
      metric("기압", `${main.pressure ?? "—"} hPa`),
      metric("최근 강수", `${(Number(rain["1h"] || 0) + Number(snow["1h"] || 0)).toFixed(1)} mm/h`),
      metric("가시거리", `${(Number(current.visibility || 10000) / 1000).toFixed(1)} km`),
      metric("구름", `${clouds.all ?? "—"}%`),
      metric("일출", system.sunrise ? localDate(system.sunrise, offset, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "—"),
      metric("일몰", system.sunset ? localDate(system.sunset, offset, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "—")
    );
    content.append(metrics);
    content.append(el("p", "availability", "3시간 간격 · 5일 예보"));
    renderHourly(forecast, offset);
    renderDaily(forecast, offset);
    setStatus(`${cityLabel(city)} · 최신 날씨 정보`);
  }

  function renderHourly(records, offset) {
    content.append(el("h2", "section-title", "3시간 간격 예보 · 5일"));
    if (!records.length) {
      content.append(el("p", "empty-result", "예보 자료가 아직 없어요."));
      return;
    }
    const track = el("div", "forecast-track");
    track.setAttribute("aria-label", "3시간 간격 예보");
    for (const record of records.slice(0, 48)) {
      const weather = (record.weather || [{}])[0];
      const card = el("article", "forecast-card");
      card.append(
        el("strong", "forecast-time", localDate(record.dt, offset, { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })),
        el("span", "forecast-icon", weatherEmoji(weather)),
        el("strong", "forecast-temp", `${Math.round(Number((record.main || {}).temp || 0))}°`)
      );
      if (record.pop !== undefined) card.append(el("span", "forecast-rain", `강수 ${Math.round(Number(record.pop) * 100)}%`));
      track.append(card);
    }
    content.append(track);
  }

  function renderDaily(records, offset) {
    content.append(el("h2", "section-title", "날짜별 요약 (3시간 예보 집계)"));
    if (!records.length) {
      content.append(el("p", "empty-result", "일별 예보 자료가 아직 없어요."));
      return;
    }
    const days = new Map();
    for (const record of records) {
      const key = localDate(record.dt, offset, { year: "numeric", month: "2-digit", day: "2-digit" });
      if (!days.has(key)) days.set(key, []);
      days.get(key).push(record);
    }
    const list = el("div", "daily-list");
    for (const entries of days.values()) {
      const temperatures = entries.map((item) => Number((item.main || {}).temp || 0));
      const representative = entries.reduce((best, item) => {
        const hour = Number(localDate(item.dt, offset, { hour: "2-digit", hourCycle: "h23" }));
        const bestHour = Number(localDate(best.dt, offset, { hour: "2-digit", hourCycle: "h23" }));
        return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? item : best;
      });
      const weather = (representative.weather || [{}])[0];
      const card = el("article", "daily-card");
      card.append(
        el("strong", "daily-date", localDate(representative.dt, offset, { month: "long", day: "numeric", weekday: "short" })),
        el("span", "daily-icon", weatherEmoji(weather)),
        el("span", "daily-description", weather.description || ""),
        el("span", "daily-rain", `강수 ${Math.round(Math.max(...entries.map((item) => Number(item.pop || 0))) * 100)}%`),
        el("span", "daily-high", `최고 ${Math.round(Math.max(...temperatures))}°`),
        el("span", "daily-low", `최저 ${Math.round(Math.min(...temperatures))}°`)
      );
      list.append(card);
    }
    content.append(list);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = queryInput.value.trim();
    if (!query) {
      setStatus("먼저 도시 또는 동네 이름을 입력해 주세요.", true);
      return;
    }
    searchCities(query);
  });
})();
