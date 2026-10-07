(() => {
  "use strict";

  const config = window.APP_CONFIG || {};
  const form = document.querySelector("#search-form");
  const queryInput = document.querySelector("#city-query");
  const postcodeInput = document.querySelector("#postcode");
  const detailAddressInput = document.querySelector("#detail-address");
  const addressSearchButton = document.querySelector("#address-search-button");
  const searchButton = document.querySelector("#search-button");
  const picker = document.querySelector("#city-picker");
  const pickerLabel = document.querySelector("#city-picker-label");
  const status = document.querySelector("#status");
  const content = document.querySelector("#weather-content");
  let pendingCities = [];
  let selectedAddress = null;
  const addressCache = new Map();
  let addressQueue = Promise.resolve();
  let lastAddressRequestAt = 0;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.dataset.error = String(isError);
  }

  function setBusy(busy, message = "") {
    searchButton.disabled = busy;
    queryInput.disabled = busy;
    postcodeInput.disabled = busy;
    detailAddressInput.disabled = busy;
    addressSearchButton.disabled = busy;
    if (message) setStatus(message);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function cityLabel(city) {
    if (city.country === "KR" && [city.region, city.parent, city.district,
      city.legal_dong, city.administrative_dong].some(Boolean)) {
      const parts = [city.region, city.parent, city.district, city.legal_dong,
        city.administrative_dong, city.name].filter(Boolean);
      return [...new Map(parts.map((part) => [part.toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim(), part])).values()].join(" ");
    }
    if (city.parent && city.country === "KR") return `${city.parent} ${city.name}, 대한민국`;
    const country = city.country === "KR" ? "대한민국" : city.country;
    return [city.name, city.state, country].filter(Boolean).join(", ");
  }

  async function callWeatherFunction(payload) {
    const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
    const apiKey = String(config.supabaseApiKey || "");
    if (!baseUrl || !apiKey) {
      throw new Error("Supabase 설정이 아직 연결되지 않았어요. 배포 설정을 확인해 주세요.");
    }
    let response;
    try {
      response = await fetch(`${baseUrl}/functions/v1/weather`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
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
        if (!city.address_warning) {
          city.address_warning = "상세 행정구역 정보를 표시할 수 없어요.";
        }
        return city;
      }
    }
    Object.assign(city, address);
    delete city.address_warning;
    return city;
  }

  function selectCity(city) {
    picker.hidden = true;
    pickerLabel.hidden = true;
    setBusy(true, `${cityLabel(city)} 날씨를 불러오고 있어요…`);
    return resolveKoreanAddress(city)
      .then((resolvedCity) => callWeatherFunction({
        action: "weather",
        lat: resolvedCity.lat,
        lon: resolvedCity.lon
      }).then((weather) => renderWeather(resolvedCity, weather)))
      .catch((error) => setStatus(error.message, true))
      .finally(() => setBusy(false));
  }

  function searchCities(query) {
    picker.hidden = true;
    pickerLabel.hidden = true;
    content.replaceChildren();
    setBusy(true, `‘${query}’ 위치를 찾고 있어요…`);
    callWeatherFunction({ action: "search", query })
      .then(({ cities }) => {
        pendingCities = Array.isArray(cities) ? cities : [];
        if (!pendingCities.length) {
          setStatus("도시를 찾지 못했어요. 한글 또는 영문 이름으로 다시 검색해 주세요.");
          return;
        }
        if (pendingCities.length === 1) {
          return selectCity(pendingCities[0]);
        }
        picker.replaceChildren(...pendingCities.map((city, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = cityLabel(city);
          return option;
        }));
        pickerLabel.hidden = false;
        picker.hidden = false;
        setStatus("같은 이름의 위치가 있어요. 원하는 곳을 선택해 주세요.");
      })
      .catch((error) => setStatus(error.message, true))
      .finally(() => setBusy(false));
  }

  function addressSearchQuery(address) {
    const locality = [address.sido, address.sigungu, address.bname || address.hname]
      .filter((part, index, parts) => part && parts.indexOf(part) === index)
      .join(" ");
    return locality || address.jibunAddress || address.roadAddress;
  }

  function openAddressSearch() {
    if (!window.daum?.Postcode) {
      setStatus("주소 검색 서비스를 불러오지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.", true);
      return;
    }
    new window.daum.Postcode({
      oncomplete(address) {
        selectedAddress = address;
        postcodeInput.value = address.zonecode || "";
        queryInput.value = address.roadAddress || address.jibunAddress || "";
        detailAddressInput.value = "";
        detailAddressInput.focus();
        picker.hidden = true;
        pickerLabel.hidden = true;
        content.replaceChildren();
        setStatus("주소를 선택했어요. 상세주소를 입력한 뒤 날씨를 확인해 주세요.");
      }
    }).open();
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
      metric("가시거리", `${(Number(current.visibility || 0) / 1000).toFixed(1)} km`),
      metric("구름", `${clouds.all ?? "—"}%`),
      metric("일출", system.sunrise ? localDate(system.sunrise, offset, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "—"),
      metric("일몰", system.sunset ? localDate(system.sunset, offset, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "—")
    );
    content.append(metrics);
    content.append(el("p", "availability", "무료 예보: 3시간 간격 · 5일  |  자외선 지수와 공식 기상특보는 포함되지 않아요."));
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

  addressSearchButton.addEventListener("click", openAddressSearch);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedAddress) {
      setStatus("먼저 주소 검색 버튼에서 주소를 선택해 주세요.", true);
      return;
    }
    searchCities(addressSearchQuery(selectedAddress));
  });

  picker.addEventListener("change", () => {
    const city = pendingCities[Number(picker.value)];
    if (city) selectCity(city);
  });
})();
