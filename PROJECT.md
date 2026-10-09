# SimpleWeather 프로젝트 상태

## 목적

대한민국 행정구역 또는 해외 도시를 선택해 현재 날씨와 5일 예보를 보여주는 정적 웹 앱입니다. 프런트엔드는 GitHub Pages, 날씨 API 중계는 Supabase Edge Function을 사용합니다.

## 현재 기능

- 한국 지역은 제공된 `행정구역별_위경도_좌표.xlsx`에서 변환한 `web/korean-administrative-areas.js`의 좌표로 검색합니다.
- 좌표가 있는 21,784개 행정구역을 사용합니다. 첨부 파일의 좌표 누락 행 32개는 제외했습니다.
- 같은 이름의 읍·면·동 등이 여러 지역에 있으면 선택 목록을 표시합니다.
- 해외 도시는 OpenWeather 지오코딩을 사용하고, 날씨 및 예보는 기존 OpenWeather 경로로 조회합니다.
- 한국 지역 검색에서 네이버 Maps, OpenStreetMap, 이전의 수작업 행정구역 목록은 사용하지 않습니다.

## 최근 변경

- 검색 화면을 행정구역 검색 중심으로 변경했습니다.
- 한국 주소 검색 및 역지오코딩 코드를 프런트엔드와 Supabase 함수에서 제거했습니다.
- Supabase 배포 워크플로와 README에서 Naver Maps 키 설정을 제거했습니다.

## 변경 파일

- `web/index.html`, `web/app.js`
- `web/korean-administrative-areas.js` (엑셀에서 생성)
- `web/korean-districts.js` (이전 데이터 제거)
- `supabase/functions/weather/index.ts`
- `.github/workflows/deploy-supabase.yml`, `README.md`

## 다음 단계

- 로컬에서 행정구역 검색과 날씨 조회를 직접 실행해 확인합니다.
- 확인이 끝나면 사용자가 요청할 때 GitHub에 저장하고 배포합니다.
