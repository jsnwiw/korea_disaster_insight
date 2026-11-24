/* NDVM - Interactive Map Module (Leaflet, GeoJSON Boundaries, Risk Coloring, Location Tools) */

let ndvmLeafletMap = null;
let userMarker = null;

let ndvmMapLayer = null;
let ndvmFloodWmsLayer = null;

let ndvmRiskCache = [];
let ndvmAllDisasterRisks = null;

let ndvmBoundaryLayer = null;
let ndvmSelectedBoundary = null;

// 로컬 행정구역 GeoJSON 우선 시도 (오프라인 및 즉시 로드), 실패 시 원격 저장소 fallback
const NDVM_BOUNDARY_URLS = [
  './data/skorea_municipalities_geo_simple.json',
  'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json'
];

function normalizeRegionName(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .replace(/특별자치도|특별자치시|특별시|광역시|자치구|시|군|구/g, '')
    .toLowerCase();
}

function getBoundaryRegionName(feature) {
  const props = feature && feature.properties ? feature.properties : {};
  const keys = [
    'name', 'NAME', 'name_1', 'NAME_1', 'SIG_KOR_NM',
    'SIG_ENG_NM', 'adm_nm', 'CTP_KOR_NM', 'SIGUNGU_NM', '지역명'
  ];
  for (const key of keys) {
    if (props[key]) return String(props[key]);
  }
  return '';
}

function findRiskForBoundary(feature) {
  if (!feature || !Array.isArray(ndvmRiskCache) || !ndvmRiskCache.length) return null;
  const props = feature.properties || {};
  const code = props.code ? String(props.code) : '';
  const boundaryName = normalizeRegionName(getBoundaryRegionName(feature));

  // 1. 행정동/시군구 코드 일치 확인 (가장 정확한 1:1 매칭)
  if (code) {
    const byCode = ndvmRiskCache.find(item => item.code && String(item.code) === code);
    if (byCode) return byCode;
  }

  // 2. 지명(시군구명) 정확 일치 확인
  if (boundaryName) {
    const exact = ndvmRiskCache.find(item => {
      const shortName = normalizeRegionName(item.short_region || '');
      const fullName = normalizeRegionName(item.region || '');
      return shortName === boundaryName || fullName === boundaryName;
    });
    if (exact) return exact;

    // 3. 접두/접미 포함 매칭
    const partial = ndvmRiskCache.filter(item => {
      const shortName = normalizeRegionName(item.short_region || '');
      const fullName = normalizeRegionName(item.region || '');
      return (shortName && (boundaryName.includes(shortName) || shortName.includes(boundaryName))) ||
             (fullName && (boundaryName.includes(fullName) || fullName.includes(boundaryName)));
    });
    if (partial.length > 0) return partial[0];
  }
  return null;
}

function choroplethColor(item) {
  if (window.ndvmDynamicActive && typeof calculateDynamicVulnerability === 'function' && item && Number.isFinite(Number(item.score))) {
    const hour = (typeof window.ndvmDynamicHour === 'number') ? window.ndvmDynamicHour : 18;
    const dayType = window.ndvmDynamicDayType || 'weekday';
    const dyn = calculateDynamicVulnerability(Number(item.score), item.region, hour, dayType);
    const s = dyn.dynamicScore;
    if (s >= 70) return '#dc2626';
    if (s >= 50) return '#ea580c';
    if (s >= 30) return '#f59e0b';
    return '#10b981';
  }
  if (!item || !Number.isFinite(Number(item.score))) return '#cbd5d6';
  const score = Number(item.score);
  if (score >= 70) return '#dc2626'; // 매우 높음 (빨강)
  if (score >= 50) return '#ea580c'; // 높음 (주황)
  if (score >= 30) return '#f59e0b'; // 보통 (노랑)
  return '#10b981'; // 낮음 (녹색)
}

function getBoundaryStyle(feature) {
  const item = findRiskForBoundary(feature);
  return {
    color: '#ffffff',
    weight: 1.2,
    opacity: 0.95,
    fillColor: choroplethColor(item),
    fillOpacity: item ? 0.65 : 0.2
  };
}

function refreshBoundaryChoropleth() {
  if (!ndvmBoundaryLayer) return;
  ndvmBoundaryLayer.setStyle(getBoundaryStyle);
  if (ndvmSelectedBoundary) ndvmSelectedBoundary.setStyle(getSelectedBoundaryStyle());
  const matched = [];
  ndvmBoundaryLayer.eachLayer(layer => { if (findRiskForBoundary(layer.feature)) matched.push(layer); });
  const status = document.getElementById('map-status');
  if (status && ndvmRiskCache.length) {
    status.textContent = `[${state.mapDisaster}] 위기별 취약도 색칠 완료 · 경계 ${matched.length}개 구역 연결 / ${ndvmRiskCache.length}개 데이터 · 녹색 낮음 / 노랑 보통 / 주황 높음 / 빨강 매우 높음`;
  }
}

