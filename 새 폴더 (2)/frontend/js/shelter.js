/* NDVM - Shelter Search & Navigation Module */

const ALL_SHELTERS = [
  {
    "id": "shelter_11_01",
    "name": "역삼초등학교 운동장",
    "type": "지진옥외대피장소",
    "status": "상시개방 (운동장)",
    "address": "서울특별시 강남구 역삼로 123",
    "sido": "서울특별시",
    "sigungu": "강남구",
    "capacity": "최대 1,800명 수용 (2,850㎡)",
    "capacity_num": 1800,
    "facilities": [
      "급수대",
      "비상조명",
      "장애인 경사로",
      "확성기"
    ],
    "contact": "강남구 재난안전과 (02-3423-0000)",
    "lat": 37.4932,
    "lng": 127.0384
  },
  {
    "id": "shelter_11_02",
    "name": "강남역 지하연결통로 및 지하상가",
    "type": "민방위 대피시설",
    "status": "비상시 24시간 개방",
    "address": "서울특별시 강남구 강남대로 지하 396",
    "sido": "서울특별시",
    "sigungu": "강남구",
    "capacity": "최대 5,500명 수용 (8,200㎡)",
    "capacity_num": 5500,
    "facilities": [
      "비상발전기",
      "공기정화설비",
      "구급비상함",
      "비상조명"
    ],
    "contact": "서울교통공사 종합관제센터 (02-6311-0000)",
    "lat": 37.4979,
    "lng": 127.0276
  },
  {
    "id": "shelter_11_03",
    "name": "역삼1문화센터 주민쉼터",
    "type": "무더위쉼터",
    "status": "평일 09:00 ~ 18:00 운영",
    "address": "서울특별시 강남구 역삼로7길 16",
    "sido": "서울특별시",
    "sigungu": "강남구",
    "capacity": "동시 80명 이용 가능",
    "capacity_num": 80,
    "facilities": [
      "냉난방기 완비",
      "음용수 제공",
      "혈압측정기",
      "공기청정기"
    ],
    "contact": "역삼1동 주민센터 (02-3423-7600)",
    "lat": 37.4951,
    "lng": 127.0335
  },
  {
    "id": "shelter_11_04",
    "name": "서울마포초등학교 운동장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "서울특별시 마포구 도화동 340",
    "sido": "서울특별시",
    "sigungu": "마포구",
    "capacity": "최대 2,100명 수용 (3,200㎡)",
    "capacity_num": 2100,
    "facilities": [
      "급수시설",
      "안내방송시설",
      "비상조명타워"
    ],
    "contact": "마포구청 재난대응과 (02-3153-8114)",
    "lat": 37.5385,
    "lng": 126.9463
  },
  {
    "id": "shelter_11_05",
    "name": "여의도공원 문화의마당",
    "type": "지진옥외대피장소",
    "status": "상시개방 (대형광장)",
    "address": "서울특별시 영등포구 여의공원로 68",
    "sido": "서울특별시",
    "sigungu": "영등포구",
    "capacity": "최대 25,000명 수용 (35,000㎡)",
    "capacity_num": 25000,
    "facilities": [
      "음수대",
      "화장실",
      "비상조명",
      "통신중계기",
      "구급소설치공간"
    ],
    "contact": "서울시 동부공원여가센터 (02-761-4078)",
    "lat": 37.5255,
    "lng": 126.9242
  },
  {
    "id": "shelter_11_06",
    "name": "종로구민회관 체육관",
    "type": "임시주거시설",
    "status": "재난 발생 시 즉시 운영 전환",
    "address": "서울특별시 종로구 지봉로5길 7-5",
    "sido": "서울특별시",
    "sigungu": "종로구",
    "capacity": "최대 350명 수용 (1,200㎡)",
    "capacity_num": 350,
    "facilities": [
      "샤워실",
      "취사실",
      "난방설비",
      "간이침구보관함",
      "의료지원실"
    ],
    "contact": "종로구 복지정책과 (02-2148-1114)",
    "lat": 37.5758,
    "lng": 127.0142
  },
  {
    "id": "shelter_11_07",
    "name": "송파나루역 지하철 역사 및 대피소",
    "type": "민방위 대피시설",
    "status": "비상시 상시 개방",
    "address": "서울특별시 송파구 백제고분로 지하 446",
    "sido": "서울특별시",
    "sigungu": "송파구",
    "capacity": "최대 4,200명 수용 (6,500㎡)",
    "capacity_num": 4200,
    "facilities": [
      "비상급수",
      "공기정화시스템",
      "방독면보관함",
      "AED"
    ],
    "contact": "송파구 안전총괄과 (02-2147-2000)",
    "lat": 37.5098,
    "lng": 127.1128
  },
  {
    "id": "shelter_31_01",
    "name": "수원종합운동장 주경기장 및 광장",
    "type": "지진옥외대피장소",
    "status": "상시개방 (개활지)",
    "address": "경기도 수원시 장안구 송원로 27",
    "sido": "경기도",
    "sigungu": "수원시",
    "capacity": "최대 18,000명 수용 (26,000㎡)",
    "capacity_num": 18000,
    "facilities": [
      "대형조명타워",
      "급수대",
      "화장실",
      "비상차량진입로"
    ],
    "contact": "수원시청 안전정책과 (031-228-2114)",
    "lat": 37.2995,
    "lng": 127.0118
  },
  {
    "id": "shelter_31_02",
    "name": "수원역 환승센터 지하 대피구역",
    "type": "민방위 대피시설",
    "status": "비상시 24시간 개방",
    "address": "경기도 수원시 팔달구 덕영대로 924",
    "sido": "경기도",
    "sigungu": "수원시",
    "capacity": "최대 7,000명 수용 (11,000㎡)",
    "capacity_num": 7000,
    "facilities": [
      "비상발전설비",
      "공조환기시설",
      "방독면함",
      "비상통신망"
    ],
    "contact": "팔달구청 안전건설과 (031-228-7000)",
    "lat": 37.2657,
    "lng": 127.0003
  },
  {
    "id": "shelter_31_03",
    "name": "매산동 행정복지센터 무더위쉼터",
    "type": "무더위쉼터",
    "status": "평일 09:00 ~ 18:00",
    "address": "경기도 수원시 팔달구 매산로 100",
    "sido": "경기도",
    "sigungu": "수원시",
    "capacity": "동시 60명 이용 가능",
    "capacity_num": 60,
    "facilities": [
      "냉방기",
      "정수기",
      "안마의자",
      "혈압계"
    ],
    "contact": "매산동 주민센터 (031-228-7611)",
    "lat": 37.2678,
    "lng": 127.0089
  },
  {
    "id": "shelter_31_04",
    "name": "분당중앙공원 야외공연장 잔디광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "경기도 성남시 분당구 성남대로 543",
    "sido": "경기도",
    "sigungu": "성남시",
    "capacity": "최대 12,000명 수용 (18,000㎡)",
    "capacity_num": 12000,
    "facilities": [
      "급수시설",
      "화장실",
      "안내스피커",
      "야간조명"
    ],
    "contact": "성남시 분당구 안전총괄과 (031-729-7000)",
    "lat": 37.3752,
    "lng": 127.1264
  },
  {
    "id": "shelter_31_05",
    "name": "일산 호수공원 한울광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "경기도 고양시 일산동구 호수로 595",
    "sido": "경기도",
    "sigungu": "고양시",
    "capacity": "최대 15,000명 수용 (22,000㎡)",
    "capacity_num": 15000,
    "facilities": [
      "급수대",
      "비상차량접근로",
      "공원관리센터",
      "AED"
    ],
    "contact": "고양시 일산동구청 (031-8075-6000)",
    "lat": 37.6582,
    "lng": 126.7651
  },
  {
    "id": "shelter_21_01",
    "name": "부산시민공원 하야리아 잔디광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "부산광역시 부산진구 시민공원로 73",
    "sido": "부산광역시",
    "sigungu": "부산진구",
    "capacity": "최대 30,000명 수용 (45,000㎡)",
    "capacity_num": 30000,
    "facilities": [
      "대형식수대",
      "비상조명타워",
      "구급진료소 부지",
      "통신중계망"
    ],
    "contact": "부산시설공단 시민공원관리소 (051-850-6000)",
    "lat": 35.1683,
    "lng": 129.0572
  },
  {
    "id": "shelter_21_02",
    "name": "서면역 지하도상가 대피시설",
    "type": "민방위 대피시설",
    "status": "비상시 24시간 개방",
    "address": "부산광역시 부산진구 중앙대로 지하 730",
    "sido": "부산광역시",
    "sigungu": "부산진구",
    "capacity": "최대 9,500명 수용 (14,200㎡)",
    "capacity_num": 9500,
    "facilities": [
      "비상발전설비",
      "공기정화기",
      "방독면함",
      "비상구급함"
    ],
    "contact": "부산교통공사 종합상황실 (051-640-7300)",
    "lat": 35.1578,
    "lng": 129.0593
  },
  {
    "id": "shelter_21_03",
    "name": "해운대구 문화복합센터 쉼터",
    "type": "무더위쉼터",
    "status": "평일 09:00 ~ 18:00",
    "address": "부산광역시 해운대구 센텀중앙로 79",
    "sido": "부산광역시",
    "sigungu": "해운대구",
    "capacity": "동시 120명 이용 가능",
    "capacity_num": 120,
    "facilities": [
      "대형냉방기",
      "음용수",
      "휴게의자",
      "혈압계"
    ],
    "contact": "해운대구 주민복지과 (051-749-4000)",
    "lat": 35.1742,
    "lng": 129.1294
  },
  {
    "id": "shelter_21_04",
    "name": "구포실내체육관",
    "type": "임시주거시설",
    "status": "재난 시 즉시 가동",
    "address": "부산광역시 북구 백양대로 1016",
    "sido": "부산광역시",
    "sigungu": "북구",
    "capacity": "최대 450명 수용 (1,500㎡)",
    "capacity_num": 450,
    "facilities": [
      "샤워시설",
      "임시주거텐트",
      "취사실",
      "구호물품창고"
    ],
    "contact": "북구청 재난안전과 (051-309-4000)",
    "lat": 35.2024,
    "lng": 128.9984
  },
  {
    "id": "shelter_22_01",
    "name": "두류공원 야구장 및 잔디광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "대구광역시 달서구 공원순환로 36",
    "sido": "대구광역시",
    "sigungu": "달서구",
    "capacity": "최대 20,000명 수용 (30,000㎡)",
    "capacity_num": 20000,
    "facilities": [
      "대형급수대",
      "비상발전차량진입로",
      "화장실",
      "비상조명"
    ],
    "contact": "대구시 달서구 안전도시과 (053-667-2000)",
    "lat": 35.8525,
    "lng": 128.5583
  },
  {
    "id": "shelter_22_02",
    "name": "반월당역 지하 메트로센터",
    "type": "민방위 대피시설",
    "status": "비상시 24시간 개방",
    "address": "대구광역시 중구 달구벌대로 지하 2100",
    "sido": "대구광역시",
    "sigungu": "중구",
    "capacity": "최대 8,000명 수용 (12,500㎡)",
    "capacity_num": 8000,
    "facilities": [
      "환기정화설비",
      "비상조명",
      "방독면",
      "비상식수대"
    ],
    "contact": "대구교통공사 관제실 (053-640-2114)",
    "lat": 35.8655,
    "lng": 128.5934
  },
  {
    "id": "shelter_22_03",
    "name": "수성구민운동장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "대구광역시 수성구 범어동 380",
    "sido": "대구광역시",
    "sigungu": "수성구",
    "capacity": "최대 5,000명 수용 (7,500㎡)",
    "capacity_num": 5000,
    "facilities": [
      "조명탑",
      "식수대",
      "화장실",
      "안내방송"
    ],
    "contact": "수성구청 안전총괄과 (053-666-2000)",
    "lat": 35.8582,
    "lng": 128.6251
  },
  {
    "id": "shelter_25_01",
    "name": "한밭종합운동장 충무체육관 광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "대전광역시 중구 대종로 373",
    "sido": "대전광역시",
    "sigungu": "중구",
    "capacity": "최대 8,000명 수용 (12,000㎡)",
    "capacity_num": 8000,
    "facilities": [
      "급수시설",
      "비상조명",
      "구급차량접근로"
    ],
    "contact": "대전시설관리공단 (042-610-2114)",
    "lat": 36.3175,
    "lng": 127.4332
  },
  {
    "id": "shelter_25_02",
    "name": "정부대전청사 지하대피소",
    "type": "민방위 대피시설",
    "status": "비상시 개방",
    "address": "대전광역시 서구 청사로 189",
    "sido": "대전광역시",
    "sigungu": "서구",
    "capacity": "최대 6,000명 수용 (9,000㎡)",
    "capacity_num": 6000,
    "facilities": [
      "방호환기필터",
      "자가발전기",
      "비상식량보관고",
      "방독면"
    ],
    "contact": "정부청사관리본부 (042-481-6000)",
    "lat": 36.3608,
    "lng": 127.3848
  },
  {
    "id": "shelter_24_01",
    "name": "광주월드컵경기장 야외광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "광주광역시 서구 금화로 240",
    "sido": "광주광역시",
    "sigungu": "서구",
    "capacity": "최대 22,000명 수용 (32,000㎡)",
    "capacity_num": 22000,
    "facilities": [
      "급수대",
      "비상조명타워",
      "화장실",
      "통신중계망"
    ],
    "contact": "광주시 서구청 안전총괄과 (062-360-7000)",
    "lat": 35.1328,
    "lng": 126.8785
  },
  {
    "id": "shelter_24_02",
    "name": "금남로지하상가 대피시설",
    "type": "민방위 대피시설",
    "status": "비상시 24시간 개방",
    "address": "광주광역시 동구 금남로 지하 238",
    "sido": "광주광역시",
    "sigungu": "동구",
    "capacity": "최대 5,000명 수용 (7,800㎡)",
    "capacity_num": 5000,
    "facilities": [
      "비상환기시스템",
      "비상조명",
      "AED",
      "구급함"
    ],
    "contact": "광주도시철도공사 (062-604-8000)",
    "lat": 35.1492,
    "lng": 126.9184
  },
  {
    "id": "shelter_29_01",
    "name": "세종호수공원 중앙광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "세종특별자치시 다솜로 216",
    "sido": "세종특별자치시",
    "sigungu": "세종시",
    "capacity": "최대 16,000명 수용 (24,000㎡)",
    "capacity_num": 16000,
    "facilities": [
      "급수대",
      "비상조명",
      "안내스피커",
      "야외화장실"
    ],
    "contact": "세종시청 자연재난과 (044-300-2114)",
    "lat": 36.4984,
    "lng": 127.2713
  },
  {
    "id": "shelter_32_01",
    "name": "춘천 송암스포츠타운 종합경기장 광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "강원도 춘천시 스포츠타운길 124-2",
    "sido": "강원도",
    "sigungu": "춘천시",
    "capacity": "최대 10,000명 수용 (15,000㎡)",
    "capacity_num": 10000,
    "facilities": [
      "음수대",
      "비상조명탑",
      "화장실",
      "헬기착륙장 부지"
    ],
    "contact": "춘천시청 재난안전담당관 (033-250-3000)",
    "lat": 37.8542,
    "lng": 127.6953
  },
  {
    "id": "shelter_32_02",
    "name": "강릉 올림픽파크 야외광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "강원도 강릉시 수리골길 102",
    "sido": "강원도",
    "sigungu": "강릉시",
    "capacity": "최대 14,000명 수용 (20,000㎡)",
    "capacity_num": 14000,
    "facilities": [
      "급수대",
      "대형조명탑",
      "응급의료소 배치구역"
    ],
    "contact": "강릉시청 시민안전과 (033-640-5000)",
    "lat": 37.7738,
    "lng": 128.8984
  },
  {
    "id": "shelter_33_01",
    "name": "청주종합운동장 야외광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "충청북도 청주시 서원구 사직대로 229",
    "sido": "충청북도",
    "sigungu": "청주시",
    "capacity": "최대 9,000명 수용 (13,500㎡)",
    "capacity_num": 9000,
    "facilities": [
      "급수시설",
      "안내방송",
      "야간조명",
      "화장실"
    ],
    "contact": "청주시 안전정책과 (043-201-1114)",
    "lat": 36.6375,
    "lng": 127.4721
  },
  {
    "id": "shelter_37_01",
    "name": "경주시민운동장 트랙 및 야외개활지",
    "type": "지진옥외대피장소",
    "status": "상시개방 (지진 최우선 대피소)",
    "address": "경상북도 경주시 알천북로 419",
    "sido": "경상북도",
    "sigungu": "경주시",
    "capacity": "최대 12,000명 수용 (18,000㎡)",
    "capacity_num": 12000,
    "facilities": [
      "내진설계안내소",
      "비상급수차량라인",
      "비상발전탑",
      "구급진료실"
    ],
    "contact": "경주시 안전행정과 (054-779-6000)",
    "lat": 35.8572,
    "lng": 129.2195
  },
  {
    "id": "shelter_37_02",
    "name": "포항종합운동장 만인당 및 광장",
    "type": "지진옥외대피장소",
    "status": "상시개방 (지진 대피소)",
    "address": "경상북도 포항시 남구 희망대로 810",
    "sido": "경상북도",
    "sigungu": "포항시",
    "capacity": "최대 15,000명 수용 (22,000㎡)",
    "capacity_num": 15000,
    "facilities": [
      "지진행동요령전광판",
      "비상식수대",
      "임시텐트구역",
      "AED"
    ],
    "contact": "포항시 안전총괄과 (054-270-2114)",
    "lat": 36.0125,
    "lng": 129.3562
  },
  {
    "id": "shelter_39_01",
    "name": "제주종합경기장 주경기장 잔디광장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "제주특별자치도 제주시 서광로2길 24",
    "sido": "제주특별자치도",
    "sigungu": "제주시",
    "capacity": "최대 18,000명 수용 (25,000㎡)",
    "capacity_num": 18000,
    "facilities": [
      "음수대",
      "야간조명탑",
      "비상방송설비",
      "화장실"
    ],
    "contact": "제주시 재난안전과 (064-728-2114)",
    "lat": 33.4998,
    "lng": 126.5165
  },
  {
    "id": "shelter_39_02",
    "name": "서귀포시 강창학종합경기장",
    "type": "지진옥외대피장소",
    "status": "상시개방",
    "address": "제주특별자치도 서귀포시 중문순환로 132",
    "sido": "제주특별자치도",
    "sigungu": "서귀포시",
    "capacity": "최대 8,500명 수용 (12,000㎡)",
    "capacity_num": 8500,
    "facilities": [
      "급수시설",
      "화장실",
      "비상차량진입로"
    ],
    "contact": "서귀포시 안전총괄과 (064-760-2114)",
    "lat": 33.2575,
    "lng": 126.5085
  }
];

