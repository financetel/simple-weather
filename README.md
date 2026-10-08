# SimpleWeather 웹 앱

도시와 동네를 검색해 현재 날씨와 5일 예보를 확인하는 한국어 웹 앱입니다.

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
- `NCP_MAPS_API_KEY_ID`: 네이버 클라우드 Maps Client ID (선택)
- `NCP_MAPS_API_KEY`: 네이버 클라우드 Maps Client Secret (선택)

네이버 Maps를 사용하려면 두 Maps 키를 모두 Repository secrets에 추가한 다음 **Actions → Deploy weather function to Supabase → Run workflow**로 함수를 배포합니다. Maps 키는 Supabase Edge Function에만 전달되며 브라우저 설정에는 포함되지 않습니다. 한국 주소 검색과 좌표의 행정동 조회는 Maps API를 우선 사용하고, 키가 없거나 일시적으로 사용할 수 없으면 기존 OpenStreetMap 검색을 사용합니다.

## 배포

1. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. GitHub Pages 워크플로는 `web/` 또는 해당 워크플로 파일이 `main` 브랜치에서 변경되면 실행됩니다. 프런트엔드는 `https://financetel.github.io/simple-weather/`에 배포됩니다.
3. Supabase 워크플로는 `supabase/` 또는 해당 워크플로 파일이 `main` 브랜치에서 변경되면 실행됩니다. 필요하면 **Actions → Deploy weather function to Supabase → Run workflow**에서 수동으로 실행할 수 있습니다.

`SUPABASE_API_KEY`는 웹 브라우저에 전달되는 공개용 키입니다. OpenWeather API 키와 Supabase 개인 액세스 토큰은 반드시 GitHub secrets 및 Supabase 서버 측에만 보관하세요.

`weather` 함수는 공개 웹사이트에서 호출할 수 있도록 JWT 검증을 끄고 `https://financetel.github.io`의 브라우저 origin만 CORS로 허용합니다. CORS만으로 공개 API 호출을 완전히 제한할 수 없으므로 OpenWeather 사용량을 확인하세요.

## 검색 및 데이터 출처

도시, 구, 동 이름을 검색할 수 있습니다. `강남`, `분당`, `해운대`, `수원`, `서울` 등 주요 시·구 및 별칭은 내장 행정구역 데이터셋을 통해 0ms 만에 즉시 검색됩니다. `부평동`, `중앙동`처럼 전국에 같은 이름의 동이 여러 개 있으면 직관적인 위치 선택 카드 목록에서 원하는 지역을 원클릭으로 선택할 수 있습니다. `역삼` 또는 `역삼동`처럼 접미사 유무에 상관없이 동 이름을 유연하게 자동 검색하며, `서울 강남구`와 같은 복합 주소도 지원합니다. 상세 한국 주소 검색 및 행정동 조회는 네이버 클라우드 Maps Geocoding/Reverse Geocoding API를 우선 사용하고, 사용할 수 없는 경우 OpenStreetMap Nominatim을 대체 검색으로 사용합니다. OpenStreetMap 데이터는 © OpenStreetMap contributors, ODbL에 따라 제공됩니다.

날씨 데이터는 OpenWeather에서 제공합니다. 무료 예보는 3시간 간격 5일 예보이며, 자외선 지수와 공식 기상특보는 포함되지 않습니다.