function getSelectedBoundaryStyle() {
  return {
    color: '#0f172a',
    weight: 3.5,
    opacity: 1,
    fillColor: '#38bdf8',
    fillOpacity: 0.45
  };
}

function highlightBoundary(regionName) {
  if (!ndvmBoundaryLayer) return;

  if (ndvmSelectedBoundary) {
    ndvmBoundaryLayer.resetStyle(ndvmSelectedBoundary);
    ndvmSelectedBoundary = null;
  }

  const target = normalizeRegionName(regionName);
  if (!target) return;

  const layers = [];
  ndvmBoundaryLayer.eachLayer(layer => layers.push(layer));

  let match = layers.find(layer =>
    normalizeRegionName(getBoundaryRegionName(layer.feature)) === target
  );

  if (!match) {
    const candidates = layers.filter(layer => {
      const candidate = normalizeRegionName(getBoundaryRegionName(layer.feature));
      return candidate && (candidate.includes(target) || target.includes(candidate));
    });
    if (candidates.length === 1) match = candidates[0];
  }

  if (match) {
    match.setStyle(getSelectedBoundaryStyle());
    ndvmSelectedBoundary = match;
    if (match.bringToFront) match.bringToFront();
    return match;
  }
}

function selectRegion(regionName, shouldZoom) {
  if (!regionName) return;
  state.region = regionName;

  const list = document.getElementById('region-list');
  if (list) list.innerHTML = regionListHtml();

  const detail = document.getElementById('detail-info');
  if (detail) detail.innerHTML = detailInfoHtml();

  const matchLayer = highlightBoundary(regionName);

  if (shouldZoom !== false && ndvmLeafletMap) {
    if (matchLayer && typeof matchLayer.getBounds === 'function') {
      ndvmLeafletMap.fitBounds(matchLayer.getBounds(), { padding: [40, 40], maxZoom: 12 });
    } else {
      const coords = approximateCoords(regionName);
      if (coords) {
        ndvmLeafletMap.setView(coords, 10);
      }
    }
  }
}
window.selectRegion = selectRegion;

async function loadNdvmBoundaries() {
  const status = document.getElementById('map-status');
  if (!ndvmLeafletMap || !window.L) return;

  let geojson = null;
  for (const url of NDVM_BOUNDARY_URLS) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const parsed = await response.json();
        if (parsed && parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          geojson = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`경계 데이터 [${url}] 로드 시도 실패:`, e.message);
    }
  }

  if (!geojson) {
    if (status) status.textContent = '행정구역 경계를 불러오지 못했습니다. 위험도 표식은 별도로 표시됩니다.';
    return;
  }

  try {
    if (!ndvmLeafletMap) return;
    if (ndvmBoundaryLayer) ndvmBoundaryLayer.remove();

    ndvmBoundaryLayer = L.geoJSON(geojson, {
      style: getBoundaryStyle,
      onEachFeature(feature, layer) {
        const regionName = getBoundaryRegionName(feature);
        const item = findRiskForBoundary(feature);
        const tipText = item
          ? `<strong>${esc(item.region || regionName)}</strong><br>[${esc(state.mapDisaster)}] ${esc(item.level || '')} (${Number(item.score || 0).toFixed(1)}점)`
          : `<strong>${esc(regionName)}</strong>`;
        layer.bindTooltip(tipText, { sticky: true, direction: 'auto' });

        layer.on('click', () => {
          if (!regionName) return;
          state.region = item ? item.region : regionName;

          const list = document.getElementById('region-list');
          if (list) list.innerHTML = regionListHtml();

          const detail = document.getElementById('detail-info');
          if (detail) detail.innerHTML = detailInfoHtml();

          highlightBoundary(regionName);
          if (ndvmLeafletMap) {
            ndvmLeafletMap.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 10 });
          }
        });
      }
    }).addTo(ndvmLeafletMap);

    highlightBoundary(state.region);
    refreshBoundaryChoropleth();

    if (status && !ndvmRiskCache.length) {
      status.textContent = '행정구역 경계를 불러왔습니다. 취약도 데이터를 적용하는 중입니다.';
    }
  } catch (error) {
    console.warn('NDVM 행정구역 레이어 생성 실패:', error);
    if (status) {
      status.textContent = '행정구역 경계 렌더링에 실패했습니다. 위험도 표식을 확인하세요.';
    }
  }
}






function regionListHtml() {

  const allNames = [...new Set([...ndvmRiskCache.map(x => x.region).filter(Boolean), ...REGIONS])];

  const matches = allNames.filter(r => r.includes(state.regionQuery.trim())).slice(0, 80);

  return matches.length ? matches.map(r => `<button class="region ${r===state.region?'active':''}" type="button" data-region="${esc(r)}">${r}<span aria-hidden="true">›</span></button>`).join('') : `<p class="empty-small">검색 결과가 없습니다.</p>`;

}

