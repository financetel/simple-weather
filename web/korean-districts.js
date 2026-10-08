(() => {
  "use strict";

  const DISTRICTS = [
  {
    "name": "서울특별시",
    "aliases": [
      "서울",
      "서울시",
      "수도"
    ],
    "region": "서울특별시",
    "lat": 37.5665,
    "lon": 126.978
  },
  {
    "name": "부산광역시",
    "aliases": [
      "부산",
      "부산시"
    ],
    "region": "부산광역시",
    "lat": 35.1796,
    "lon": 129.0756
  },
  {
    "name": "대구광역시",
    "aliases": [
      "대구",
      "대구시"
    ],
    "region": "대구광역시",
    "lat": 35.8714,
    "lon": 128.6014
  },
  {
    "name": "인천광역시",
    "aliases": [
      "인천",
      "인천시"
    ],
    "region": "인천광역시",
    "lat": 37.4563,
    "lon": 126.7052
  },
  {
    "name": "광주광역시",
    "aliases": [
      "광주",
      "광주시"
    ],
    "region": "광주광역시",
    "lat": 35.1595,
    "lon": 126.8526
  },
  {
    "name": "대전광역시",
    "aliases": [
      "대전",
      "대전시"
    ],
    "region": "대전광역시",
    "lat": 36.3504,
    "lon": 127.3845
  },
  {
    "name": "울산광역시",
    "aliases": [
      "울산",
      "울산시"
    ],
    "region": "울산광역시",
    "lat": 35.5384,
    "lon": 129.3114
  },
  {
    "name": "세종특별자치시",
    "aliases": [
      "세종",
      "세종시"
    ],
    "region": "세종특별자치시",
    "lat": 36.48,
    "lon": 127.289
  },
  {
    "name": "경기도",
    "aliases": [
      "경기"
    ],
    "region": "경기도",
    "lat": 37.275,
    "lon": 127.0094
  },
  {
    "name": "강원특별자치도",
    "aliases": [
      "강원",
      "강원도"
    ],
    "region": "강원특별자치도",
    "lat": 37.8854,
    "lon": 127.7298
  },
  {
    "name": "충청북도",
    "aliases": [
      "충북"
    ],
    "region": "충청북도",
    "lat": 36.6357,
    "lon": 127.4912
  },
  {
    "name": "충청남도",
    "aliases": [
      "충남"
    ],
    "region": "충청남도",
    "lat": 36.6588,
    "lon": 126.6728
  },
  {
    "name": "전북특별자치도",
    "aliases": [
      "전북",
      "전라북도"
    ],
    "region": "전북특별자치도",
    "lat": 35.8202,
    "lon": 127.1088
  },
  {
    "name": "전라남도",
    "aliases": [
      "전남"
    ],
    "region": "전라남도",
    "lat": 34.8161,
    "lon": 126.4629
  },
  {
    "name": "경상북도",
    "aliases": [
      "경북"
    ],
    "region": "경상북도",
    "lat": 36.576,
    "lon": 128.5056
  },
  {
    "name": "경상남도",
    "aliases": [
      "경남"
    ],
    "region": "경상남도",
    "lat": 35.2383,
    "lon": 128.6924
  },
  {
    "name": "제주특별자치도",
    "aliases": [
      "제주",
      "제주도"
    ],
    "region": "제주특별자치도",
    "lat": 33.4996,
    "lon": 126.5312
  },
  {
    "name": "강남구",
    "aliases": [
      "강남"
    ],
    "region": "서울특별시",
    "district": "강남구",
    "lat": 37.5172,
    "lon": 127.0473
  },
  {
    "name": "강동구",
    "aliases": [
      "강동"
    ],
    "region": "서울특별시",
    "district": "강동구",
    "lat": 37.5301,
    "lon": 127.1238
  },
  {
    "name": "강북구",
    "aliases": [
      "강북"
    ],
    "region": "서울특별시",
    "district": "강북구",
    "lat": 37.6396,
    "lon": 127.0257
  },
  {
    "name": "강서구",
    "aliases": [
      "서울 강서구"
    ],
    "region": "서울특별시",
    "district": "강서구",
    "lat": 37.5509,
    "lon": 126.8495
  },
  {
    "name": "관악구",
    "aliases": [
      "관악"
    ],
    "region": "서울특별시",
    "district": "관악구",
    "lat": 37.4784,
    "lon": 126.9516
  },
  {
    "name": "광진구",
    "aliases": [
      "광진"
    ],
    "region": "서울특별시",
    "district": "광진구",
    "lat": 37.5385,
    "lon": 127.0822
  },
  {
    "name": "구로구",
    "aliases": [
      "구로"
    ],
    "region": "서울특별시",
    "district": "구로구",
    "lat": 37.4954,
    "lon": 126.8874
  },
  {
    "name": "금천구",
    "aliases": [
      "금천"
    ],
    "region": "서울특별시",
    "district": "금천구",
    "lat": 37.4568,
    "lon": 126.8954
  },
  {
    "name": "노원구",
    "aliases": [
      "노원"
    ],
    "region": "서울특별시",
    "district": "노원구",
    "lat": 37.6542,
    "lon": 127.0568
  },
  {
    "name": "도봉구",
    "aliases": [
      "도봉"
    ],
    "region": "서울특별시",
    "district": "도봉구",
    "lat": 37.6688,
    "lon": 127.0471
  },
  {
    "name": "동대문구",
    "aliases": [
      "동대문"
    ],
    "region": "서울특별시",
    "district": "동대문구",
    "lat": 37.5744,
    "lon": 127.0398
  },
  {
    "name": "동작구",
    "aliases": [
      "동작"
    ],
    "region": "서울특별시",
    "district": "동작구",
    "lat": 37.5124,
    "lon": 126.9393
  },
  {
    "name": "마포구",
    "aliases": [
      "마포",
      "홍대",
      "홍대입구",
      "상암",
      "망원",
      "공덕"
    ],
    "region": "서울특별시",
    "district": "마포구",
    "lat": 37.5663,
    "lon": 126.9016
  },
  {
    "name": "서대문구",
    "aliases": [
      "서대문",
      "신촌",
      "연희동",
      "연남동"
    ],
    "region": "서울특별시",
    "district": "서대문구",
    "lat": 37.5791,
    "lon": 126.9368
  },
  {
    "name": "서초구",
    "aliases": [
      "서초",
      "양재",
      "반포",
      "방배",
      "강남역"
    ],
    "region": "서울특별시",
    "district": "서초구",
    "lat": 37.4837,
    "lon": 127.0324
  },
  {
    "name": "성동구",
    "aliases": [
      "성동",
      "성수",
      "성수동",
      "왕십리"
    ],
    "region": "서울특별시",
    "district": "성동구",
    "lat": 37.5633,
    "lon": 127.0371
  },
  {
    "name": "성북구",
    "aliases": [
      "성북",
      "안암",
      "성신여대"
    ],
    "region": "서울특별시",
    "district": "성북구",
    "lat": 37.5891,
    "lon": 127.0182
  },
  {
    "name": "송파구",
    "aliases": [
      "송파",
      "잠실",
      "문정",
      "가락동"
    ],
    "region": "서울특별시",
    "district": "송파구",
    "lat": 37.5145,
    "lon": 127.1066
  },
  {
    "name": "양천구",
    "aliases": [
      "양천",
      "목동"
    ],
    "region": "서울특별시",
    "district": "양천구",
    "lat": 37.5169,
    "lon": 126.8665
  },
  {
    "name": "영등포구",
    "aliases": [
      "영등포",
      "여의도",
      "여의도동",
      "문래동",
      "당산동"
    ],
    "region": "서울특별시",
    "district": "영등포구",
    "lat": 37.5263,
    "lon": 126.8962
  },
  {
    "name": "용산구",
    "aliases": [
      "용산",
      "이태원",
      "한남동"
    ],
    "region": "서울특별시",
    "district": "용산구",
    "lat": 37.5326,
    "lon": 126.99
  },
  {
    "name": "은평구",
    "aliases": [
      "은평",
      "연신내",
      "불광"
    ],
    "region": "서울특별시",
    "district": "은평구",
    "lat": 37.6027,
    "lon": 126.9291
  },
  {
    "name": "종로구",
    "aliases": [
      "종로",
      "광화문",
      "혜화",
      "대학로",
      "인사동"
    ],
    "region": "서울특별시",
    "district": "종로구",
    "lat": 37.573,
    "lon": 126.9794
  },
  {
    "name": "중구",
    "aliases": [
      "서울 중구",
      "명동"
    ],
    "region": "서울특별시",
    "district": "중구",
    "lat": 37.5641,
    "lon": 126.9979
  },
  {
    "name": "중랑구",
    "aliases": [
      "중랑"
    ],
    "region": "서울특별시",
    "district": "중랑구",
    "lat": 37.6065,
    "lon": 127.0927
  },
  {
    "name": "해운대구",
    "aliases": [
      "해운대"
    ],
    "region": "부산광역시",
    "district": "해운대구",
    "lat": 35.1631,
    "lon": 129.1636
  },
  {
    "name": "부산진구",
    "aliases": [
      "서면",
      "부산진"
    ],
    "region": "부산광역시",
    "district": "부산진구",
    "lat": 35.1631,
    "lon": 129.0532
  },
  {
    "name": "동래구",
    "aliases": [
      "동래"
    ],
    "region": "부산광역시",
    "district": "동래구",
    "lat": 35.2048,
    "lon": 129.0838
  },
  {
    "name": "남구",
    "aliases": [
      "부산 남구"
    ],
    "region": "부산광역시",
    "district": "남구",
    "lat": 35.1365,
    "lon": 129.0842
  },
  {
    "name": "북구",
    "aliases": [
      "부산 북구"
    ],
    "region": "부산광역시",
    "district": "북구",
    "lat": 35.197,
    "lon": 128.9903
  },
  {
    "name": "사하구",
    "aliases": [
      "사하"
    ],
    "region": "부산광역시",
    "district": "사하구",
    "lat": 35.1044,
    "lon": 128.9749
  },
  {
    "name": "금정구",
    "aliases": [
      "금정",
      "부산대"
    ],
    "region": "부산광역시",
    "district": "금정구",
    "lat": 35.2429,
    "lon": 129.0927
  },
  {
    "name": "강서구",
    "aliases": [
      "부산 강서구"
    ],
    "region": "부산광역시",
    "district": "강서구",
    "lat": 35.2122,
    "lon": 128.9806
  },
  {
    "name": "연제구",
    "aliases": [
      "연제"
    ],
    "region": "부산광역시",
    "district": "연제구",
    "lat": 35.1765,
    "lon": 129.0797
  },
  {
    "name": "수영구",
    "aliases": [
      "수영",
      "광안리"
    ],
    "region": "부산광역시",
    "district": "수영구",
    "lat": 35.1456,
    "lon": 129.113
  },
  {
    "name": "사상구",
    "aliases": [
      "사상"
    ],
    "region": "부산광역시",
    "district": "사상구",
    "lat": 35.1526,
    "lon": 128.9913
  },
  {
    "name": "기장군",
    "aliases": [
      "기장"
    ],
    "region": "부산광역시",
    "district": "기장군",
    "lat": 35.2445,
    "lon": 129.2223
  },
  {
    "name": "중구",
    "aliases": [
      "부산 중구",
      "남포동",
      "자갈치"
    ],
    "region": "부산광역시",
    "district": "중구",
    "lat": 35.1062,
    "lon": 129.0324
  },
  {
    "name": "서구",
    "aliases": [
      "부산 서구"
    ],
    "region": "부산광역시",
    "district": "서구",
    "lat": 35.0979,
    "lon": 129.0244
  },
  {
    "name": "동구",
    "aliases": [
      "부산 동구",
      "부산역"
    ],
    "region": "부산광역시",
    "district": "동구",
    "lat": 35.1293,
    "lon": 129.0454
  },
  {
    "name": "영도구",
    "aliases": [
      "영도",
      "태종대"
    ],
    "region": "부산광역시",
    "district": "영도구",
    "lat": 35.0912,
    "lon": 129.0679
  },
  {
    "name": "중구",
    "aliases": [
      "대구 중구",
      "동성로"
    ],
    "region": "대구광역시",
    "district": "중구",
    "lat": 35.8694,
    "lon": 128.6062
  },
  {
    "name": "동구",
    "aliases": [
      "대구 동구"
    ],
    "region": "대구광역시",
    "district": "동구",
    "lat": 35.8864,
    "lon": 128.6355
  },
  {
    "name": "서구",
    "aliases": [
      "대구 서구"
    ],
    "region": "대구광역시",
    "district": "서구",
    "lat": 35.8718,
    "lon": 128.5591
  },
  {
    "name": "남구",
    "aliases": [
      "대구 남구"
    ],
    "region": "대구광역시",
    "district": "남구",
    "lat": 35.8459,
    "lon": 128.5974
  },
  {
    "name": "북구",
    "aliases": [
      "대구 북구"
    ],
    "region": "대구광역시",
    "district": "북구",
    "lat": 35.8856,
    "lon": 128.5828
  },
  {
    "name": "수성구",
    "aliases": [
      "수성",
      "범어"
    ],
    "region": "대구광역시",
    "district": "수성구",
    "lat": 35.858,
    "lon": 128.6306
  },
  {
    "name": "달서구",
    "aliases": [
      "달서"
    ],
    "region": "대구광역시",
    "district": "달서구",
    "lat": 35.8298,
    "lon": 128.5327
  },
  {
    "name": "달성군",
    "aliases": [
      "달성"
    ],
    "region": "대구광역시",
    "district": "달성군",
    "lat": 35.7746,
    "lon": 128.4313
  },
  {
    "name": "군위군",
    "aliases": [
      "군위"
    ],
    "region": "대구광역시",
    "district": "군위군",
    "lat": 36.2428,
    "lon": 128.5728
  },
  {
    "name": "부평구",
    "aliases": [
      "부평",
      "부평역"
    ],
    "region": "인천광역시",
    "district": "부평구",
    "lat": 37.5074,
    "lon": 126.7219
  },
  {
    "name": "연수구",
    "aliases": [
      "연수",
      "송도",
      "송도국제도시"
    ],
    "region": "인천광역시",
    "district": "연수구",
    "lat": 37.4101,
    "lon": 126.6783
  },
  {
    "name": "남동구",
    "aliases": [
      "남동",
      "구월동"
    ],
    "region": "인천광역시",
    "district": "남동구",
    "lat": 37.4469,
    "lon": 126.7315
  },
  {
    "name": "미추홀구",
    "aliases": [
      "미추홀",
      "주안"
    ],
    "region": "인천광역시",
    "district": "미추홀구",
    "lat": 37.4635,
    "lon": 126.6502
  },
  {
    "name": "계양구",
    "aliases": [
      "계양",
      "작전동"
    ],
    "region": "인천광역시",
    "district": "계양구",
    "lat": 37.5374,
    "lon": 126.7378
  },
  {
    "name": "서구",
    "aliases": [
      "인천 서구",
      "청라",
      "검단"
    ],
    "region": "인천광역시",
    "district": "서구",
    "lat": 37.5454,
    "lon": 126.676
  },
  {
    "name": "중구",
    "aliases": [
      "인천 중구",
      "영종도",
      "월미도",
      "차이나타운"
    ],
    "region": "인천광역시",
    "district": "중구",
    "lat": 37.4738,
    "lon": 126.6215
  },
  {
    "name": "동구",
    "aliases": [
      "인천 동구"
    ],
    "region": "인천광역시",
    "district": "동구",
    "lat": 37.4738,
    "lon": 126.6433
  },
  {
    "name": "강화군",
    "aliases": [
      "강화",
      "강화도"
    ],
    "region": "인천광역시",
    "district": "강화군",
    "lat": 37.7465,
    "lon": 126.488
  },
  {
    "name": "옹진군",
    "aliases": [
      "옹진",
      "백령도"
    ],
    "region": "인천광역시",
    "district": "옹진군",
    "lat": 37.4465,
    "lon": 126.6368
  },
  {
    "name": "동구",
    "aliases": [
      "광주 동구"
    ],
    "region": "광주광역시",
    "district": "동구",
    "lat": 35.146,
    "lon": 126.9231
  },
  {
    "name": "서구",
    "aliases": [
      "광주 서구",
      "상무지구"
    ],
    "region": "광주광역시",
    "district": "서구",
    "lat": 35.152,
    "lon": 126.8895
  },
  {
    "name": "남구",
    "aliases": [
      "광주 남구",
      "봉선동"
    ],
    "region": "광주광역시",
    "district": "남구",
    "lat": 35.1328,
    "lon": 126.9025
  },
  {
    "name": "북구",
    "aliases": [
      "광주 북구"
    ],
    "region": "광주광역시",
    "district": "북구",
    "lat": 35.1741,
    "lon": 126.9121
  },
  {
    "name": "광산구",
    "aliases": [
      "광산",
      "수완지구",
      "송정"
    ],
    "region": "광주광역시",
    "district": "광산구",
    "lat": 35.1395,
    "lon": 126.7937
  },
  {
    "name": "동구",
    "aliases": [
      "대전 동구",
      "대전역"
    ],
    "region": "대전광역시",
    "district": "동구",
    "lat": 36.312,
    "lon": 127.455
  },
  {
    "name": "중구",
    "aliases": [
      "대전 중구",
      "은행동"
    ],
    "region": "대전광역시",
    "district": "중구",
    "lat": 36.3255,
    "lon": 127.4215
  },
  {
    "name": "서구",
    "aliases": [
      "대전 서구",
      "둔산",
      "둔산동"
    ],
    "region": "대전광역시",
    "district": "서구",
    "lat": 36.3553,
    "lon": 127.3837
  },
  {
    "name": "유성구",
    "aliases": [
      "유성",
      "카이스트",
      "대덕연구단지"
    ],
    "region": "대전광역시",
    "district": "유성구",
    "lat": 36.3622,
    "lon": 127.3563
  },
  {
    "name": "대덕구",
    "aliases": [
      "대덕",
      "신탄진"
    ],
    "region": "대전광역시",
    "district": "대덕구",
    "lat": 36.3465,
    "lon": 127.4158
  },
  {
    "name": "중구",
    "aliases": [
      "울산 중구"
    ],
    "region": "울산광역시",
    "district": "중구",
    "lat": 35.5696,
    "lon": 129.3328
  },
  {
    "name": "남구",
    "aliases": [
      "울산 남구",
      "삼산동"
    ],
    "region": "울산광역시",
    "district": "남구",
    "lat": 35.5439,
    "lon": 129.3301
  },
  {
    "name": "동구",
    "aliases": [
      "울산 동구",
      "방어진",
      "일산지"
    ],
    "region": "울산광역시",
    "district": "동구",
    "lat": 35.5048,
    "lon": 129.4168
  },
  {
    "name": "북구",
    "aliases": [
      "울산 북구"
    ],
    "region": "울산광역시",
    "district": "북구",
    "lat": 35.5828,
    "lon": 129.3615
  },
  {
    "name": "울주군",
    "aliases": [
      "울주",
      "언양"
    ],
    "region": "울산광역시",
    "district": "울주군",
    "lat": 35.5562,
    "lon": 129.1558
  },
  {
    "name": "수원시",
    "aliases": [
      "수원"
    ],
    "region": "경기도",
    "parent": "수원시",
    "lat": 37.2636,
    "lon": 127.0286
  },
  {
    "name": "영통구",
    "aliases": [
      "영통",
      "광교"
    ],
    "region": "경기도",
    "parent": "수원시",
    "district": "영통구",
    "lat": 37.2596,
    "lon": 127.0465
  },
  {
    "name": "팔달구",
    "aliases": [
      "팔달",
      "인계동"
    ],
    "region": "경기도",
    "parent": "수원시",
    "district": "팔달구",
    "lat": 37.2825,
    "lon": 127.017
  },
  {
    "name": "장안구",
    "aliases": [
      "장안"
    ],
    "region": "경기도",
    "parent": "수원시",
    "district": "장안구",
    "lat": 37.3039,
    "lon": 127.0089
  },
  {
    "name": "권선구",
    "aliases": [
      "권선"
    ],
    "region": "경기도",
    "parent": "수원시",
    "district": "권선구",
    "lat": 37.2576,
    "lon": 126.9721
  },
  {
    "name": "성남시",
    "aliases": [
      "성남"
    ],
    "region": "경기도",
    "parent": "성남시",
    "lat": 37.42,
    "lon": 127.1265
  },
  {
    "name": "분당구",
    "aliases": [
      "분당",
      "판교",
      "정자동",
      "야탑"
    ],
    "region": "경기도",
    "parent": "성남시",
    "district": "분당구",
    "lat": 37.3827,
    "lon": 127.1189
  },
  {
    "name": "수정구",
    "aliases": [
      "수정",
      "위례"
    ],
    "region": "경기도",
    "parent": "성남시",
    "district": "수정구",
    "lat": 37.4497,
    "lon": 127.1498
  },
  {
    "name": "중원구",
    "aliases": [
      "중원"
    ],
    "region": "경기도",
    "parent": "성남시",
    "district": "중원구",
    "lat": 37.432,
    "lon": 127.1368
  },
  {
    "name": "고양시",
    "aliases": [
      "고양",
      "일산"
    ],
    "region": "경기도",
    "parent": "고양시",
    "lat": 37.6584,
    "lon": 126.832
  },
  {
    "name": "일산동구",
    "aliases": [
      "일산동",
      "백석",
      "마두"
    ],
    "region": "경기도",
    "parent": "고양시",
    "district": "일산동구",
    "lat": 37.6583,
    "lon": 126.776
  },
  {
    "name": "일산서구",
    "aliases": [
      "일산서",
      "주엽",
      "대화"
    ],
    "region": "경기도",
    "parent": "고양시",
    "district": "일산서구",
    "lat": 37.6763,
    "lon": 126.7479
  },
  {
    "name": "덕양구",
    "aliases": [
      "덕양",
      "화정",
      "삼송",
      "원흥"
    ],
    "region": "경기도",
    "parent": "고양시",
    "district": "덕양구",
    "lat": 37.6373,
    "lon": 126.8327
  },
  {
    "name": "용인시",
    "aliases": [
      "용인"
    ],
    "region": "경기도",
    "parent": "용인시",
    "lat": 37.2411,
    "lon": 127.1776
  },
  {
    "name": "수지구",
    "aliases": [
      "수지",
      "죽전",
      "동천"
    ],
    "region": "경기도",
    "parent": "용인시",
    "district": "수지구",
    "lat": 37.3223,
    "lon": 127.0975
  },
  {
    "name": "기흥구",
    "aliases": [
      "기흥",
      "동백"
    ],
    "region": "경기도",
    "parent": "용인시",
    "district": "기흥구",
    "lat": 37.2804,
    "lon": 127.1147
  },
  {
    "name": "처인구",
    "aliases": [
      "처인"
    ],
    "region": "경기도",
    "parent": "용인시",
    "district": "처인구",
    "lat": 37.2343,
    "lon": 127.2013
  },
  {
    "name": "부천시",
    "aliases": [
      "부천",
      "중동",
      "상동"
    ],
    "region": "경기도",
    "parent": "부천시",
    "lat": 37.5034,
    "lon": 126.766
  },
  {
    "name": "안양시",
    "aliases": [
      "안양",
      "평촌",
      "범계"
    ],
    "region": "경기도",
    "parent": "안양시",
    "lat": 37.3943,
    "lon": 126.9568
  },
  {
    "name": "안산시",
    "aliases": [
      "안산",
      "상록수",
      "중앙역"
    ],
    "region": "경기도",
    "parent": "안산시",
    "lat": 37.3219,
    "lon": 126.8309
  },
  {
    "name": "화성시",
    "aliases": [
      "화성",
      "동탄",
      "동탄신도시",
      "향남"
    ],
    "region": "경기도",
    "parent": "화성시",
    "lat": 37.1995,
    "lon": 126.8315
  },
  {
    "name": "평택시",
    "aliases": [
      "평택",
      "고덕",
      "송탄"
    ],
    "region": "경기도",
    "parent": "평택시",
    "lat": 36.9921,
    "lon": 127.1129
  },
  {
    "name": "시흥시",
    "aliases": [
      "시흥",
      "배곧",
      "정왕"
    ],
    "region": "경기도",
    "parent": "시흥시",
    "lat": 37.3802,
    "lon": 126.803
  },
  {
    "name": "김포시",
    "aliases": [
      "김포",
      "한강신도시",
      "구래"
    ],
    "region": "경기도",
    "parent": "김포시",
    "lat": 37.6153,
    "lon": 126.7157
  },
  {
    "name": "의정부시",
    "aliases": [
      "의정부"
    ],
    "region": "경기도",
    "parent": "의정부시",
    "lat": 37.7381,
    "lon": 127.0337
  },
  {
    "name": "파주시",
    "aliases": [
      "파주",
      "운정",
      "운정신도시"
    ],
    "region": "경기도",
    "parent": "파주시",
    "lat": 37.76,
    "lon": 126.7799
  },
  {
    "name": "남양주시",
    "aliases": [
      "남양주",
      "다산",
      "별내"
    ],
    "region": "경기도",
    "parent": "남양주시",
    "lat": 37.636,
    "lon": 127.2165
  },
  {
    "name": "광명시",
    "aliases": [
      "광명",
      "철산",
      "광명역"
    ],
    "region": "경기도",
    "parent": "광명시",
    "lat": 37.4786,
    "lon": 126.8647
  },
  {
    "name": "하남시",
    "aliases": [
      "하남",
      "미사",
      "미사강변"
    ],
    "region": "경기도",
    "parent": "하남시",
    "lat": 37.5393,
    "lon": 127.2148
  },
  {
    "name": "군포시",
    "aliases": [
      "군포",
      "산본"
    ],
    "region": "경기도",
    "parent": "군포시",
    "lat": 37.3614,
    "lon": 126.9352
  },
  {
    "name": "오산시",
    "aliases": [
      "오산",
      "세교"
    ],
    "region": "경기도",
    "parent": "오산시",
    "lat": 37.1498,
    "lon": 127.0772
  },
  {
    "name": "이천시",
    "aliases": [
      "이천"
    ],
    "region": "경기도",
    "parent": "이천시",
    "lat": 37.2723,
    "lon": 127.435
  },
  {
    "name": "구리시",
    "aliases": [
      "구리",
      "수택동"
    ],
    "region": "경기도",
    "parent": "구리시",
    "lat": 37.5943,
    "lon": 127.1295
  },
  {
    "name": "안성시",
    "aliases": [
      "안성"
    ],
    "region": "경기도",
    "parent": "안성시",
    "lat": 37.008,
    "lon": 127.2797
  },
  {
    "name": "포천시",
    "aliases": [
      "포천"
    ],
    "region": "경기도",
    "parent": "포천시",
    "lat": 37.8949,
    "lon": 127.2003
  },
  {
    "name": "의왕시",
    "aliases": [
      "의왕",
      "백운호수"
    ],
    "region": "경기도",
    "parent": "의왕시",
    "lat": 37.3448,
    "lon": 126.9682
  },
  {
    "name": "양주시",
    "aliases": [
      "양주",
      "옥정"
    ],
    "region": "경기도",
    "parent": "양주시",
    "lat": 37.8514,
    "lon": 127.0458
  },
  {
    "name": "여주시",
    "aliases": [
      "여주"
    ],
    "region": "경기도",
    "parent": "여주시",
    "lat": 37.2984,
    "lon": 127.6371
  },
  {
    "name": "동두천시",
    "aliases": [
      "동두천"
    ],
    "region": "경기도",
    "parent": "동두천시",
    "lat": 37.9036,
    "lon": 127.0607
  },
  {
    "name": "과천시",
    "aliases": [
      "과천"
    ],
    "region": "경기도",
    "parent": "과천시",
    "lat": 37.4292,
    "lon": 126.9877
  },
  {
    "name": "가평군",
    "aliases": [
      "가평"
    ],
    "region": "경기도",
    "parent": "가평군",
    "lat": 37.8315,
    "lon": 127.5097
  },
  {
    "name": "양평군",
    "aliases": [
      "양평"
    ],
    "region": "경기도",
    "parent": "양평군",
    "lat": 37.4918,
    "lon": 127.4876
  },
  {
    "name": "연천군",
    "aliases": [
      "연천"
    ],
    "region": "경기도",
    "parent": "연천군",
    "lat": 38.0964,
    "lon": 127.075
  },
  {
    "name": "춘천시",
    "aliases": [
      "춘천"
    ],
    "region": "강원특별자치도",
    "parent": "춘천시",
    "lat": 37.8813,
    "lon": 127.7298
  },
  {
    "name": "원주시",
    "aliases": [
      "원주"
    ],
    "region": "강원특별자치도",
    "parent": "원주시",
    "lat": 37.3422,
    "lon": 127.9202
  },
  {
    "name": "강릉시",
    "aliases": [
      "강릉",
      "경포대",
      "주문진"
    ],
    "region": "강원특별자치도",
    "parent": "강릉시",
    "lat": 37.7519,
    "lon": 128.8761
  },
  {
    "name": "속초시",
    "aliases": [
      "속초",
      "설악산"
    ],
    "region": "강원특별자치도",
    "parent": "속초시",
    "lat": 38.207,
    "lon": 128.5918
  },
  {
    "name": "동해시",
    "aliases": [
      "동해",
      "묵호"
    ],
    "region": "강원특별자치도",
    "parent": "동해시",
    "lat": 37.5247,
    "lon": 129.1143
  },
  {
    "name": "태백시",
    "aliases": [
      "태백"
    ],
    "region": "강원특별자치도",
    "parent": "태백시",
    "lat": 37.1641,
    "lon": 128.9856
  },
  {
    "name": "삼척시",
    "aliases": [
      "삼척"
    ],
    "region": "강원특별자치도",
    "parent": "삼척시",
    "lat": 37.4499,
    "lon": 129.1653
  },
  {
    "name": "홍천군",
    "aliases": [
      "홍천"
    ],
    "region": "강원특별자치도",
    "parent": "홍천군",
    "lat": 37.6972,
    "lon": 127.8887
  },
  {
    "name": "평창군",
    "aliases": [
      "평창"
    ],
    "region": "강원특별자치도",
    "parent": "평창군",
    "lat": 37.3705,
    "lon": 128.3902
  },
  {
    "name": "정선군",
    "aliases": [
      "정선"
    ],
    "region": "강원특별자치도",
    "parent": "정선군",
    "lat": 37.3806,
    "lon": 128.6608
  },
  {
    "name": "철원군",
    "aliases": [
      "철원"
    ],
    "region": "강원특별자치도",
    "parent": "철원군",
    "lat": 38.1468,
    "lon": 127.3134
  },
  {
    "name": "화천군",
    "aliases": [
      "화천"
    ],
    "region": "강원특별자치도",
    "parent": "화천군",
    "lat": 38.1062,
    "lon": 127.7082
  },
  {
    "name": "양양군",
    "aliases": [
      "양양"
    ],
    "region": "강원특별자치도",
    "parent": "양양군",
    "lat": 38.0754,
    "lon": 128.6189
  },
  {
    "name": "고성군",
    "aliases": [
      "강원 고성"
    ],
    "region": "강원특별자치도",
    "parent": "고성군",
    "lat": 38.3806,
    "lon": 128.4678
  },
  {
    "name": "인제군",
    "aliases": [
      "인제"
    ],
    "region": "강원특별자치도",
    "parent": "인제군",
    "lat": 38.0697,
    "lon": 128.1704
  },
  {
    "name": "횡성군",
    "aliases": [
      "횡성"
    ],
    "region": "강원특별자치도",
    "parent": "횡성군",
    "lat": 37.4919,
    "lon": 127.985
  },
  {
    "name": "영월군",
    "aliases": [
      "영월"
    ],
    "region": "강원특별자치도",
    "parent": "영월군",
    "lat": 37.1838,
    "lon": 128.4619
  },
  {
    "name": "양구군",
    "aliases": [
      "양구"
    ],
    "region": "강원특별자치도",
    "parent": "양구군",
    "lat": 38.1054,
    "lon": 127.9897
  },
  {
    "name": "청주시",
    "aliases": [
      "청주"
    ],
    "region": "충청북도",
    "parent": "청주시",
    "lat": 36.6424,
    "lon": 127.489
  },
  {
    "name": "흥덕구",
    "aliases": [
      "흥덕",
      "오송",
      "복대동"
    ],
    "region": "충청북도",
    "parent": "청주시",
    "district": "흥덕구",
    "lat": 36.6349,
    "lon": 127.4338
  },
  {
    "name": "청원구",
    "aliases": [
      "청원",
      "오창"
    ],
    "region": "충청북도",
    "parent": "청주시",
    "district": "청원구",
    "lat": 36.6718,
    "lon": 127.4897
  },
  {
    "name": "상당구",
    "aliases": [
      "상당",
      "성안길"
    ],
    "region": "충청북도",
    "parent": "청주시",
    "district": "상당구",
    "lat": 36.63,
    "lon": 127.5098
  },
  {
    "name": "서원구",
    "aliases": [
      "서원",
      "산남동"
    ],
    "region": "충청북도",
    "parent": "청주시",
    "district": "서원구",
    "lat": 36.611,
    "lon": 127.466
  },
  {
    "name": "충주시",
    "aliases": [
      "충주"
    ],
    "region": "충청북도",
    "parent": "충주시",
    "lat": 36.991,
    "lon": 127.9259
  },
  {
    "name": "제천시",
    "aliases": [
      "제천"
    ],
    "region": "충청북도",
    "parent": "제천시",
    "lat": 37.1326,
    "lon": 128.191
  },
  {
    "name": "음성군",
    "aliases": [
      "음성"
    ],
    "region": "충청북도",
    "parent": "음성군",
    "lat": 36.9341,
    "lon": 127.6908
  },
  {
    "name": "진천군",
    "aliases": [
      "진천"
    ],
    "region": "충청북도",
    "parent": "진천군",
    "lat": 36.8553,
    "lon": 127.4431
  },
  {
    "name": "옥천군",
    "aliases": [
      "옥천"
    ],
    "region": "충청북도",
    "parent": "옥천군",
    "lat": 36.3064,
    "lon": 127.5714
  },
  {
    "name": "영동군",
    "aliases": [
      "영동"
    ],
    "region": "충청북도",
    "parent": "영동군",
    "lat": 36.1751,
    "lon": 127.7759
  },
  {
    "name": "증평군",
    "aliases": [
      "증평"
    ],
    "region": "충청북도",
    "parent": "증평군",
    "lat": 36.7853,
    "lon": 127.5814
  },
  {
    "name": "괴산군",
    "aliases": [
      "괴산"
    ],
    "region": "충청북도",
    "parent": "괴산군",
    "lat": 36.8153,
    "lon": 127.7866
  },
  {
    "name": "보은군",
    "aliases": [
      "보은",
      "속리산"
    ],
    "region": "충청북도",
    "parent": "보은군",
    "lat": 36.4894,
    "lon": 127.7294
  },
  {
    "name": "단양군",
    "aliases": [
      "단양"
    ],
    "region": "충청북도",
    "parent": "단양군",
    "lat": 36.9845,
    "lon": 128.3656
  },
  {
    "name": "천안시",
    "aliases": [
      "천안"
    ],
    "region": "충청남도",
    "parent": "천안시",
    "lat": 36.8151,
    "lon": 127.1139
  },
  {
    "name": "서북구",
    "aliases": [
      "서북",
      "불당",
      "불당동",
      "두정동"
    ],
    "region": "충청남도",
    "parent": "천안시",
    "district": "서북구",
    "lat": 36.8378,
    "lon": 127.1107
  },
  {
    "name": "동남구",
    "aliases": [
      "동남",
      "신부동"
    ],
    "region": "충청남도",
    "parent": "천안시",
    "district": "동남구",
    "lat": 36.8005,
    "lon": 127.1477
  },
  {
    "name": "아산시",
    "aliases": [
      "아산",
      "온양",
      "배방",
      "탕정"
    ],
    "region": "충청남도",
    "parent": "아산시",
    "lat": 36.7898,
    "lon": 127.0019
  },
  {
    "name": "서산시",
    "aliases": [
      "서산"
    ],
    "region": "충청남도",
    "parent": "서산시",
    "lat": 36.7845,
    "lon": 126.4503
  },
  {
    "name": "당진시",
    "aliases": [
      "당진"
    ],
    "region": "충청남도",
    "parent": "당진시",
    "lat": 36.8898,
    "lon": 126.6459
  },
  {
    "name": "공주시",
    "aliases": [
      "공주"
    ],
    "region": "충청남도",
    "parent": "공주시",
    "lat": 36.4465,
    "lon": 127.119
  },
  {
    "name": "논산시",
    "aliases": [
      "논산"
    ],
    "region": "충청남도",
    "parent": "논산시",
    "lat": 36.1872,
    "lon": 127.0987
  },
  {
    "name": "보령시",
    "aliases": [
      "보령",
      "대천"
    ],
    "region": "충청남도",
    "parent": "보령시",
    "lat": 36.3333,
    "lon": 126.6129
  },
  {
    "name": "홍성군",
    "aliases": [
      "홍성",
      "내포",
      "내포신도시"
    ],
    "region": "충청남도",
    "parent": "홍성군",
    "lat": 36.6014,
    "lon": 126.6608
  },
  {
    "name": "예산군",
    "aliases": [
      "예산"
    ],
    "region": "충청남도",
    "parent": "예산군",
    "lat": 36.68,
    "lon": 126.8455
  },
  {
    "name": "부여군",
    "aliases": [
      "부여"
    ],
    "region": "충청남도",
    "parent": "부여군",
    "lat": 36.2756,
    "lon": 126.9098
  },
  {
    "name": "서천군",
    "aliases": [
      "서천"
    ],
    "region": "충청남도",
    "parent": "서천군",
    "lat": 36.0803,
    "lon": 126.6914
  },
  {
    "name": "태안군",
    "aliases": [
      "태안",
      "안면도"
    ],
    "region": "충청남도",
    "parent": "태안군",
    "lat": 36.7455,
    "lon": 126.2974
  },
  {
    "name": "금산군",
    "aliases": [
      "금산"
    ],
    "region": "충청남도",
    "parent": "금산군",
    "lat": 36.1087,
    "lon": 127.4881
  },
  {
    "name": "계룡시",
    "aliases": [
      "계룡"
    ],
    "region": "충청남도",
    "parent": "계룡시",
    "lat": 36.2745,
    "lon": 127.2486
  },
  {
    "name": "청양군",
    "aliases": [
      "청양"
    ],
    "region": "충청남도",
    "parent": "청양군",
    "lat": 36.4589,
    "lon": 126.8014
  },
  {
    "name": "전주시",
    "aliases": [
      "전주",
      "한옥마을"
    ],
    "region": "전북특별자치도",
    "parent": "전주시",
    "lat": 35.8242,
    "lon": 127.148
  },
  {
    "name": "완산구",
    "aliases": [
      "완산",
      "효자동",
      "효자"
    ],
    "region": "전북특별자치도",
    "parent": "전주시",
    "district": "완산구",
    "lat": 35.8118,
    "lon": 127.1325
  },
  {
    "name": "덕진구",
    "aliases": [
      "덕진",
      "에코시티",
      "혁신도시"
    ],
    "region": "전북특별자치도",
    "parent": "전주시",
    "district": "덕진구",
    "lat": 35.8532,
    "lon": 127.1218
  },
  {
    "name": "익산시",
    "aliases": [
      "익산"
    ],
    "region": "전북특별자치도",
    "parent": "익산시",
    "lat": 35.9483,
    "lon": 126.9576
  },
  {
    "name": "군산시",
    "aliases": [
      "군산"
    ],
    "region": "전북특별자치도",
    "parent": "군산시",
    "lat": 35.9676,
    "lon": 126.7366
  },
  {
    "name": "정읍시",
    "aliases": [
      "정읍",
      "내장산"
    ],
    "region": "전북특별자치도",
    "parent": "정읍시",
    "lat": 35.5699,
    "lon": 126.8577
  },
  {
    "name": "남원시",
    "aliases": [
      "남원",
      "지리산"
    ],
    "region": "전북특별자치도",
    "parent": "남원시",
    "lat": 35.4164,
    "lon": 127.3905
  },
  {
    "name": "김제시",
    "aliases": [
      "김제"
    ],
    "region": "전북특별자치도",
    "parent": "김제시",
    "lat": 35.8036,
    "lon": 126.8809
  },
  {
    "name": "완주군",
    "aliases": [
      "완주",
      "삼례",
      "봉동"
    ],
    "region": "전북특별자치도",
    "parent": "완주군",
    "lat": 35.9048,
    "lon": 127.1625
  },
  {
    "name": "고창군",
    "aliases": [
      "고창"
    ],
    "region": "전북특별자치도",
    "parent": "고창군",
    "lat": 35.4358,
    "lon": 126.7021
  },
  {
    "name": "부안군",
    "aliases": [
      "부안",
      "변산반도"
    ],
    "region": "전북특별자치도",
    "parent": "부안군",
    "lat": 35.7317,
    "lon": 126.7334
  },
  {
    "name": "임실군",
    "aliases": [
      "임실"
    ],
    "region": "전북특별자치도",
    "parent": "임실군",
    "lat": 35.6178,
    "lon": 127.2889
  },
  {
    "name": "순창군",
    "aliases": [
      "순창"
    ],
    "region": "전북특별자치도",
    "parent": "순창군",
    "lat": 35.3744,
    "lon": 127.1378
  },
  {
    "name": "진안군",
    "aliases": [
      "진안",
      "마이산"
    ],
    "region": "전북특별자치도",
    "parent": "진안군",
    "lat": 35.7915,
    "lon": 127.4248
  },
  {
    "name": "무주군",
    "aliases": [
      "무주",
      "덕유산"
    ],
    "region": "전북특별자치도",
    "parent": "무주군",
    "lat": 36.0068,
    "lon": 127.6608
  },
  {
    "name": "장수군",
    "aliases": [
      "장수"
    ],
    "region": "전북특별자치도",
    "parent": "장수군",
    "lat": 35.6474,
    "lon": 127.5215
  },
  {
    "name": "여수시",
    "aliases": [
      "여수",
      "여수밤바다",
      "돌산"
    ],
    "region": "전라남도",
    "parent": "여수시",
    "lat": 34.7604,
    "lon": 127.6622
  },
  {
    "name": "순천시",
    "aliases": [
      "순천",
      "순천만"
    ],
    "region": "전라남도",
    "parent": "순천시",
    "lat": 34.9506,
    "lon": 127.4872
  },
  {
    "name": "목포시",
    "aliases": [
      "목포",
      "유달산",
      "평화광장"
    ],
    "region": "전라남도",
    "parent": "목포시",
    "lat": 34.8118,
    "lon": 126.3922
  },
  {
    "name": "광양시",
    "aliases": [
      "광양",
      "중마동"
    ],
    "region": "전라남도",
    "parent": "광양시",
    "lat": 34.9407,
    "lon": 127.6959
  },
  {
    "name": "나주시",
    "aliases": [
      "나주",
      "빛가람",
      "나주혁신도시"
    ],
    "region": "전라남도",
    "parent": "나주시",
    "lat": 35.0161,
    "lon": 126.7108
  },
  {
    "name": "무안군",
    "aliases": [
      "무안",
      "남악"
    ],
    "region": "전라남도",
    "parent": "무안군",
    "lat": 34.9904,
    "lon": 126.4817
  },
  {
    "name": "해남군",
    "aliases": [
      "해남",
      "땅끝마을"
    ],
    "region": "전라남도",
    "parent": "해남군",
    "lat": 34.5735,
    "lon": 126.599
  },
  {
    "name": "고흥군",
    "aliases": [
      "고흥",
      "나로우주센터"
    ],
    "region": "전라남도",
    "parent": "고흥군",
    "lat": 34.6111,
    "lon": 127.2847
  },
  {
    "name": "화순군",
    "aliases": [
      "화순"
    ],
    "region": "전라남도",
    "parent": "화순군",
    "lat": 35.0645,
    "lon": 126.9866
  },
  {
    "name": "영암군",
    "aliases": [
      "영암",
      "삼호"
    ],
    "region": "전라남도",
    "parent": "영암군",
    "lat": 34.7997,
    "lon": 126.6967
  },
  {
    "name": "영광군",
    "aliases": [
      "영광",
      "백수해안도로"
    ],
    "region": "전라남도",
    "parent": "영광군",
    "lat": 35.2774,
    "lon": 126.512
  },
  {
    "name": "완도군",
    "aliases": [
      "완도",
      "청산도"
    ],
    "region": "전라남도",
    "parent": "완도군",
    "lat": 34.311,
    "lon": 126.755
  },
  {
    "name": "담양군",
    "aliases": [
      "담양",
      "죽녹원"
    ],
    "region": "전라남도",
    "parent": "담양군",
    "lat": 35.3212,
    "lon": 126.9882
  },
  {
    "name": "보성군",
    "aliases": [
      "보성",
      "녹차밭"
    ],
    "region": "전라남도",
    "parent": "보성군",
    "lat": 34.7714,
    "lon": 127.0799
  },
  {
    "name": "장성군",
    "aliases": [
      "장성"
    ],
    "region": "전라남도",
    "parent": "장성군",
    "lat": 35.3015,
    "lon": 126.7848
  },
  {
    "name": "진도군",
    "aliases": [
      "진도"
    ],
    "region": "전라남도",
    "parent": "진도군",
    "lat": 34.4868,
    "lon": 126.2634
  },
  {
    "name": "곡성군",
    "aliases": [
      "곡성"
    ],
    "region": "전라남도",
    "parent": "곡성군",
    "lat": 35.282,
    "lon": 127.292
  },
  {
    "name": "함평군",
    "aliases": [
      "함평"
    ],
    "region": "전라남도",
    "parent": "함평군",
    "lat": 35.0659,
    "lon": 126.5165
  },
  {
    "name": "신안군",
    "aliases": [
      "신안",
      "홍도",
      "흑산도"
    ],
    "region": "전라남도",
    "parent": "신안군",
    "lat": 34.8336,
    "lon": 126.3514
  },
  {
    "name": "구례군",
    "aliases": [
      "구례",
      "화엄사"
    ],
    "region": "전라남도",
    "parent": "구례군",
    "lat": 35.2025,
    "lon": 127.4628
  },
  {
    "name": "장흥군",
    "aliases": [
      "장흥"
    ],
    "region": "전라남도",
    "parent": "장흥군",
    "lat": 34.6817,
    "lon": 126.907
  },
  {
    "name": "강진군",
    "aliases": [
      "강진"
    ],
    "region": "전라남도",
    "parent": "강진군",
    "lat": 34.6421,
    "lon": 126.7672
  },
  {
    "name": "포항시",
    "aliases": [
      "포항",
      "영일대",
      "호미곶"
    ],
    "region": "경상북도",
    "parent": "포항시",
    "lat": 36.019,
    "lon": 129.3435
  },
  {
    "name": "남구",
    "aliases": [
      "포항 남구",
      "지곡동",
      "효자동"
    ],
    "region": "경상북도",
    "parent": "포항시",
    "district": "남구",
    "lat": 35.9868,
    "lon": 129.4002
  },
  {
    "name": "북구",
    "aliases": [
      "포항 북구",
      "장성동",
      "두호동"
    ],
    "region": "경상북도",
    "parent": "포항시",
    "district": "북구",
    "lat": 36.0594,
    "lon": 129.3797
  },
  {
    "name": "구미시",
    "aliases": [
      "구미",
      "인동",
      "옥계"
    ],
    "region": "경상북도",
    "parent": "구미시",
    "lat": 36.1195,
    "lon": 128.3446
  },
  {
    "name": "경주시",
    "aliases": [
      "경주",
      "보문단지",
      "황리단길"
    ],
    "region": "경상북도",
    "parent": "경주시",
    "lat": 35.8562,
    "lon": 129.2247
  },
  {
    "name": "경산시",
    "aliases": [
      "경산",
      "하양"
    ],
    "region": "경상북도",
    "parent": "경산시",
    "lat": 35.8251,
    "lon": 128.7414
  },
  {
    "name": "안동시",
    "aliases": [
      "안동",
      "하회마을"
    ],
    "region": "경상북도",
    "parent": "안동시",
    "lat": 36.5684,
    "lon": 128.7294
  },
  {
    "name": "김천시",
    "aliases": [
      "김천",
      "율곡동",
      "김천혁신도시"
    ],
    "region": "경상북도",
    "parent": "김천시",
    "lat": 36.1399,
    "lon": 128.1136
  },
  {
    "name": "칠곡군",
    "aliases": [
      "칠곡",
      "왜관",
      "석적"
    ],
    "region": "경상북도",
    "parent": "칠곡군",
    "lat": 35.9956,
    "lon": 128.4017
  },
  {
    "name": "영주시",
    "aliases": [
      "영주"
    ],
    "region": "경상북도",
    "parent": "영주시",
    "lat": 36.8057,
    "lon": 128.6241
  },
  {
    "name": "상주시",
    "aliases": [
      "상주"
    ],
    "region": "경상북도",
    "parent": "상주시",
    "lat": 36.4109,
    "lon": 128.1591
  },
  {
    "name": "영천시",
    "aliases": [
      "영천"
    ],
    "region": "경상북도",
    "parent": "영천시",
    "lat": 35.9733,
    "lon": 128.9385
  },
  {
    "name": "문경시",
    "aliases": [
      "문경",
      "문경새재",
      "점촌"
    ],
    "region": "경상북도",
    "parent": "문경시",
    "lat": 36.5973,
    "lon": 128.1866
  },
  {
    "name": "의성군",
    "aliases": [
      "의성"
    ],
    "region": "경상북도",
    "parent": "의성군",
    "lat": 36.3527,
    "lon": 128.697
  },
  {
    "name": "울진군",
    "aliases": [
      "울진"
    ],
    "region": "경상북도",
    "parent": "울진군",
    "lat": 36.9931,
    "lon": 129.4009
  },
  {
    "name": "예천군",
    "aliases": [
      "예천",
      "경북도청신도시"
    ],
    "region": "경상북도",
    "parent": "예천군",
    "lat": 36.6573,
    "lon": 128.4528
  },
  {
    "name": "청도군",
    "aliases": [
      "청도"
    ],
    "region": "경상북도",
    "parent": "청도군",
    "lat": 35.6474,
    "lon": 128.734
  },
  {
    "name": "성주군",
    "aliases": [
      "성주"
    ],
    "region": "경상북도",
    "parent": "성주군",
    "lat": 35.919,
    "lon": 128.2831
  },
  {
    "name": "영덕군",
    "aliases": [
      "영덕",
      "강구항"
    ],
    "region": "경상북도",
    "parent": "영덕군",
    "lat": 36.415,
    "lon": 129.3656
  },
  {
    "name": "고령군",
    "aliases": [
      "고령"
    ],
    "region": "경상북도",
    "parent": "고령군",
    "lat": 35.7262,
    "lon": 128.263
  },
  {
    "name": "봉화군",
    "aliases": [
      "봉화"
    ],
    "region": "경상북도",
    "parent": "봉화군",
    "lat": 36.8931,
    "lon": 128.7325
  },
  {
    "name": "청송군",
    "aliases": [
      "청송",
      "주왕산"
    ],
    "region": "경상북도",
    "parent": "청송군",
    "lat": 36.4363,
    "lon": 129.0573
  },
  {
    "name": "영양군",
    "aliases": [
      "영양"
    ],
    "region": "경상북도",
    "parent": "영양군",
    "lat": 36.6669,
    "lon": 129.1125
  },
  {
    "name": "울릉군",
    "aliases": [
      "울릉",
      "울릉도",
      "독도"
    ],
    "region": "경상북도",
    "parent": "울릉군",
    "lat": 37.4844,
    "lon": 130.9057
  },
  {
    "name": "창원시",
    "aliases": [
      "창원"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "lat": 35.228,
    "lon": 128.6811
  },
  {
    "name": "성산구",
    "aliases": [
      "성산",
      "상남동",
      "중앙동"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "district": "성산구",
    "lat": 35.2223,
    "lon": 128.6923
  },
  {
    "name": "의창구",
    "aliases": [
      "의창",
      "팔용동",
      "북면"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "district": "의창구",
    "lat": 35.2427,
    "lon": 128.6465
  },
  {
    "name": "마산회원구",
    "aliases": [
      "마산회원",
      "합성동",
      "양덕동"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "district": "마산회원구",
    "lat": 35.2274,
    "lon": 128.5835
  },
  {
    "name": "마산합포구",
    "aliases": [
      "마산합포",
      "월영동",
      "창동"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "district": "마산합포구",
    "lat": 35.1852,
    "lon": 128.567
  },
  {
    "name": "진해구",
    "aliases": [
      "진해",
      "군항제",
      "석동"
    ],
    "region": "경상남도",
    "parent": "창원시",
    "district": "진해구",
    "lat": 35.1494,
    "lon": 128.6675
  },
  {
    "name": "김해시",
    "aliases": [
      "김해",
      "장유",
      "율하",
      "진영"
    ],
    "region": "경상남도",
    "parent": "김해시",
    "lat": 35.2285,
    "lon": 128.8894
  },
  {
    "name": "양산시",
    "aliases": [
      "양산",
      "물금",
      "증산"
    ],
    "region": "경상남도",
    "parent": "양산시",
    "lat": 35.335,
    "lon": 129.0373
  },
  {
    "name": "진주시",
    "aliases": [
      "진주",
      "평거동",
      "충무공동",
      "혁신도시"
    ],
    "region": "경상남도",
    "parent": "진주시",
    "lat": 35.1802,
    "lon": 128.1076
  },
  {
    "name": "거제시",
    "aliases": [
      "거제",
      "거제도",
      "고현",
      "옥포"
    ],
    "region": "경상남도",
    "parent": "거제시",
    "lat": 34.8806,
    "lon": 128.6211
  },
  {
    "name": "통영시",
    "aliases": [
      "통영",
      "동피랑",
      "미륵도"
    ],
    "region": "경상남도",
    "parent": "통영시",
    "lat": 34.8544,
    "lon": 128.4332
  },
  {
    "name": "사천시",
    "aliases": [
      "사천",
      "삼천포"
    ],
    "region": "경상남도",
    "parent": "사천시",
    "lat": 35.0037,
    "lon": 128.0642
  },
  {
    "name": "밀양시",
    "aliases": [
      "밀양"
    ],
    "region": "경상남도",
    "parent": "밀양시",
    "lat": 35.5038,
    "lon": 128.7466
  },
  {
    "name": "함안군",
    "aliases": [
      "함안"
    ],
    "region": "경상남도",
    "parent": "함안군",
    "lat": 35.2724,
    "lon": 128.4065
  },
  {
    "name": "거창군",
    "aliases": [
      "거창"
    ],
    "region": "경상남도",
    "parent": "거창군",
    "lat": 35.6867,
    "lon": 127.9095
  },
  {
    "name": "창녕군",
    "aliases": [
      "창녕",
      "우포늪"
    ],
    "region": "경상남도",
    "parent": "창녕군",
    "lat": 35.5446,
    "lon": 128.4922
  },
  {
    "name": "고성군",
    "aliases": [
      "경남 고성"
    ],
    "region": "경상남도",
    "parent": "고성군",
    "lat": 34.9754,
    "lon": 128.3234
  },
  {
    "name": "하동군",
    "aliases": [
      "하동",
      "화개장터"
    ],
    "region": "경상남도",
    "parent": "하동군",
    "lat": 35.0673,
    "lon": 127.7513
  },
  {
    "name": "합천군",
    "aliases": [
      "합천",
      "해인사"
    ],
    "region": "경상남도",
    "parent": "합천군",
    "lat": 35.5667,
    "lon": 128.1658
  },
  {
    "name": "남해군",
    "aliases": [
      "남해",
      "남해도",
      "독일마을"
    ],
    "region": "경상남도",
    "parent": "남해군",
    "lat": 34.8378,
    "lon": 127.8924
  },
  {
    "name": "함양군",
    "aliases": [
      "함양"
    ],
    "region": "경상남도",
    "parent": "함양군",
    "lat": 35.5205,
    "lon": 127.7252
  },
  {
    "name": "산청군",
    "aliases": [
      "산청"
    ],
    "region": "경상남도",
    "parent": "산청군",
    "lat": 35.4154,
    "lon": 127.8735
  },
  {
    "name": "의령군",
    "aliases": [
      "의령"
    ],
    "region": "경상남도",
    "parent": "의령군",
    "lat": 35.3222,
    "lon": 128.2618
  },
  {
    "name": "제주시",
    "aliases": [
      "제주",
      "제주시",
      "탑동",
      "노형",
      "연동"
    ],
    "region": "제주특별자치도",
    "parent": "제주시",
    "lat": 33.4996,
    "lon": 126.5312
  },
  {
    "name": "서귀포시",
    "aliases": [
      "서귀포",
      "중문",
      "성산",
      "표선"
    ],
    "region": "제주특별자치도",
    "parent": "서귀포시",
    "lat": 33.2541,
    "lon": 126.5601
  }
];

  function normalizeText(text) {
    return String(text || "")
      .toLocaleLowerCase("ko-KR")
      .trim()
      .replace(/\s+/g, " ");
  }

  function findKoreanDistricts(query) {
    const q = normalizeText(query);
    if (!q) return [];

    const exactMatches = [];
    const aliasMatches = [];
    const partialMatches = [];

    for (const item of DISTRICTS) {
      const name = normalizeText(item.name);
      const aliases = (item.aliases || []).map(normalizeText);

      // Exact name match
      if (name === q) {
        exactMatches.push(toCity(item));
        continue;
      }

      // Exact alias match
      if (aliases.includes(q)) {
        aliasMatches.push(toCity(item));
        continue;
      }

      // Prefix or suffix matching (e.g. '강남' matches '강남구', '해운대' matches '해운대구')
      const strippedQ = q.replace(/[시도구군]$/, "");
      const strippedName = name.replace(/[시도구군]$/, "");
      if (strippedQ && strippedName === strippedQ) {
        aliasMatches.push(toCity(item));
        continue;
      }

      // Multi-word exact match (e.g. '서울 강남', '성남 분당', '부산 해운대')
      const fullLabel = [item.region, item.parent, item.district, item.name].filter(Boolean).join(" ");
      if (q.split(" ").every(word => fullLabel.includes(word))) {
        partialMatches.push(toCity(item));
      }
    }

    if (exactMatches.length) return exactMatches;
    if (aliasMatches.length) return aliasMatches;
    return partialMatches;
  }

  function toCity(item) {
    return {
      name: item.name,
      country: "KR",
      state: "",
      lat: item.lat,
      lon: item.lon,
      region: item.region || "",
      parent: item.parent || "",
      district: item.district || ""
    };
  }

  const root = typeof window !== "undefined" ? window : globalThis;
  root.KOREAN_DISTRICTS = DISTRICTS;
  root.findKoreanDistricts = findKoreanDistricts;
})();
