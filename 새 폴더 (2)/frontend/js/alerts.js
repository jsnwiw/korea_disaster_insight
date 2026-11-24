/* NDVM - Real-time Disaster Alerts & Radar Pulse Map Module */

let ndvmDisasterAlerts = [];
let ndvmCurrentTickerIndex = 0;
let ndvmTickerTimer = null;
let ndvmTickerIsPaused = false;
let ndvmAlertPulseLayer = null;
let ndvmAlertMarkersMap = {};
let ndvmRadarVisible = true;

const NDVM_FALLBACK_ALERTS = [
  {
    id: "alert_2026_01",
    category: "호우",
    level: "긴급재난",
    sender: "서울특별시 / 기상청",
    title: "[호우경보] 서울 강남·서초 일대 집중호우 경보",
    message: "시간당 55mm 이상의 매우 강한 비가 지속되고 있습니다. 탄천·양재천 산책로와 지하차도 진입을 절대 금지하며, 반지하 및 저지대 주민은 즉시 안전한 고지대로 대피 바랍니다.",
    region: "서울특별시 강남구",
    sido: "서울특별시",
    sigungu: "강남구",
    lat: 37.4981,
    lng: 127.0276,
    timestamp: "방금 전 (14:10)",
    instruction: "하천변 및 지하차도 진입 금지, 저지대 거주민 즉시 대피",
    is_active: true
  },
  {
    id: "alert_2026_02",
    category: "산사태",
    level: "긴급재난",
    sender: "산림청",
    title: "[산사태경보] 강원 강릉시 산사태 경보 발령",
    message: "지속된 집중호우로 강릉시 전역에 산사태 경보가 발령되었습니다. 급경사지 인접 주민 및 산간 방문객은 즉시 마을회관 등 지정 대피소로 대피하십시오.",
    region: "강원특별자치도 강릉시",
    sido: "강원특별자치도",
    sigungu: "강릉시",
    lat: 37.7519,
    lng: 128.8761,
    timestamp: "18분 전 (13:56)",
    instruction: "산림 인접지 출입 금지 및 인근 대피시설 대피",
    is_active: true
  },
  {
    id: "alert_2026_03",
    category: "지진",
    level: "안전안내",
    sender: "기상청",
    title: "[지진속보] 경북 포항시 북구 해역 규모 3.4 지진 발생",
    message: "경북 포항시 북구 북쪽 9km 해역에서 규모 3.4 지진 발생. 낙하물에 주의하시고 여진 발생에 대비하여 머리를 보호하고 넓은 공터로 이동하세요.",
    region: "경상북도 포항시",
    sido: "경상북도",
    sigungu: "포항시",
    lat: 36.0821,
    lng: 129.3653,
    timestamp: "35분 전 (13:40)",
    instruction: "머리 보호 및 비상계단 이용 대피 (엘리베이터 탑승 금지)",
    is_active: true
  },
  {
    id: "alert_2026_04",
    category: "홍수",
    level: "긴급재난",
    sender: "금강홍수통제소",
    title: "[홍수주의보] 충남 당진시 당진천 수위 상승 홍수주의보",
    message: "당진천 수위가 급격히 상승하여 경계수위에 도달했습니다. 하천변 둔치 주차장 차량은 즉시 이동 조치하고 하천변 산책로 출입을 금지합니다.",
    region: "충청남도 당진시",
    sido: "충청남도",
    sigungu: "당진시",
    lat: 36.8931,
    lng: 126.6283,
    timestamp: "52분 전 (13:22)",
    instruction: "하천 둔치 차량 대피 및 저지대 침수 대비",
    is_active: true
  },
  {
    id: "alert_2026_05",
    category: "태풍",
    level: "안전안내",
    sender: "부산광역시 재난안전대책본부",
    title: "[강풍·풍랑주의보] 부산 해안가 월파 및 강풍 주의",
    message: "해안가를 중심으로 순간최대풍속 20m/s 내외의 강풍과 높은 너울성 파도가 발생하고 있습니다. 해안산책로, 방파제, 갯바위 출입을 통제합니다.",
    region: "부산광역시 해운대구",
    sido: "부산광역시",
    sigungu: "해운대구",
    lat: 35.1631,
    lng: 129.1636,
    timestamp: "1시간 전 (13:10)",
    instruction: "해안가 출입 통제 준수 및 시설물 결속 점검",
    is_active: true
  },
  {
    id: "alert_2026_06",
    category: "호우",
    level: "안전안내",
    sender: "광주광역시",
    title: "[호우주의보] 광주광역시 전역 호우주의보 발효",
    message: "광주 전역에 호우주의보가 발효 중입니다. 배수구 역류 및 지하차도 침수 위험이 있으니 차량 운행 시 감속하고 보행 안전에 유의하세요.",
    region: "광주광역시 서구",
    sido: "광주광역시",
    sigungu: "서구",
    lat: 35.1521,
    lng: 126.8900,
    timestamp: "1시간 30분 전 (12:45)",
    instruction: "상습 침수 도로 우회 및 보행 안전 유의",
    is_active: true
  }
];