function riskColor(level) {
  const s = String(level || '').toLowerCase();
  if (s.includes('매우 높') || s.includes('very high')) return '#dc2626';
  if (s.includes('높')) return '#ea580c';
  if (s.includes('보통') || s.includes('중간') || s.includes('medium')) return '#f59e0b';
  if (s.includes('낮')) return '#10b981';
  return '#8fa3a8';
}

function getRiskForRegion(name) {

  return ndvmRiskCache.find(r => r.region === name || name.includes(r.region) || r.region.includes(name)) || null;

}

function detailInfoHtml() {
  const item = getRiskForRegion(state.region);
  if (typeof window.renderNeighborhoodDisasterHtml === 'function') { return window.renderNeighborhoodDisasterHtml(state.region, item); }
  if (typeof renderNeighborhoodDisasterHtml === 'function') {
    return renderNeighborhoodDisasterHtml(state.region, item);
  }



  if (!item) return `<span class="minor">선택한 지역</span><h3 class="region-title">${esc(state.region)}</h3><span class="pill">위험도 정보 없음</span>

    <div style="margin-top:18px"><div class="detail-pair"><span>재해 유형</span><strong>${esc(state.mapDisaster)}</strong></div><div class="detail-pair"><span>데이터 상태</span><strong>${ndvmRiskCache.length ? '지역명 매칭 대기' : 'API 연결 중'}</strong></div></div>

    <p class="detail-desc">백엔드에 해당 지역의 일치하는 기록이 없거나, 아직 데이터를 불러오지 못했습니다.</p>`;

  return `<span class="minor">선택한 지역</span><h3 class="region-title">${esc(item.region)}</h3>

    <span class="pill" style="border-color:${riskColor(item.level)};color:${riskColor(item.level)}">${esc(item.level || '정보 없음')}</span>

    <div style="margin-top:18px"><div class="detail-pair"><span>재해 유형</span><strong>${esc(state.mapDisaster)}</strong></div>

    <div class="detail-pair"><span>시범 점수</span><strong>${Number(item.score ?? 0).toFixed(1)} / 100</strong></div>

    <div class="detail-pair"><span>피해 기록 연도 수</span><strong>${Number(item.damage_years ?? 0)}년</strong></div>

    <div class="detail-pair"><span>최근 피해 기록</span><strong>${item.latest_positive_damage_year ?? '기록 없음'}</strong></div></div>

    <p class="detail-desc">과거 피해 기록을 바탕으로 한 시범 점수이며 실제 침수 확률이나 공식 위험등급이 아닙니다.</p>

    <div class="legend"><span><b style="background:#10b981"></b>낮음</span><span><b style="background:#f59e0b"></b>보통</span><span><b style="background:#ea580c"></b>높음</span><span><b style="background:#dc2626"></b>매우 높음</span><span><b style="background:#cbd5d6"></b>정보 없음</span></div>`;

}

let ndvmFactorsCollapsed = false;

function toggleFactorsPanel() {
  ndvmFactorsCollapsed = !ndvmFactorsCollapsed;
  const wrap = document.getElementById('banner-factors-wrap');
  const text = document.getElementById('factors-toggle-text');
  const btn = document.getElementById('btn-toggle-factors');
  if (wrap) {
    wrap.style.display = ndvmFactorsCollapsed ? 'none' : 'block';
  }
  if (text) {
    text.textContent = ndvmFactorsCollapsed ? '분석 요인 펼치기 ▼' : '분석 요인 접기 ▲';
  }
  if (btn) {
    btn.setAttribute('aria-expanded', String(!ndvmFactorsCollapsed));
  }
}

function switchIntegratedDisaster(disasterName) {
  if (!TYPES.includes(disasterName)) return;
  state.disaster = disasterName;
  state.mapDisaster = disasterName;

  document.querySelectorAll('.ndvm-integrated-chips .chip').forEach(chip => {
    const isTarget = chip.getAttribute('data-disaster') === disasterName;
    chip.classList.toggle('active', isTarget);
    chip.setAttribute('aria-pressed', String(isTarget));
  });

  const info = DISASTER[disasterName] || [];
  const disasterIcons = {
    '침수·홍수': '🌧',
    '산사태': '⛰',
    '태풍': '🌀',
    '폭염': '☀️',
    '폭설': '❄️',
    '가뭄': '💧',
    '지진': '⚡'
  };
  const icon = disasterIcons[disasterName] || '⚠️';

  const letterEl = document.querySelector('.feature-letter-unified');
  if (letterEl) letterEl.textContent = icon;

  const tagEl = document.querySelector('.banner-tag');
  if (tagEl) tagEl.textContent = disasterName;

  const titleEl = document.getElementById('banner-disaster-title');
  if (titleEl) titleEl.textContent = `${disasterName} 분석 개요`;

  const descEl = document.getElementById('banner-disaster-desc');
  if (descEl && info[0]) descEl.textContent = info[0];

  const gridEl = document.getElementById('banner-factors-grid');
  if (gridEl && info.length > 1) {
    gridEl.innerHTML = info.slice(1).map((item, i) => `
      <div class="factor-card">
        <span class="factor-num">0${i + 1}</span>
        <div class="factor-body">
          <strong>${esc(item)}</strong>
          <p>공공데이터 및 지자체 관측망 연계 위험 분석 지표</p>
        </div>
      </div>
    `).join('');
  }

  const selectEl = document.getElementById('map-disaster');
  if (selectEl && selectEl.value !== disasterName) {
    selectEl.value = disasterName;
  }

  loadNdvmRisks(disasterName);
}