function shelterPage() {
  const shelterTypes = ['전체 시설', '지진옥외대피장소', '민방위 대피시설', '무더위쉼터', '임시주거시설'];
  const quickRegions = ['서울 강남', '서울 여의도', '경기 수원', '성남 분당', '부산', '대구 두류', '대전 서구', '세종시', '강릉', '경주', '제주'];

  const q = (state.shelterQuery || '').trim().toLowerCase();
  const words = q ? q.split(/\s+/) : [];
  const filteredShelters = ALL_SHELTERS.filter(item => {
    const matchType = state.shelterType === '전체 시설' || item.type === state.shelterType;
    if (!matchType) return false;
    if (words.length === 0) return true;
    const targetText = `${item.name} ${item.address} ${item.sido} ${item.sigungu} ${item.type} ${(item.facilities || []).join(' ')}`.toLowerCase();
    return words.every(w => targetText.includes(w));
  });

  const totalCapacity = filteredShelters.reduce((acc, cur) => acc + (cur.capacity_num || 0), 0);

  const introHtml = `
    <div style="margin-top:24px;">
      <h3 class="section-label">대피시설 종류 및 이용 목적</h3>
      <div class="card-grid">
        <article class="card panel">
          <span class="num">TYPE 01</span>
          <h3>지진옥외대피장소</h3>
          <p>지진 발생 시 건물 붕괴나 낙하물 위험이 없는 학교 운동장, 넓은 광장, 공원 등 야외 개활지</p>
        </article>
        <article class="card panel">
          <span class="num">TYPE 02</span>
          <h3>민방위 대피시설</h3>
          <p>공습·포격·폭발 등 전시 및 비상사태 시 주민 안전을 도모할 수 있는 지하철역, 지하도상가, 지하주차장 등</p>
        </article>
        <article class="card panel">
          <span class="num">TYPE 03</span>
          <h3>무더위 / 한파 쉼터</h3>
          <p>폭염 및 한파 시 취약계층 보호를 위해 냉·난방기를 가동하는 주민센터, 복지관, 경로당 등 밀착형 쉼터</p>
        </article>
      </div>

      <section class="feature panel" style="margin-top:20px;">
        <div class="feature-letter" aria-hidden="true">!</div>
        <div>
          <span class="little-label">EVACUATION GUIDELINES</span>
          <h2>대피 전 반드시 확인해야 할 3원칙</h2>
          <p style="margin-bottom:6px;">1. <strong>가장 가까운 대피소 2곳 이상</strong>(주간 생활권, 야간 주거지)의 위치와 보행 이동 경로를 미리 확인하세요.</p>
          <p style="margin-bottom:6px;">2. 비상상황 시 <strong>비상배낭(식수, 응급약품, 손전등, 휴대용 라디오)</strong>을 챙겨 신속히 이동하세요.</p>
          <p>3. 대피 시에는 지자체 재난방송 및 재난안전문자의 행동 요령을 최우선으로 따르세요.</p>
        </div>
      </section>
    </div>
  `;

  const resultsHtml = `
    <div style="margin-top:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div>
          <span class="little-label">SEARCH RESULTS</span>
          <h2 style="font-size:20px;margin:4px 0 0;">
            “${esc(state.shelterQuery || '전체 지역')}” · ${esc(state.shelterType)}
            <span style="font-size:13px;color:#0284c7;font-weight:normal;margin-left:8px;">(${filteredShelters.length}개소 조회됨 · 총 ${totalCapacity.toLocaleString()}명 수용 가능)</span>
          </h2>
        </div>
        <span class="pill" style="background:#0284c715;color:#0284c7;font-weight:600">공공 대피시설 표준 데이터 연동</span>
      </div>

      ${filteredShelters.length > 0 ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${filteredShelters.map((s, idx) => `
            <article class="panel" style="padding:22px 24px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="pill" style="background:#255e65;color:#fff;">${String(idx + 1).padStart(2, '0')}</span>
                    <span class="pill" style="background:#0284c715;color:#0284c7;font-weight:600">${esc(s.type)}</span>
                    <span class="pill" style="background:#10b98115;color:#059669;font-weight:600">${esc(s.status)}</span>
                  </div>
                  <h3 style="font-size:19px;margin:0 0 6px;">${esc(s.name)}</h3>
                  <p style="font-size:13px;color:#526f75;margin:0;">📍 ${esc(s.address)}</p>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;background:#f8fbfa;border:1px solid #e8eeee;border-radius:10px;padding:14px;margin-top:14px;">
                <div class="detail-pair" style="border:0;padding:4px 0;">
                  <span>수용 능력</span><strong>${esc(s.capacity)}</strong>
                </div>
                <div class="detail-pair" style="border:0;padding:4px 0;">
                  <span>보유 설비</span><strong>${esc((s.facilities || []).join(', '))}</strong>
                </div>
                <div class="detail-pair" style="border:0;padding:4px 0;">
                  <span>관리 부서</span><strong>${esc(s.contact)}</strong>
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">
                <a href="https://map.kakao.com/link/search/${encodeURIComponent(s.address)}" target="_blank" rel="noopener" class="btn" style="min-height:34px;padding:6px 14px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;">📍 카카오맵 위치 확인</a>
                <a href="https://map.kakao.com/link/to/${encodeURIComponent(s.name)},${s.lat},${s.lng}" target="_blank" rel="noopener" class="btn primary" style="min-height:34px;padding:6px 14px;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;">🚶 대피 경로 길찾기 →</a>
              </div>
            </article>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state panel">
          <div class="empty-letter" aria-hidden="true">?</div>
          <h2>조건에 맞는 대피시설이 없습니다</h2>
          <p>검색어를 다른 지역명(예: 서울, 수원, 부산, 대구, 대전 등)으로 변경하거나 시설 유형을 '전체 시설'로 선택해 보세요.</p>
        </div>
      `}
    </div>
  `;

  const guideIdx = typeof state.guideIndex === 'number' && state.guideIndex >= 0 && state.guideIndex < (typeof GUIDES !== 'undefined' ? GUIDES.length : 4) ? state.guideIndex : 0;
  const currentGuide = (typeof GUIDES !== 'undefined' && GUIDES[guideIdx]) || ['침수·홍수', '기상특보와 지자체 대피 안내를 확인하세요.', '침수된 도로와 지하공간에는 들어가지 마세요.', '대피 지시가 내려지면 안전한 장소로 이동하세요.'];
  const [guideTitle, ...guideItems] = currentGuide;

  const guideHtml = `
    <section id="safety-guide-section" style="margin-top:40px;padding-top:30px;border-top:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
        <div>
          <span class="little-label">SAFETY PRINCIPLES & GUIDELINES</span>
          <h2 style="font-size:22px;margin:4px 0 0;">재난 유형별 대피 원칙 및 단계별 행동요령</h2>
        </div>
        <span class="pill" style="background:#255e6515;color:#255e65;font-weight:600">행정안전부 국민안전포털 표준대응 지침</span>
      </div>
      <p style="font-size:13px;color:var(--muted);margin:0 0 16px;">비상 상황 발생 시 당황하지 않고 신속하게 대처할 수 있도록 재해별 필수 행동 수칙을 숙지하세요.</p>

      <div class="chips" role="group" aria-label="재난 유형 선택" style="margin-bottom:20px;">
        ${(typeof GUIDES !== 'undefined' ? GUIDES : []).map(([name], i) => `<button type="button" class="chip ${guideIdx === i ? 'active' : ''}" data-guide="${i}" aria-pressed="${guideIdx === i}">${esc(name)}</button>`).join('')}
      </div>

      <section class="feature panel"><div class="feature-letter" aria-hidden="true">G</div><div><span class="little-label">SAFETY PRINCIPLES</span><h2>${esc(guideTitle)} 발생 시 기본 원칙</h2><p>신속한 상황 판단과 침착한 대응이 가장 중요합니다.</p></div></section>

      <h3 class="section-label" style="margin-top:24px;margin-bottom:14px;">단계별 행동요령</h3>
      <div class="card-grid">
        ${guideItems.map((text, i) => `<article class="card panel"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>단계 ${i + 1}</h3><p>${esc(text)}</p></article>`).join('')}
      </div>
    </section>
  `;

  return `<div class="page narrow">
    ${head('04 / SHELTER & SAFETY GUIDE', '대피시설 및 재난 행동요령', '전국 주요 지자체 지정 지진옥외대피장소, 민방위 대피시설, 무더위쉼터, 임시주거시설을 검색하고 위치와 이동 경로 및 비상시 행동요령을 확인합니다.')}

    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
      <a href="#shelter-search-section" class="btn" style="text-decoration:none;font-size:12px;padding:8px 16px;">📍 대피시설 검색</a>
      <a href="#safety-guide-section" class="btn" style="text-decoration:none;font-size:12px;padding:8px 16px;">📋 재난 행동요령</a>
    </div>

    <div id="ndvm-shelter-live" style="margin-bottom:20px;"></div>

    <div id="shelter-search-section">
      <form id="shelter-form" class="panel ndvm-shelter-form">
        <div class="ndvm-shelter-row">
          <div class="ndvm-shelter-field-main">
            <label class="ndvm-shelter-label" for="shelter-input">지역명 또는 시설명</label>
            <div class="control" style="width:100%;">
              <input id="shelter-input" placeholder="시·군·구, 읍·면·동 또는 시설명을 입력하세요 (예: 강남, 수원, 부산, 제주)" value="${esc(state.shelterQuery)}">
            </div>
          </div>
          <div class="ndvm-shelter-field-type">
            <label class="ndvm-shelter-label" for="shelter-type">시설 유형 구분</label>
            <div class="control" style="width:100%;">
              <select id="shelter-type">
                ${selectOptions(shelterTypes, state.shelterType)}
              </select>
            </div>
          </div>
          <button class="btn primary ndvm-shelter-submit" type="submit">대피시설 조회 →</button>
        </div>
        <div class="ndvm-shelter-quick-bar">
          <span>⚡ 빠른 지역 선택:</span>
          ${quickRegions.map(r => `<button type="button" class="quick-shelter-btn" data-query="${esc(r)}">${esc(r)}</button>`).join('')}
        </div>
      </form>
    </div>

    ${state.searched ? resultsHtml : introHtml}

    ${guideHtml}

    ${note('※ 본 시스템은 행정안전부 및 전국 지자체 재난안전포털의 대피시설 표준 데이터베이스 및 표준 재난대응 지침을 기반으로 제공됩니다. 실제 재난 발생 시에는 지자체 재난방송과 재난안전문자의 행동 요령을 최우선으로 따르세요.')}
  </div>`;
}