// 1. 재난문자 데이터 로드 (백엔드 연동 + 로컬 폴백)
async function fetchDisasterAlerts() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${apiBase()}/api/disaster-alerts`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      ndvmDisasterAlerts = data.items;
      return ndvmDisasterAlerts;
    }
  } catch (err) {
    // 백엔드 미실행 시 로컬 내장 데이터 안전 사용
  }
  ndvmDisasterAlerts = NDVM_FALLBACK_ALERTS;
  return ndvmDisasterAlerts;
}

// 2. 상단 재난문자 티커 바 렌더링
function renderAlertTickerUI() {
  const container = document.getElementById('ndvm-alert-ticker-container');
  if (!container) return;

  const alerts = ndvmDisasterAlerts.length > 0 ? ndvmDisasterAlerts : NDVM_FALLBACK_ALERTS;
  const current = alerts[ndvmCurrentTickerIndex] || alerts[0];
  const isEmergency = current.level === '긴급재난' || current.level === '위급재난';

  container.innerHTML = `
    <aside class="ndvm-ticker-bar ${isEmergency ? 'emergency' : 'safety'}" role="alert" aria-live="assertive">
      <div class="ticker-inner">
        <div class="ticker-badge">
          <span class="ticker-beacon" aria-hidden="true"></span>
          <strong>${esc(current.level || '긴급재난')}</strong>
          <span class="ticker-count">${ndvmCurrentTickerIndex + 1}/${alerts.length}</span>
        </div>
        
        <div class="ticker-content" id="ticker-alert-item" title="클릭 시 지도에서 위치를 확인합니다.">
          <span class="ticker-tag">${esc(current.category)}</span>
          <span class="ticker-title">${esc(current.title)}</span>
          <span class="ticker-time">${esc(current.timestamp)}</span>
          <span class="ticker-hint">지도 보기 ›</span>
        </div>

        <div class="ticker-controls">
          <button type="button" class="ticker-btn" id="ticker-prev" aria-label="이전 재난문자">‹</button>
          <button type="button" class="ticker-btn" id="ticker-toggle-play" aria-label="${ndvmTickerIsPaused ? '재생' : '일시정지'}">
            ${ndvmTickerIsPaused ? '▶' : '❚❚'}
          </button>
          <button type="button" class="ticker-btn" id="ticker-next" aria-label="다음 재난문자">›</button>
          <button type="button" class="ticker-list-btn" id="ticker-open-modal">
            <span>재난문자 보관함</span>
            <strong class="count-pill">${alerts.length}</strong>
          </button>
        </div>
      </div>
    </aside>
  `;

  // 티커 이벤트 리스너 연결
  const alertItemEl = document.getElementById('ticker-alert-item');
  if (alertItemEl) {
    alertItemEl.onclick = () => focusDisasterAlert(current.id);
  }

  const prevBtn = document.getElementById('ticker-prev');
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      navigateTicker(-1);
    };
  }

  const nextBtn = document.getElementById('ticker-next');
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      navigateTicker(1);
    };
  }

  const playBtn = document.getElementById('ticker-toggle-play');
  if (playBtn) {
    playBtn.onclick = (e) => {
      e.stopPropagation();
      toggleTickerPlay();
    };
  }

  const modalBtn = document.getElementById('ticker-open-modal');
  if (modalBtn) {
    modalBtn.onclick = (e) => {
      e.stopPropagation();
      openDisasterAlertModal();
    };
  }
}

function startTickerTimer() {
  stopTickerTimer();
  if (ndvmTickerIsPaused) return;
  ndvmTickerTimer = setInterval(() => {
    navigateTicker(1, true);
  }, 4800);
}

function stopTickerTimer() {
  if (ndvmTickerTimer) {
    clearInterval(ndvmTickerTimer);
    ndvmTickerTimer = null;
  }
}

function toggleTickerPlay() {
  ndvmTickerIsPaused = !ndvmTickerIsPaused;
  if (ndvmTickerIsPaused) {
    stopTickerTimer();
  } else {
    startTickerTimer();
  }
  renderAlertTickerUI();
}

function navigateTicker(direction, fromAuto = false) {
  const alerts = ndvmDisasterAlerts.length > 0 ? ndvmDisasterAlerts : NDVM_FALLBACK_ALERTS;
  ndvmCurrentTickerIndex = (ndvmCurrentTickerIndex + direction + alerts.length) % alerts.length;
  renderAlertTickerUI();
  if (!fromAuto && !ndvmTickerIsPaused) {
    startTickerTimer();
  }
}

// 3. 지도 상의 레이더 펄스(Pulse) 마커 초기화 & 렌더링
function initAlertsOnMap(map) {
  if (!map || !window.L) return;

  if (ndvmAlertPulseLayer) {
    map.removeLayer(ndvmAlertPulseLayer);
  }
  ndvmAlertPulseLayer = L.layerGroup();
  ndvmAlertMarkersMap = {};

  const alerts = ndvmDisasterAlerts.length > 0 ? ndvmDisasterAlerts : NDVM_FALLBACK_ALERTS;

  alerts.forEach(alert => {
    if (!alert.lat || !alert.lng) return;

    const isEmergency = alert.level === '긴급재난' || alert.level === '위급재난';
    const markerTypeClass = isEmergency ? 'pulse-danger' : 'pulse-warning';

    // 커스텀 레이더 펄스 애니메이션 DOM 아이콘
    const icon = L.divIcon({
      className: 'ndvm-radar-marker-wrap',
      html: `
        <div class="ndvm-radar-pulse ${markerTypeClass}" data-alert-id="${esc(alert.id)}">
          <div class="radar-ring ring-1"></div>
          <div class="radar-ring ring-2"></div>
          <div class="radar-dot">
            <span class="radar-icon">${alert.category === '호우' ? '🌧' : alert.category === '산사태' ? '⛰' : alert.category === '지진' ? '⚡' : alert.category === '태풍' ? '🌀' : '⚠️'}</span>
          </div>
          <div class="radar-label">${esc(alert.category)}: ${esc(alert.sigungu || alert.region)}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });

    const marker = L.marker([alert.lat, alert.lng], {
      icon: icon,
      title: `${alert.level}: ${alert.title}`,
      zIndexOffset: 1200
    });

    // 팝업 내용
    const popupHtml = `
      <div class="ndvm-alert-popup ${isEmergency ? 'is-danger' : 'is-warning'}">
        <div class="alert-popup-head">
          <span class="badge ${isEmergency ? 'danger' : 'warning'}">${esc(alert.level)}</span>
          <span class="alert-popup-category">${esc(alert.category)}</span>
          <span class="alert-popup-time">${esc(alert.timestamp)}</span>
        </div>
        <h4 class="alert-popup-title">${esc(alert.title)}</h4>
        <div class="alert-popup-sender">발령: ${esc(alert.sender)}</div>
        <p class="alert-popup-msg">${esc(alert.message)}</p>
        <div class="alert-popup-inst">
          <strong>🚨 행동요령:</strong> ${esc(alert.instruction)}
        </div>
        <div class="alert-popup-actions">
          <button type="button" class="btn-popup-shelter" onclick="searchNearShelter('${esc(alert.sigungu || alert.region)}')">
            🏢 ${esc(alert.sigungu || '해당지역')} 대피시설 찾기
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      maxWidth: 340,
      minWidth: 280,
      className: 'ndvm-radar-popup-custom'
    });

    marker.addTo(ndvmAlertPulseLayer);
    ndvmAlertMarkersMap[alert.id] = marker;
  });

  if (ndvmRadarVisible) {
    ndvmAlertPulseLayer.addTo(map);
  }

  // 배지 카운트 업데이트
  const countBadge = document.getElementById('radar-count-badge');
  if (countBadge) {
    countBadge.textContent = String(alerts.length);
  }
}

// 4. 특정 알림 위치로 지도 시점 이동 및 펄스 강조
function focusDisasterAlert(alertId) {
  const alerts = ndvmDisasterAlerts.length > 0 ? ndvmDisasterAlerts : NDVM_FALLBACK_ALERTS;
  const target = alerts.find(a => a.id === alertId) || alerts[0];
  if (!target) return;

  // 지도가 아닌 다른 화면에 있다면 지도 화면으로 전환
  if (state.page !== 'map') {
    navigate('map');
  }

  const performFly = () => {
    const map = window.ndvmLeafletMap;
    if (!map) return;

    map.flyTo([target.lat, target.lng], 11, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    setTimeout(() => {
      const marker = ndvmAlertMarkersMap[target.id];
      if (marker) {
        marker.openPopup();
      }
    }, 1250);
  };

  // 지도 인스턴스 준비 대기
  if (window.ndvmLeafletMap) {
    performFly();
  } else {
    setTimeout(performFly, 350);
  }
}

// 5. 대피시설 검색으로 즉시 연결
function searchNearShelter(regionName) {
  state.shelterQuery = regionName.replace(/특별시|광역시|특별자치도/g, '').trim();
  navigate('shelter');
}

// 6. 레이더 펄스 오버레이 켜기/끄기 토글
function toggleAlertPulseLayer() {
  ndvmRadarVisible = !ndvmRadarVisible;
  const map = window.ndvmLeafletMap;
  const toggleBtn = document.getElementById('btn-toggle-radar');

  if (map && ndvmAlertPulseLayer) {
    if (ndvmRadarVisible) {
      if (!map.hasLayer(ndvmAlertPulseLayer)) {
        ndvmAlertPulseLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(ndvmAlertPulseLayer)) {
        map.removeLayer(ndvmAlertPulseLayer);
      }
    }
  }

  if (toggleBtn) {
    toggleBtn.classList.toggle('active', ndvmRadarVisible);
    toggleBtn.setAttribute('aria-pressed', String(ndvmRadarVisible));
  }
}

// 7. 긴급재난문자 보관함 모달 (전체보기 & 필터링)
function openDisasterAlertModal() {
  let modalEl = document.getElementById('ndvm-alert-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'ndvm-alert-modal';
    modalEl.className = 'ndvm-modal-backdrop';
    document.body.appendChild(modalEl);
  }

  const alerts = ndvmDisasterAlerts.length > 0 ? ndvmDisasterAlerts : NDVM_FALLBACK_ALERTS;

  const renderModalContent = (filterCategory = '전체') => {
    const filtered = filterCategory === '전체'
      ? alerts
      : alerts.filter(a => a.category.includes(filterCategory));

    const categories = ['전체', '호우', '산사태', '지진', '홍수', '태풍'];

    modalEl.innerHTML = `
      <div class="ndvm-modal-window" role="dialog" aria-labelledby="alert-modal-title" aria-modal="true">
        <header class="ndvm-modal-header">
          <div>
            <span class="eyebrow">REAL-TIME DISASTER BROADCAST</span>
            <h2 id="alert-modal-title">🚨 전국 실시간 긴급재난문자 보관함</h2>
          </div>
          <button type="button" class="modal-close-btn" id="modal-close-x" aria-label="닫기">×</button>
        </header>

        <div class="modal-filter-tabs">
          ${categories.map(cat => `
            <button type="button" class="modal-tab ${filterCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat} ${cat === '전체' ? `(${alerts.length})` : ''}
            </button>
          `).join('')}
        </div>

        <div class="ndvm-modal-body">
          <div class="alert-cards-grid">
            ${filtered.map(item => {
              const isEmer = item.level === '긴급재난' || item.level === '위급재난';
              return `
                <article class="alert-card ${isEmer ? 'danger' : 'warning'}">
                  <div class="alert-card-top">
                    <span class="badge ${isEmer ? 'danger' : 'warning'}">${esc(item.level)}</span>
                    <span class="alert-card-category">${esc(item.category)}</span>
                    <span class="alert-card-time">${esc(item.timestamp)}</span>
                  </div>
                  <h3 class="alert-card-title">${esc(item.title)}</h3>
                  <div class="alert-card-sender">발송처: ${esc(item.sender)} · 대상: ${esc(item.region)}</div>
                  <p class="alert-card-msg">${esc(item.message)}</p>
                  <div class="alert-card-action">
                    <span class="alert-card-inst">💡 ${esc(item.instruction)}</span>
                    <button type="button" class="btn primary btn-fly-map" data-alert-id="${esc(item.id)}">
                      지도에서 보기 →
                    </button>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>

        <footer class="ndvm-modal-footer">
          <span>출처: 행정안전부 국민재난안전포털 재난문자방송 · 실시간 갱신</span>
          <button type="button" class="btn" id="modal-close-foot">닫기</button>
        </footer>
      </div>
    `;

    // 모달 내 이벤트 핸들러
    modalEl.querySelectorAll('.modal-tab').forEach(btn => {
      btn.onclick = () => renderModalContent(btn.dataset.cat);
    });

    modalEl.querySelectorAll('.btn-fly-map').forEach(btn => {
      btn.onclick = () => {
        closeDisasterAlertModal();
        focusDisasterAlert(btn.dataset.alertId);
      };
    });

    const closeBtnX = document.getElementById('modal-close-x');
    if (closeBtnX) closeBtnX.onclick = closeDisasterAlertModal;

    const closeBtnFoot = document.getElementById('modal-close-foot');
    if (closeBtnFoot) closeBtnFoot.onclick = closeDisasterAlertModal;
  };

  renderModalContent('전체');
  modalEl.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeDisasterAlertModal() {
  const modalEl = document.getElementById('ndvm-alert-modal');
  if (modalEl) {
    modalEl.classList.remove('open');
  }
  document.body.classList.remove('modal-open');
}

// 8. 모듈 초기화 (앱 로드시 실행)
async function initNdvmAlertsSystem() {
  await fetchDisasterAlerts();
  renderAlertTickerUI();
  startTickerTimer();
}

// 전역 바인딩
window.initNdvmAlertsSystem = initNdvmAlertsSystem;
window.initAlertsOnMap = initAlertsOnMap;
window.focusDisasterAlert = focusDisasterAlert;
window.toggleAlertPulseLayer = toggleAlertPulseLayer;
window.openDisasterAlertModal = openDisasterAlertModal;
window.closeDisasterAlertModal = closeDisasterAlertModal;
window.searchNearShelter = searchNearShelter;