function mapPage() {
  const currentDisaster = state.mapDisaster || state.disaster || '침수·홍수';
  const info = DISASTER[currentDisaster] || DISASTER['침수·홍수'];
  const disasterIcons = {
    '침수·홍수': '🌧',
    '산사태': '⛰',
    '태풍': '🌀',
    '폭염': '☀️',
    '폭설': '❄️',
    '가뭄': '💧',
    '지진': '⚡'
  };
  const icon = disasterIcons[currentDisaster] || '⚠️';

  return `<div class="page">${head('01 / INTEGRATED ANALYSIS & MAP', '재해 분석 및 취약도 지도', '7대 자연재해 유형별 위험 분석 요인과 전국 251개 시·군·구 행정구역 취약도 지도를 한눈에 통합 탐색합니다.')}

    <!-- 1. 재해 유형 선택 칩스 (상단 바) -->
    <div class="ndvm-disaster-select-wrap">
      <div class="chips ndvm-integrated-chips" role="group" aria-label="재해 유형 선택">
        ${TYPES.map(t => `
          <button type="button" class="chip ${t === currentDisaster ? 'active' : ''}" data-disaster="${esc(t)}" aria-pressed="${t === currentDisaster}">
            ${disasterIcons[t] || ''} ${esc(t)}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 2. 재해 분석 개요 및 주요 분석 지표 통합 패널 (접기/펼치기 지원) -->
    <section class="ndvm-integrated-banner panel" id="ndvm-integrated-analysis-banner">
      <div class="banner-top">
        <div class="feature-letter-unified" aria-hidden="true">${icon}</div>
        <div class="banner-summary">
          <div class="banner-labels">
            <span class="little-label">DISASTER OVERVIEW</span>
            <span class="banner-tag">${esc(currentDisaster)}</span>
          </div>
          <h2 id="banner-disaster-title">${esc(currentDisaster)} 분석 개요</h2>
          <p id="banner-disaster-desc">${esc(info[0])}</p>
        </div>
        <button type="button" class="btn-toggle-factors" id="btn-toggle-factors" onclick="toggleFactorsPanel()" aria-expanded="${!ndvmFactorsCollapsed}">
          <span id="factors-toggle-text">${ndvmFactorsCollapsed ? '분석 요인 펼치기 ▼' : '분석 요인 접기 ▲'}</span>
        </button>
      </div>

      <div class="banner-factors-wrap" id="banner-factors-wrap" style="display:${ndvmFactorsCollapsed ? 'none' : 'block'}">
        <h4 class="factors-section-title">📊 공공데이터 기반 3대 핵심 분석 항목</h4>
        <div class="factors-grid" id="banner-factors-grid">
          ${info.slice(1).map((item, i) => `
            <div class="factor-card">
              <span class="factor-num">0${i + 1}</span>
              <div class="factor-body">
                <strong>${esc(item)}</strong>
                <p>공공데이터 및 지자체 관측망 연계 위험 분석 지표</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 3. 지도 필터 및 컨트롤 바 -->
    <div class="filters ndvm-map-filters">
      <div class="ndvm-search-box">         <label class="control search"><span aria-hidden="true">⌕</span><input id="region-search" placeholder="지역 검색 (예: 서울, 강남, 부산)" aria-label="지역 검색" value="${esc(state.regionQuery)}"></label>         <button type="button" id="btn-region-search" class="btn primary btn-search-submit" title="입력한 지역 검색 및 지도 이동">검색</button>       </div>
      
<button type="button" id="map-reload" class="btn" title="전국 취약도 데이터 다시 불러오기">데이터 새로고침</button>
<button type="button" id="btn-reset-korea-view" class="btn" title="대한민국 전체 화면으로 지도 위치/확대 리셋">대한민국 전체 ⟲</button>
<button type="button" id="btn-toggle-dynamic" class="btn dyn-toggle-btn" onclick="toggleDynamicVulnerability()" aria-pressed="false" title="시간대별 실시간 유동인구 결합 동적 취약도 분석 켜기/끄기">👥 동적 취약성 (유동인구)</button>
      <button type="button" class="btn" data-page="rainfall">강수량 조회 →</button>
      <button type="button" id="btn-toggle-radar" class="btn alert-toggle-btn active" onclick="toggleAlertPulseLayer()" aria-pressed="true" title="실시간 재난문자 발생지 펄스 마커 켜기/끄기">
        🚨 재난문자 레이더 <span class="badge radar-badge" id="radar-count-badge">6</span>
      </button>
    </div>

    <!-- 4. 지도 & 지역 상세정보 레이아웃 -->
    <div class="map-layout">
      <section class="map-panel panel">
        <div id="ndvm-map" style="height:460px;min-height:360px;width:100%;border-radius:16px;overflow:hidden;background:#edf4f2"></div>
        <div id="map-status" class="map-sub">백엔드 데이터 연결을 준비하고 있습니다.</div>
        <div class="ndvm-choropleth-legend" aria-label="취약도 색상 범례">
          <strong>위기 등급별 색상</strong>
          <span><i style="background:#10b981"></i>낮음 · 0–29</span>
          <span><i style="background:#f59e0b"></i>보통 · 30–49</span>
          <span><i style="background:#ea580c"></i>높음 · 50–69</span>
          <span><i style="background:#dc2626"></i>매우 높음 · 70–100</span>
          <span><i style="background:#cbd5d6"></i>연결 데이터 없음</span>
        </div>
      </section>

      <!-- 우리 동네 재난 정보 통합 패널 (지도 하단 전폭 뷰 & UI 통일) -->
      <section class="detail panel ndvm-neighborhood-panel" id="ndvm-neighborhood-panel">
        <div class="detail-search ndvm-region-search-row">
          <span class="region-select-label">📍 지역 빠른 선택:</span>
          <div class="region-list" id="region-list">${regionListHtml()}</div>
        </div>
        <div id="detail-info">${detailInfoHtml()}</div>
      </section>


    </div>

    ${note('안내: 상단 7대 재해 칩을 선택하면 분석 요인과 전국 251개 행정구역 취약도 지도 색상이 실시간으로 동기화됩니다.')}
  </div>`;
}

window.switchIntegratedDisaster = switchIntegratedDisaster;
window.toggleFactorsPanel = toggleFactorsPanel;

function initNdvmMap() {
  const mapElement = document.getElementById('ndvm-map');
  if (!mapElement) return;

  if (!window.L) {
    const status = document.getElementById('map-status');
    if (status) status.textContent = '지도 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.';
    return;
  }

  if (ndvmLeafletMap) {
    ndvmLeafletMap.remove();
    ndvmLeafletMap = null;
    ndvmMapLayer = null;
    ndvmFloodWmsLayer = null;
    ndvmBoundaryLayer = null;
    ndvmSelectedBoundary = null;
  }

  const KOREA_VIEW_BOUNDS = L.latLngBounds([33.0, 125.0], [38.6, 130.2]);
  const KOREA_MAX_BOUNDS = L.latLngBounds([31.5, 122.5], [40.0, 133.0]);
  ndvmLeafletMap = L.map(mapElement, { scrollWheelZoom: true, minZoom: 6, maxZoom: 18, zoomSnap: 0.1, maxBounds: KOREA_MAX_BOUNDS, maxBoundsViscosity: 0.85 });
  window.ndvmLeafletMap = ndvmLeafletMap;
  ndvmLeafletMap.fitBounds(KOREA_VIEW_BOUNDS, { padding: [10, 10] });
  window.addEventListener('resize', () => { if (ndvmLeafletMap) { ndvmLeafletMap.invalidateSize(); ndvmLeafletMap.fitBounds(KOREA_VIEW_BOUNDS, { padding: [10, 10] }); } });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 5, attribution: '&copy; OpenStreetMap contributors' }).addTo(ndvmLeafletMap);




  ndvmMapLayer = L.layerGroup().addTo(ndvmLeafletMap);
  setTimeout(() => ndvmLeafletMap && ndvmLeafletMap.invalidateSize(), 80);

  loadNdvmRisks();
  loadNdvmBoundaries();
  loadNdvmFloodWmsLayer();
  if (typeof window.initAlertsOnMap === 'function') {
    window.initAlertsOnMap(ndvmLeafletMap);
  }
  if (typeof window.initHotspotsOnMap === 'function') {
    window.initHotspotsOnMap(ndvmLeafletMap);
  }
}
async function loadNdvmFloodWmsLayer() {
  const status = document.getElementById('map-status');
  try {
    const response = await fetch(`${apiBase()}/api/flood/map-config`);
    if (!response.ok) throw new Error(`지도 설정 API 응답 ${response.status}`);
    const config = await response.json();
    if (!config.available || !config.url || !config.layers) {
      return;
    }
    if (ndvmFloodWmsLayer && ndvmLeafletMap) ndvmLeafletMap.removeLayer(ndvmFloodWmsLayer);
    ndvmFloodWmsLayer = L.tileLayer.wms(config.url, {
      layers: config.layers,
      version: config.version || '1.3.0',
      format: config.format || 'image/png',
      transparent: true,
      attribution: config.attribution || config.source || ''
    });
    ndvmFloodWmsLayer.addTo(ndvmLeafletMap);
    if (status) status.textContent = `${status.textContent || ''} · 공식 하천범람지도 WMS 레이어 연결`;
  } catch (error) {
    if (status) status.textContent = `${status.textContent || ''} · 하천범람 WMS 설정 확인 필요 (${error.message})`;
  }
}