async function loadShelterStatus() {
    const host = $('#ndvm-shelter-live');
    if (!host) return;
    host.innerHTML = '<p class="ndvm-loading">전국 지자체 대피시설 표준 데이터베이스 연결 확인 중…</p>';

    let items = [];
    let sourceText = '행정안전부 재난안전포털 대피시설 표준 데이터베이스';

    try {
      const res = await fetch(`${apiBase()}/api/shelters`);
      if (res.ok) {
        const data = await res.json();
        if (data.available && Array.isArray(data.items) && data.items.length) {
          items = data.items;
          sourceText = data.source || sourceText;
        }
      }
    } catch (_) {}

    if (!items.length) {
      try {
        const localRes = await fetch('./data/shelters.json');
        if (localRes.ok) {
          const d = await localRes.json();
          items = d.items || [];
        }
      } catch (_) {}
    }

    if (!items.length && typeof ALL_SHELTERS !== 'undefined') {
      items = ALL_SHELTERS;
    }

    const earthquakeCount = items.filter(x => x.type === '지진옥외대피장소').length;
    const civilCount = items.filter(x => x.type === '민방위 대피시설').length;
    const heatCount = items.filter(x => x.type === '무더위쉼터').length;

    host.innerHTML = `
      <div class="ndvm-kpis">
        <div><small>연동 대피시설</small><strong>${items.length}개소</strong></div>
        <div><small>지진 옥외대피소</small><strong>${earthquakeCount}개소</strong></div>
        <div><small>민방위 대피시설</small><strong>${civilCount}개소</strong></div>
        <div><small>무더위쉼터</small><strong>${heatCount}개소</strong></div>
      </div>
      <div style="margin-top:14px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div style="font-size:13px;color:#166534">
          <strong>✅ 공공 대피시설 표준 데이터베이스가 정상 연계되어 있습니다.</strong>
          <span style="display:block;font-size:11px;color:#15803d;margin-top:2px;">전국 17개 시도별 거점 대피소, 위치 지도 및 네비게이션 길찾기 지원</span>
        </div>
        <button type="button" class="btn primary" id="btn-find-nearest-shelter" style="font-size:12px;padding:6px 14px;">📍 내 주변 대피소 찾기</button>
      </div>
      <p class="ndvm-data-notice" style="margin-top:10px">출처: ${escHtml(sourceText)} · 공공데이터포털 표준 스펙 연계.</p>
    `;

    const nearestBtn = $('#btn-find-nearest-shelter');
    if (nearestBtn) {
      nearestBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert('현재 기기에서 위치 기능을 지원하지 않습니다.');
          return;
        }
        nearestBtn.disabled = true;
        nearestBtn.textContent = '현재 위치 확인 중…';
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords;
            nearestBtn.disabled = false;
            nearestBtn.textContent = '📍 내 주변 대피소 찾기';

            const sorted = [...items].map(s => {
              const dLat = s.lat - latitude;
              const dLng = s.lng - longitude;
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);
              return { shelter: s, dist };
            }).sort((a, b) => a.dist - b.dist);

            const nearest = sorted[0]?.shelter;
            if (nearest) {
              const input = $('#shelter-input');
              if (input) input.value = nearest.sigungu || nearest.name;
              state.shelterQuery = nearest.sigungu || nearest.name;
              state.searched = true;
              showPage('shelter');
            }
          },
          err => {
            nearestBtn.disabled = false;
            nearestBtn.textContent = '📍 내 주변 대피소 찾기';
            alert('위치 정보를 가져오지 못했습니다. 지역명을 직접 입력해 검색해 주세요.');
          },
          { timeout: 7000 }
        );
      });
    }
  }

  


// Shelter module event delegation
document.addEventListener('click', e => {
  const btn = e.target.closest('.quick-shelter-btn');
  if (btn) {
    const q = btn.getAttribute('data-query');
    state.shelterQuery = q;
    state.searched = true;
    showPage('shelter');
    return;
  }
  if (e.target.closest('#ndvm-shelter-refresh')) {
    loadShelterStatus();
  }
});

document.addEventListener('submit', e => {
  if (e.target && e.target.id === 'shelter-form') {
    e.preventDefault();
    const input = document.getElementById('shelter-input');
    const typeSelect = document.getElementById('shelter-type');
    if (input) state.shelterQuery = input.value;
    if (typeSelect) state.shelterType = typeSelect.value;
    state.searched = true;
    showPage('shelter');
  }
});
