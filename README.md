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

## 웹 버전 배포 (financetel GitHub Pages + 별도 Supabase 프로젝트)

브라우저 웹 버전은 `web/`에 있고, `supabase/functions/weather/`의 Edge Function이 OpenWeather 요청을 중계합니다. OpenWeather API 키는 Supabase의 서버 측 Secret에만 저장하며, 프런트엔드에는 공개용 Supabase URL과 anon key만 전달됩니다.

1. 기존 게시판 Supabase 프로젝트가 아닌 새 Supabase 프로젝트를 만들고 프로젝트 URL, legacy anon key (JWT 형식), project ref를 확인합니다. Edge Function의 JWT 검증을 사용하므로 publishable key 대신 anon key를 사용합니다.
2. Supabase Dashboard의 Edge Functions Secrets에 다음 값을 설정합니다.
   - `OPENWEATHER_API_KEY`: OpenWeather API 키
   - `ALLOWED_ORIGINS`: `https://financetel.github.io` (커스텀 도메인을 쓰면 그 도메인도 쉼표로 추가)
3. Supabase CLI로 함수 배포:

   ```powershell
   supabase login
   supabase link --project-ref <project-ref>
   supabase functions deploy weather
   ```

4. 이 프로젝트를 새 GitHub 저장소 `financetel/simple-weather`의 `main` 브랜치에 올리고, 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
5. 저장소 **Settings → Secrets and variables → Actions → Variables**에 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`를 추가합니다. GitHub Actions가 이 공개 클라이언트 설정을 배포 파일에 생성합니다. anon key는 공개 클라이언트 키이며, `OPENWEATHER_API_KEY`는 여기에 넣지 않습니다.
6. `web/` 또는 배포 워크플로 변경을 `main`에 푸시하면 GitHub Pages 배포가 실행됩니다.

배포 URL은 `https://financetel.github.io/simple-weather/`이고 브라우저 요청 origin은 `https://financetel.github.io`입니다. 설정된 origin이 실제 사이트와 일치하지 않으면 브라우저 요청이 거부됩니다.

이 앱은 검색·날씨 결과를 저장하지 않아 별도 DB 테이블은 만들지 않습니다. Supabase Postgres는 프로젝트에 포함되지만 앱 요청은 Edge Function을 통해 OpenWeather로 전달됩니다.

공개 웹사이트의 Supabase Edge Function은 방문자가 호출할 수 있으므로 OpenWeather 사용량 한도를 확인하고 키별 호출 한도를 관리하세요. 브라우저 설정에 포함된 anon key는 공개 클라이언트 키이며, OpenWeather API 키와는 다릅니다.