// 기본 내장 재해별 데이터 생성기 (완전 오프라인 또는 파일 누락 시 방어 로직)
function generateFallbackRisks(disasterType) {
  const d = disasterType || state.mapDisaster || '침수·홍수';
  return REGIONS.map((r, i) => {
    let score = 45;
    if (d === '침수·홍수') score = [82, 65, 74, 52, 79, 60][i % 6];
    else if (d === '태풍') score = [35, 42, 78, 55, 92, 95][i % 6];
    else if (d === '산사태') score = [25, 68, 62, 58, 48, 50][i % 6];
    else if (d === '폭염') score = [76, 84, 82, 95, 78, 45][i % 6];
    else if (d === '폭설') score = [58, 62, 78, 25, 20, 65][i % 6];
    else if (d === '가뭄') score = [32, 65, 72, 60, 54, 48][i % 6];
    else if (d === '지진') score = [18, 30, 25, 68, 75, 22][i % 6];
    
    let level = '보통';
    if (score >= 70) level = '매우 높음';
    else if (score >= 50) level = '높음';
    else if (score < 30) level = '낮음';

    return {
      region: r,
      short_region: r.slice(0, 2),
      score: score,
      level: level,
      damage_years: Math.round(score / 5),
      latest_positive_damage_year: 2024 - Math.round((100 - score) / 15)
    };
  });
}

