"""Small OpenWeather client for the SimpleWeather desktop app."""

from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

BASE_URL = "https://api.openweathermap.org"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
TIMEOUT_SECONDS = 15
NOMINATIM_MIN_INTERVAL = 1.1
_nominatim_lock = threading.Lock()
_nominatim_last_request = 0.0
_nominatim_cache: dict[tuple[float, float], dict[str, str]] = {}


def config_path() -> Path:
    root = Path(os.environ.get("APPDATA", Path.home())) / "SimpleWeather"
    return root / "config.json"


def load_api_key() -> str:
    """Read a key from the environment or the user's private config file."""
    env_key = os.environ.get("OPENWEATHER_API_KEY", "").strip()
    if env_key:
        return env_key
    path = config_path()
    try:
        import json

        value = json.loads(path.read_text(encoding="utf-8"))
        configured_key = str(value.get("api_key", "")).strip()
        if configured_key:
            return configured_key
    except (OSError, ValueError, AttributeError):
        pass
    try:
        from build_key import API_KEY  # created locally by build.ps1; intentionally git-ignored

        return API_KEY.strip()
    except (ImportError, AttributeError):
        return ""


def save_api_key(key: str) -> None:
    import json

    path = config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"api_key": key.strip()}, ensure_ascii=False, indent=2), encoding="utf-8")


class WeatherApiError(Exception):
    pass


def _request(path: str, params: dict[str, Any], api_key: str) -> Any:
    query = {**params, "appid": api_key}
    try:
        response = requests.get(f"{BASE_URL}{path}", params=query, timeout=TIMEOUT_SECONDS)
    except requests.Timeout as exc:
        raise WeatherApiError("요청 시간이 초과됐어요. 인터넷 연결을 확인하고 다시 시도해 주세요.") from exc
    except requests.RequestException as exc:
        raise WeatherApiError("인터넷에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.") from exc

    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.ok:
        return payload

    code = response.status_code
    if code == 401:
        raise WeatherApiError("API 키가 유효하지 않거나 아직 활성화되지 않았어요. API 키 설정을 확인해 주세요.")
    if code == 404:
        raise WeatherApiError("요청한 날씨 정보를 찾지 못했어요.")
    if code == 429:
        raise WeatherApiError("API 호출 한도에 도달했어요. 잠시 후 다시 시도해 주세요.")
    if code >= 500:
        raise WeatherApiError("OpenWeather 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.")
    message = payload.get("message", "요청을 처리할 수 없어요.") if isinstance(payload, dict) else "요청을 처리할 수 없어요."
    raise WeatherApiError(f"날씨 요청 오류: {message}")


def _reverse_korean_address(lat: float, lon: float) -> dict[str, str]:
    global _nominatim_last_request

    cache_key = (round(lat, 5), round(lon, 5))
    with _nominatim_lock:
        cached = _nominatim_cache.get(cache_key)
        if cached is not None:
            return cached

        wait = NOMINATIM_MIN_INTERVAL - (time.monotonic() - _nominatim_last_request)
        if wait > 0:
            time.sleep(wait)
        try:
            response = requests.get(
                NOMINATIM_URL,
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "jsonv2",
                    "zoom": 18,
                    "addressdetails": 1,
                },
                headers={"User-Agent": "SimpleWeather/1.0 (Korean address lookup)"},
                timeout=TIMEOUT_SECONDS,
            )
            _nominatim_last_request = time.monotonic()
            response.raise_for_status()
            payload = response.json()
        except requests.Timeout as exc:
            raise WeatherApiError("동 주소 정보를 가져오는 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.") from exc
        except requests.RequestException as exc:
            raise WeatherApiError("동 주소 정보 서비스에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.") from exc
        except ValueError as exc:
            raise WeatherApiError("동 주소 정보 서비스에서 올바르지 않은 응답을 받았어요.") from exc

        address = payload.get("address") if isinstance(payload, dict) else None
        if not isinstance(address, dict):
            raise WeatherApiError("해당 동의 상세 행정구역 정보를 찾지 못했어요.")

        location = {
            "region": address.get("province") or address.get("state", ""),
            "city": address.get("city") or address.get("town") or address.get("municipality", ""),
            "district": address.get("borough") or address.get("city_district") or address.get("district", ""),
            "administrative_dong": address.get("suburb") or address.get("city_block", ""),
            "legal_dong": address.get("quarter") or address.get("neighbourhood", ""),
        }
        _nominatim_cache[cache_key] = location
        return location


