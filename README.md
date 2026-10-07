# SimpleWeather

도시별 현재 날씨와 5일 예보를 확인하는 Windows 데스크톱 앱입니다. 무료 제공 API만 사용하며 예보는 3시간 간격으로 표시합니다. Python과 PySide6로 만들었습니다.

## 실행

1. Python 3.10 이상을 설치합니다.
2. 이 폴더에서 가상 환경을 만들고 의존성을 설치합니다.

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

3. `python main.py`를 실행하고, 첫 실행 때 OpenWeather API 키를 입력합니다. 로컬 실행 키는 `%APPDATA%\SimpleWeather\config.json`에 저장됩니다.

도시·구·동 이름까지 검색할 수 있습니다. 도시 이름과 정확히 일치하는 검색 결과가 하나면 해당 도시의 날씨를 바로 표시합니다. 같은 이름의 도시가 여러 곳이면 목록에서 위치를 선택할 수 있습니다. 한국의 동 단위 검색은 OpenStreetMap의 역지오코딩을 이용해 시·도, 시·군·구, 법정동·행정동을 가능한 범위에서 함께 표시합니다. OpenStreetMap 데이터는 © OpenStreetMap contributors, ODbL에 따라 제공됩니다.

## Windows 실행 파일 만들기

`build.ps1`은 앱의 로컬 설정 키를 읽어 실행 파일 안에 포함합니다. 환경 변수 `OPENWEATHER_API_KEY`가 있으면 그 키를 사용하고, 없으면 위의 설정 파일에서 읽습니다.

```powershell
.\build.ps1 -OutputName SimpleWeather_Free
```

결과물은 `dist\SimpleWeather_Free.exe`입니다. 개인 사용용 키를 실행 파일에 포함하면 별도 키 입력 없이 실행할 수 있습니다. 실행 파일에서 키를 추출할 수 있으므로 이 파일을 다른 사람과 공유하지 마세요.

## 사용 API

- 현재 날씨: [Current Weather Data](https://openweathermap.org/api/current)
- 5일 예보(3시간 간격): [5 Day / 3 Hour Forecast](https://openweathermap.org/api/forecast5)
- 도시명 좌표 변환: [Geocoding API](https://openweathermap.org/api/geocoding-api)
- OpenWeather 가격 및 무료 플랜 범위: [Pricing](https://openweathermap.org/price)

현재 화면의 UV 지수와 공식 기상특보는 무료 API에 포함되지 않아 표시하지 않습니다. 날씨 설명은 선택한 도시의 시간대와 섭씨 단위로 보여줍니다.

## 웹 버전 배포 (financetel GitHub Pages + 기존 Supabase 프로젝트)

브라우저 웹 버전은 `web/`에 있고, `supabase/functions/weather/`의 Edge Function이 OpenWeather 요청을 중계합니다. OpenWeather API 키는 Supabase의 서버 측 Secret에만 저장하며, 프런트엔드에는 공개용 Supabase URL과 anon key만 전달됩니다.

1. 이미 사용 중인 게시판 Supabase 프로젝트를 재사용합니다. 이 기능은 기존 테이블이나 Storage를 변경하지 않고 `weather` Edge Function만 배포합니다. 이 프로젝트의 Project URL, Project ref, `sb_publishable_...` 형태의 publishable key를 확인합니다.
2. GitHub 저장소 `financetel/simple-weather`의 **Settings → Secrets and variables → Actions**에서 다음 **Variables**를 만듭니다.
   - `SUPABASE_URL`: 기존 프로젝트의 Project URL
   - `SUPABASE_API_KEY`: 기존 프로젝트의 publishable key
3. 같은 곳에서 다음 **Repository secrets**를 만듭니다.
   - `SUPABASE_ACCESS_TOKEN`: Supabase Dashboard → Account → Access Tokens에서 만든 개인 액세스 토큰
   - `OPENWEATHER_API_KEY`: OpenWeather API 키
4. **Variables**에 `SUPABASE_PROJECT_REF`를 추가합니다. 기존 프로젝트의 Project ref를 사용합니다.
5. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다. GitHub Actions가 웹사이트를 `https://financetel.github.io/simple-weather/`에 배포합니다.
6. 저장소의 **Actions → Deploy weather function to Supabase → Run workflow**를 실행합니다. 이후 `supabase/` 변경을 `main`에 푸시하면 함수가 자동 재배포됩니다.

웹 프런트엔드는 `web/` 변경을 `main`에 푸시할 때 자동 배포됩니다. Supabase 함수는 `supabase/` 변경 또는 수동 실행 때 자동 배포됩니다.

이 앱은 검색·날씨 결과를 저장하지 않아 별도 DB 테이블은 만들지 않습니다. Supabase Postgres는 프로젝트에 포함되지만 앱 요청은 Edge Function을 통해 OpenWeather로 전달됩니다.

`weather` 함수는 비로그인 공개 웹사이트에서 호출할 수 있도록 JWT 검증을 끄고, `https://financetel.github.io`의 브라우저 origin만 CORS로 허용합니다. CORS는 API 키가 아니므로 공개 엔드포인트를 완전히 보호하지는 않습니다. OpenWeather 사용량 한도를 확인하고, 필요하면 별도의 요청 제한을 추가하세요. `SUPABASE_API_KEY`는 브라우저에 노출되는 publishable key이며 OpenWeather API 키와 Supabase 개인 액세스 토큰은 반드시 비밀로 유지합니다.