async function loadNdvmRisks(disasterType) {
  const disaster = disasterType || state.mapDisaster || '침수·홍수';
  const status = document.getElementById('map-status');
  if (status) status.textContent = `[${disaster}] 위기별 취약도 데이터를 분석하는 중…`;

  // 1. 사전 생성된 전국 251개 시군구 재해별 데이터셋 로드
  if (!ndvmAllDisasterRisks) {
    try {
      const localRes = await fetch('./data/disaster_risks.json');
      if (localRes.ok) {
        ndvmAllDisasterRisks = await localRes.json();
      }
    } catch (e) {
      console.warn('disaster_risks.json 로드 대기:', e.message);
    }
  }

  let backendSuccess = false;
  // 2. 백엔드 API 연결 시도 (백엔드가 켜져 있는 경우 최신 서버 데이터 연동)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const response = await fetch(`${apiBase()}/api/flood/risk/all?disaster=${encodeURIComponent(disaster)}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.regions) && data.regions.length > 0) {
        ndvmRiskCache = data.regions;
        backendSuccess = true;
      }
    }
  } catch (error) {
    // 백엔드 미응답 시 fallback으로 자동 진행
  }

  // 3. 백엔드 데이터가 없으면 내장 데이터셋 적용
  if (!backendSuccess) {
    if (ndvmAllDisasterRisks && Array.isArray(ndvmAllDisasterRisks[disaster])) {
      ndvmRiskCache = ndvmAllDisasterRisks[disaster];
    } else {
      ndvmRiskCache = generateFallbackRisks(disaster);
    }
  }

  // 지도 색상 및 마커 즉시 갱신
  refreshBoundaryChoropleth();
  renderNdvmRiskMarkers();

  const statusNow = document.getElementById('map-status');
  if (statusNow) {
    statusNow.textContent = `[${disaster}] 취약도 색칠 완료 · ${ndvmRiskCache.length}개 지역 데이터 반영 · 녹색 낮음 / 노랑 보통 / 주황 높음 / 빨강 매우 높음`;
  }

  const regionList = document.getElementById('region-list');
  if (regionList) regionList.innerHTML = regionListHtml();

  const detail = document.getElementById('detail-info');
  if (detail) detail.innerHTML = detailInfoHtml();
}