@dataclass
class City:
    name: str
    country: str
    state: str
    lat: float
    lon: float
    parent: str = ""
    region: str = ""
    district: str = ""
    administrative_dong: str = ""
    legal_dong: str = ""

    @property
    def label(self) -> str:
        if self.country == "KR" and any((
            self.region,
            self.parent,
            self.district,
            self.administrative_dong,
            self.legal_dong,
        )):
            parts = [
                self.region,
                self.parent,
                self.district,
                self.legal_dong,
                self.administrative_dong,
                self.name,
            ]
            unique_parts = []
            seen = set()
            for part in parts:
                normalized = " ".join(part.casefold().split())
                if part and normalized not in seen:
                    unique_parts.append(part)
                    seen.add(normalized)
            return " ".join(unique_parts)

        if self.parent and self.country == "KR":
            return f"{self.parent} {self.name}, 대한민국"

        parts = [self.name]
        if self.state:
            parts.append(self.state)
        if self.country:
            parts.append(self.country)
        return ", ".join(parts)


class OpenWeather:
    def __init__(self, api_key: str):
        self.api_key = api_key.strip()

    def search_cities(self, query: str) -> list[City]:
        normalized_query = " ".join(query.casefold().split())
        if normalized_query == "서울":
            search_query = "Seoul,KR"
        elif normalized_query.endswith(("구", "동")):
            search_query = f"{query},KR"
        else:
            search_query = query
        results = _request("/geo/1.0/direct", {"q": search_query, "limit": 5}, self.api_key)
        cities = []
        exact_matches = []
        for item in results if isinstance(results, list) else []:
            local_names = item.get("local_names") or {}
            korean_name = str(local_names.get("ko", ""))
            city = City(
                name=korean_name or item.get("name", ""),
                country=item.get("country", ""),
                state=item.get("state", ""),
                lat=float(item["lat"]),
                lon=float(item["lon"]),
            )
            is_korean_dong_result = (
                city.country == "KR"
                and korean_name.endswith(("동", "리"))
                and normalized_query in korean_name.casefold()
            )
            if city.country == "KR" and (
                normalized_query.endswith("동")
                or is_korean_dong_result
            ):
                address = _reverse_korean_address(city.lat, city.lon)
                city.region = address["region"]
                city.parent = address["city"]
                city.district = address["district"]
                city.administrative_dong = address["administrative_dong"]
                city.legal_dong = address["legal_dong"]
            elif normalized_query.endswith("구") and city.country == "KR" and not city.state:
                parent_results = _request(
                    "/geo/1.0/reverse",
                    {"lat": city.lat, "lon": city.lon, "limit": 1},
                    self.api_key,
                )
                if parent_results:
                    parent = parent_results[0]
                    city.parent = (
                        (parent.get("local_names") or {}).get("ko")
                        or parent.get("name", "")
                    )
            cities.append(city)
            names = [item.get("name", ""), *local_names.values()]
            if any(" ".join(str(name).casefold().split()) == normalized_query for name in names):
                exact_matches.append(city)

        if len(exact_matches) == 1:
            return exact_matches
        return cities

    def get_weather(self, city: City) -> dict[str, Any]:
        current = _request(
            "/data/2.5/weather",
            {"lat": city.lat, "lon": city.lon, "units": "metric", "lang": "kr"},
            self.api_key,
        )
        forecast = _request(
            "/data/2.5/forecast",
            {"lat": city.lat, "lon": city.lon, "units": "metric", "lang": "kr"},
            self.api_key,
        )

        return {
            "current": current,
            "forecast": forecast,
        }
