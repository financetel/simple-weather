# SimpleWeather 웹 앱

대한민국 행정구역을 검색해 해당 지역의 현재 날씨와 5일 예보를 확인하는 한국어 웹 앱입니다. 해외 도시는 OpenWeather 검색으로 찾을 수 있습니다.

## 구성

- `web/`: GitHub Pages에 공개되는 웹 페이지
- `supabase/functions/weather/`: OpenWeather 요청을 중계하는 Supabase Edge Function
- `.github/workflows/deploy-pages.yml`: GitHub Pages 배포 워크플로
- `.github/workflows/deploy-supabase.yml`: Supabase 함수 배포 워크플로

날씨 검색 결과는 데이터베이스에 저장하지 않으며, Supabase DB 테이블을 추가할 필요가 없습니다.

## GitHub 및 Supabase 설정

기존 Supabase 프로젝트를 사용합니다. 이 앱은 해당 프로젝트의 테이블이나 Storage를 수정하지 않고 `weather` Edge Function만 사용합니다.

GitHub 저장소의 **Settings → Secrets and variables → Actions**에서 설정합니다.

**Variables**

- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_API_KEY`: 브라우저에서 사용할 Supabase publishable key
- `SUPABASE_PROJECT_REF`: Supabase Project ref

**Repository secrets**

- `SUPABASE_ACCESS_TOKEN`: Supabase 개인 액세스 토큰
- `OPENWEATHER_API_KEY`: OpenWeather API 키

## 배포

1. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. GitHub Pages 워크플로는 `web/` 또는 해당 워크플로 파일이 `main` 브랜치에서 변경되면 실행됩니다. 프런트엔드는 `https://financetel.github.io/simple-weather/`에 배포됩니다.
3. Supabase 워크플로는 `supabase/` 또는 해당 워크플로 파일이 `main` 브랜치에서 변경되면 실행됩니다. 필요하면 **Actions → Deploy weather function to Supabase → Run workflow**에서 수동으로 실행할 수 있습니다.

`SUPABASE_API_KEY`는 웹 브라우저에 전달되는 공개용 키입니다. OpenWeather API 키와 Supabase 개인 액세스 토큰은 반드시 GitHub secrets 및 Supabase 서버 측에만 보관하세요.

`weather` 함수는 공개 웹사이트에서 호출할 수 있도록 JWT 검증을 끄고 `https://financetel.github.io`의 브라우저 origin만 CORS로 허용합니다. CORS만으로 공개 API 호출을 완전히 제한할 수 없으므로 OpenWeather 사용량을 확인하세요.

## 검색 및 데이터 출처

한국 행정구역 검색은 제공된 `행정구역별_위경도_좌표.xlsx`를 변환한 `web/korean-administrative-areas.js`를 사용합니다. 시·도, 시·군·구, 읍·면·동, 리 이름을 조합해 검색하고, 동명이 여러 지역에 있으면 후보 목록에서 선택할 수 있습니다. 좌표가 없는 32개 행은 날씨 조회 대상으로 사용할 수 없어 데이터 파일에서 제외했습니다. 검색은 브라우저 안에서 처리되며 한국 주소 검색을 위해 외부 지오코딩 서비스를 호출하지 않습니다. 한국 행정구역 데이터에서 결과를 찾지 못하면 해외 도시 검색을 사용합니다.

날씨 데이터는 OpenWeather에서 제공합니다. 무료 예보는 3시간 간격 5일 예보이며, 자외선 지수와 공식 기상특보는 포함되지 않습니다.