const SIDO_REPRESENTATIVE_COORDS = [
  { name: '서울특별시', lat: 37.5665, lng: 126.9780, regionKey: '서울' },
  { name: '부산광역시', lat: 35.1796, lng: 129.0756, regionKey: '부산' },
  { name: '대구광역시', lat: 35.8714, lng: 128.6014, regionKey: '대구' },
  { name: '인천광역시', lat: 37.4563, lng: 126.7052, regionKey: '인천' },
  { name: '광주광역시', lat: 35.1595, lng: 126.8526, regionKey: '광주' },
  { name: '대전광역시', lat: 36.3504, lng: 127.3845, regionKey: '대전' },
  { name: '울산광역시', lat: 35.5384, lng: 129.3114, regionKey: '울산' },
  { name: '세종특별자치시', lat: 36.4800, lng: 127.2890, regionKey: '세종' },
  { name: '경기도 (수원)', lat: 37.2636, lng: 127.0286, regionKey: '수원' },
  { name: '강원도 (춘천)', lat: 37.8813, lng: 127.7298, regionKey: '춘천' },
  { name: '충청북도 (청주)', lat: 36.6424, lng: 127.4890, regionKey: '청주' },
  { name: '충청남도 (홍성)', lat: 36.6013, lng: 126.6608, regionKey: '홍성' },
  { name: '전라북도 (전주)', lat: 35.8242, lng: 127.1480, regionKey: '전주' },
  { name: '전라남도 (목포)', lat: 34.8118, lng: 126.3922, regionKey: '목포' },
  { name: '경상북도 (안동)', lat: 36.5684, lng: 128.7294, regionKey: '안동' },
  { name: '경상남도 (창원)', lat: 35.2280, lng: 128.6811, regionKey: '창원' },
  { name: '제주특별자치도', lat: 33.4996, lng: 126.5312, regionKey: '제주' },
  { name: '포항시', lat: 36.0190, lng: 129.3435, regionKey: '포항' },
  { name: '강릉시', lat: 37.7519, lng: 128.8761, regionKey: '강릉' }
];

function approximateCoords(region) {
  const norm = normalizeRegionName(region);
  const found = SIDO_REPRESENTATIVE_COORDS.find(c => norm.includes(normalizeRegionName(c.regionKey)));
  if (found) return [found.lat, found.lng];
  return null;
}

function renderNdvmRiskMarkers() {
  if (!ndvmLeafletMap || !ndvmMapLayer) return;
  ndvmMapLayer.clearLayers();

  SIDO_REPRESENTATIVE_COORDS.forEach(point => {
    const item = ndvmRiskCache.find(r => {
      const reg = normalizeRegionName(r.region || r.short_region || '');
      return reg.includes(normalizeRegionName(point.regionKey));
    }) || { region: point.name, score: 35, level: '보통', damage_years: 5 };

    const score = Number(item.score || 0);
    const marker = L.circleMarker([point.lat, point.lng], {
      radius: Math.max(7, Math.min(16, 6 + score / 10)),
      color: '#ffffff',
      weight: 2,
      fillColor: choroplethColor(item),
      fillOpacity: 0.88
    }).bindPopup(
      `<strong>${esc(item.region || point.name)}</strong><br>` +
      `[${esc(state.mapDisaster)}] 취약도: <strong>${score.toFixed(1)}점</strong> (${esc(item.level || '보통')})<br>` +
      `피해 기록 연도 수: ${Number(item.damage_years || 0)}년<br>` +
      `<small>거점별 대표 지점 표식입니다.</small>`
    );

    marker.on('click', () => {
      state.region = item.region || point.name;
      const list = document.getElementById('region-list');
      if (list) list.innerHTML = regionListHtml();
      const detail = document.getElementById('detail-info');
      if (detail) detail.innerHTML = detailInfoHtml();
      highlightBoundary(state.region);
    });

    marker.addTo(ndvmMapLayer);
  });
}



function addMapTools() {
    const filters = $('.page .filters');
    if (!filters || !$('#ndvm-map') || $('#ndvm-location-btn')) return;
    const btn = document.createElement('button');
    btn.type='button'; btn.id='ndvm-location-btn'; btn.className='btn';
    btn.textContent='내 위치 표시';
    filters.appendChild(btn);
    const alertBtn=document.createElement('button');
    alertBtn.type='button'; alertBtn.id='ndvm-notify-btn'; alertBtn.className='btn';
    alertBtn.textContent='브라우저 알림 켜기';
    filters.appendChild(alertBtn);
    const search=$('#region-search');
    if(search) { search.setAttribute('autocomplete','off'); search.setAttribute('aria-describedby','ndvm-search-help'); }
    if(!$('#ndvm-search-help')) {
      const help=document.createElement('div'); help.id='ndvm-search-help'; help.className='ndvm-inline-help';
      help.textContent='지역명을 입력하면 목록이 좁혀집니다. 결과를 선택하면 지도와 상세정보가 함께 이동합니다.';
      filters.insertAdjacentElement('afterend',help);
    }
  }

  async function showMyLocation() {
    if (!navigator.geolocation) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return; }
    const btn=$('#ndvm-location-btn'); if(btn){btn.disabled=true;btn.textContent='위치 확인 중…';}
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude,longitude}=pos.coords;
      if (window.ndvmLeafletMap) {
        if(userMarker) userMarker.remove();
        userMarker = L.marker([latitude,longitude]).addTo(window.ndvmLeafletMap)
          .bindPopup('현재 기기 위치<br><small>위치는 이 브라우저에서만 사용됩니다.</small>').openPopup();
        window.ndvmLeafletMap.setView([latitude,longitude],12);
      } else {
        alert(`현재 위치: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n지도 화면을 열어 다시 시도해 주세요.`);
      }
      if(btn){btn.disabled=false;btn.textContent='내 위치 표시';}
    }, err => {
      const messages={1:'위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.',2:'현재 위치를 확인할 수 없습니다.',3:'위치 확인 시간이 초과되었습니다.'};
      alert(messages[err.code] || '위치를 가져오지 못했습니다.');
      if(btn){btn.disabled=false;btn.textContent='내 위치 표시';}
    }, {enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  }

  async function enableNotifications() {
    if (!('Notification' in window)) { alert('이 브라우저는 알림을 지원하지 않습니다.'); return; }
    const permission=await Notification.requestPermission();
    const btn=$('#ndvm-notify-btn');
    if(permission==='granted') {
      new Notification('NDVM 알림 설정 완료',{body:'브라우저 알림 권한이 켜졌습니다. 현재 서버는 공식 실시간 재난 경보를 구독하지 않습니다.'});
      if(btn) btn.textContent='알림 권한 허용됨';
      alert('브라우저 알림 권한을 허용했습니다. 아직 실시간 재난 경보 구독은 연결되지 않았으므로 공식 재난문자를 별도로 확인하세요.');
    } else {
      if(btn) btn.textContent='알림 권한 다시 설정';
      alert('알림 권한이 허용되지 않았습니다. 브라우저 설정에서 변경할 수 있습니다.');
    }
  }

// Map module event delegation
document.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'region-search' && e.key === 'Enter') {
    e.preventDefault();
    const q = e.target.value.trim();
    if (!q) return;
    const allNames = [...new Set([...ndvmRiskCache.map(x => x.region).filter(Boolean), ...REGIONS])];
    const match = allNames.find(r => r === q || r.includes(q));
    if (match) {
      selectRegion(match, true);
      const searchHelp = document.getElementById('ndvm-search-help');
      if (searchHelp) searchHelp.textContent = `[${match}] 지역으로 지도 및 상세정보를 이동했습니다.`;
    }
  }
});

document.addEventListener('input', e => {
  if (e.target && e.target.id === 'region-search') {
    state.regionQuery = e.target.value;
    const list = document.getElementById('region-list');
    if (list) list.innerHTML = regionListHtml();

    // 입력한 검색어가 어떤 지역명과 정확히 일치하거나 첫 번째 후보가 있으면 선택
    const q = e.target.value.trim();
    if (q.length >= 2) {
      const allNames = [...new Set([...ndvmRiskCache.map(x => x.region).filter(Boolean), ...REGIONS])];
      const exact = allNames.find(r => r === q || r.startsWith(q));
      if (exact && exact !== state.region) {
        selectRegion(exact, false);
      }
    }
    return;
  }




});

document.addEventListener('change', e => {
  if (e.target && e.target.id === 'map-disaster') {
    state.mapDisaster = e.target.value;
    loadNdvmRisks(state.mapDisaster);
  }
});

document.addEventListener('click', e => {
  if (e.target.closest('#btn-region-search')) {
 const input = document.getElementById('region-search');
 const q = input ? input.value.trim() : '';
 if (q) {
 const allNames = [...new Set([...ndvmRiskCache.map(x => x.region).filter(Boolean), ...REGIONS])];
 const match = allNames.find(r => r === q || r.includes(q));
 if (match) {
 selectRegion(match, true);
 const searchHelp = document.getElementById('ndvm-search-help');
        if (searchHelp) searchHelp.textContent = `[${match}] 지역으로 지도 및 상세정보를 이동했습니다.`;
 } else {
        alert(`'${q}' 지역을 찾을 수 없습니다. 시·도 또는 시·군·구 이름을 입력해 주세요.`);
 }
 }
 return;
 }
  if (e.target.closest('#btn-reset-korea-view')) { if (ndvmLeafletMap) { ndvmLeafletMap.fitBounds(L.latLngBounds([33.0, 125.0], [38.6, 130.2]), { padding: [10, 10] }); } return; }
    if (e.target.closest('#map-reload')) {
    loadNdvmRisks(state.mapDisaster);
    loadNdvmBoundaries();
    loadNdvmFloodWmsLayer();
    return;
  }
  if (e.target.closest('#ndvm-location-btn')) {
    showMyLocation();
    return;
  }
  if (e.target.closest('#ndvm-notify-btn')) {
    enableNotifications();
    return;
  }
  const regBtn = e.target.closest('.region[data-region]');
  if (regBtn) {
    const reg = regBtn.getAttribute('data-region');
    if (reg) selectRegion(reg, true);
    return;
  }















});

