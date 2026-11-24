/* NDVM - Content Pages (Home, Disaster Analysis, Safety Guide, About, Help) */

function homePage() {
  const faq = [
    ['메뉴는 어디에 있나요?', '화면 오른쪽 위의 메뉴 버튼을 누르면 지도, 강수량, 대피시설, 안전동행 등의 기능을 선택할 수 있습니다.'],
    ['취약도 점수는 실시간 위험을 의미하나요?', '아니요. 과거 자료를 바탕으로 계산한 교육용 시범 지표이며 실제 재난 발생 가능성이나 정부의 공식 위험등급이 아닙니다.'],
    ['안전동행에서 만든 문서가 자동으로 제출되나요?', '아니요. 신고서는 직접 복사하거나 저장해 관할 기관의 공식 접수 창구에 제출해야 합니다.'],
    ['구호물자 매칭으로 실제 물품을 주고받을 수 있나요?', '현재는 예시 데이터와 사용 중인 기기에서 등록한 목록끼리 비교하는 시연 기능입니다. 실제 지원 연결은 이루어지지 않습니다.'],
    ['비상용품 관리함은 어떻게 활용하나요?', '물품 이름과 현재 수량, 목표 수량, 유통기한 또는 점검일을 등록하면 보충할 목록을 따로 내보낼 수 있습니다. 기록은 사용 중인 기기에 저장됩니다.'],
    ['안심 그룹으로 인터넷 없이 자동 메시지를 보낼 수 있나요?', '현재 웹 버전은 자동 블루투스 전파가 아닙니다. 미리 사이트를 열어 두고 QR·전달 코드·파일을 사람 사이에 직접 교환하는 오프라인 릴레이 시연입니다. 전달이나 수신을 보장하지 않습니다.'],
    ['인터넷이 없어도 이용할 수 있나요?', '비상용품 관리함과 안심 그룹은 브라우저에 저장된 데이터를 사용합니다. 사이트의 오프라인 캐시는 인터넷 연결 중 한 번 열고 준비해야 하며, HTTPS 또는 localhost에서 지원됩니다. 지도 배경과 공공데이터 조회는 인터넷이나 별도 서버가 필요할 수 있습니다.']
  ];
  return `<div class="home">
    <section class="hero"><span class="hero-tag">NATURAL DISASTER VULNERABILITY MAP</span>
      <h1>재난을 이해하고,<br><em>안전을 준비하다.</em></h1>
      <p>우리 지역의 자연재해 정보를 더 쉽고 명확하게.<br>위험을 살펴보고, 필요한 안전 도구도 직접 이용하세요.</p>
      <div class="hero-buttons">
        <button type="button" data-page="map" class="btn primary">취약도 지도 보기 <span aria-hidden="true">→</span></button>
        <button type="button" data-page="action" class="btn">안전동행 바로가기 <span aria-hidden="true">›</span></button>
      </div>
    </section>
    <div class="home-bottom">
      <span>정보는 단순하게, 필요한 기능은 메뉴에서.</span>
      <button type="button" class="text-link" data-page="map">재해 분석 & 취약도 지도 살펴보기 →</button>
    </div>
    <section class="home-help" id="home-help" aria-labelledby="home-help-heading">
      <div class="home-help-intro"><span class="eyebrow">HELP & CONTACT</span><h2 id="home-help-heading">이용 안내 및 문의</h2><p>자주 묻는 질문을 확인하거나 문의할 내용을 정리할 수 있습니다.</p></div>
      <div class="home-help-grid">
        <div class="home-help-faq"><h3>자주 묻는 질문</h3>
          ${faq.map(([q,a]) => `<details class="home-help-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
        </div>
        <div class="home-help-contact"><h3>문의 내용 작성</h3><p>궁금한 점이나 의견을 적으면 문의 내용을 복사할 수 있습니다.</p>
          <label for="home-inquiry">문의 내용</label>
          <textarea id="home-inquiry" rows="6" maxlength="1000" placeholder="문의나 개선 의견을 입력하세요."></textarea>
          <button type="button" id="home-inquiry-copy" class="btn primary">문의 내용 복사</button>
          <p id="home-inquiry-status" role="status" aria-live="polite" class="safety-hint">※ 실제 문의는 학교 프로젝트 담당자에게 별도로 전달해야 합니다. 이 버튼은 메시지를 전송하지 않습니다.</p>
        </div>
      </div>
    </section>
  </div>`;
}

function disasterPage() {
  return mapPage();
}

function guidePage() {
  const [title, ...items] = GUIDES[state.guideIndex];
  return `<div class="page narrow">${head('06 / SAFETY GUIDE', '재난 행동요령', '재난 유형별 대피 원칙과 비상시 행동 요령을 확인하세요.')}
    <div class="chips" role="group" aria-label="재난 유형 선택">${GUIDES.map(([name], i) => `<button type="button" class="chip ${state.guideIndex === i ? 'active' : ''}" data-guide="${i}">${esc(name)}</button>`).join('')}</div>
    <section class="feature panel"><div class="feature-letter" aria-hidden="true">G</div><div><span class="little-label">SAFETY PRINCIPLES</span><h2>${esc(title)} 발생 시 기본 원칙</h2><p>신속한 상황 판단과 침착한 대응이 가장 중요합니다.</p></div></section>
    <h3 class="section-label">단계별 행동요령</h3>
    <div class="card-grid">${items.map((text, i) => `<article class="card panel"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>단계 ${i + 1}</h3><p>${esc(text)}</p></article>`).join('')}</div>
    ${note('※ 본 행동요령은 행정안전부 국민안전포털의 표준 재난대응 지침을 기반으로 작성되었습니다.')}
  </div>`;
}

function aboutPage() {
  return `<div class="page narrow">${head('07 / ABOUT PROJECT', '프로젝트 소개', '자연재해 정보를 쉽게 탐색할 수 있는 데이터 기반 정보 서비스입니다.')}
    <section class="about-hero panel"><span class="big-n" aria-hidden="true">N</span><div><span class="little-label">PROJECT NDVM</span><h2>자연재해 취약지역 지도 대시보드</h2><p>지역별 위험요인과 재난 안전정보를 찾아보기 쉽게 전달하기 위해 기획한 교육용 웹 프로젝트입니다.</p></div></section>
    <div class="card-grid two">
      <article class="card panel"><span class="num">PURPOSE</span><h3>프로젝트 목표</h3><p>자연재해 관련 공공데이터를 사용자가 쉽게 탐색할 수 있도록 구성</p></article>
      <article class="card panel"><span class="num">DESIGN</span><h3>UI/UX 설계 원칙</h3><p>간단한 홈화면, 8개 독립 메뉴, 일관된 화면 구성과 넓은 여백</p></article>
    </div>
    <section class="timeline panel">
      <h2>개발 일정</h2>
      <div class="timeline-row"><b>11월 9일</b><strong>2차 중간점검</strong><span>UI 구조 및 주요 화면 시연</span></div>
      <div class="timeline-row"><b>11월 말</b><strong>최종 발표</strong><span>기능 연동 및 사용성 개선</span></div>
    </section>
    ${note('※ 실제 공공데이터 출처: 행정안전부 재해연보, 기상청 ASOS 관측망, 산림청 산사태정보, 공공데이터포털(data.go.kr, odcloud.kr).')}
  </div>`;
}

function helpPage() {
  const qas = [
    ['다른 페이지는 어떻게 이동하나요?', '오른쪽 상단의 메뉴 버튼을 누르면 8개 화면으로 바로 이동할 수 있습니다.'],
    ['지도에 실제 위험지역이 표시되나요?', '네. 전국 251개 시·군·구 행정구역 경계와 7개 재해 유형별 취약도 등급이 색상으로 표시됩니다.'],
    ['대피시설 위치와 경로도 볼 수 있나요?', '대피시설 조회 메뉴에서 지진옥외대피소, 민방위 대피시설 등을 검색하고 카카오맵 길찾기를 이용할 수 있습니다.'],
    ['인터넷 연결이 없어도 실행되나요?', '네. 컴퓨터에 내장된 데이터와 오프라인 폴백 엔진을 통해 인터넷 없이도 주요 기능이 정상 작동합니다.'],
    ['강수량과 통계 자료는 어디서 가져오나요?', '기상청 일별 관측자료(ASOS)와 행정안전부 연도별 자연재난 피해 통계 공공데이터를 연동합니다.']
  ];
  return `<div class="page narrow">${head('08 / HELP CENTER', '문의 / 도움말', '자연재해 취약지역 지도 서비스 이용 방법과 자주 묻는 질문입니다.')}
    <div class="qa-list">${qas.map(([q, a]) => `<article class="qa panel"><h3>${esc(q)}</h3><p>${esc(a)}</p></article>`).join('')}</div>
    ${note('※ 시스템 이용 관련 문의 및 추가 데이터 연동 제안은 학교 과제 제출처를 통해 접수받고 있습니다.')}
  </div>`;
}

/* =====================================================================
   7-STEP DEMONSTRATION PAGES (시연 전용 순서 페이지)
   ===================================================================== */

// [시연 1단계] NDVM 프로젝트의 목적 설명
function demoPurposePage() {
  return `<div class="page narrow demo-page">
    ${head('시연 1단계 / DEMO STEP 01', 'NDVM 프로젝트의 목적 설명', '기후위기 시대, 공공데이터의 직관적 시각화와 시민이 직접 행동하는 재난 대비 플랫폼')}
    
    <section class="feature panel" style="border-left: 5px solid #0d9488; background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);">
      <div class="feature-letter" style="color: #0d9488;" aria-hidden="true">1</div>
      <div>
        <span class="little-label" style="color:#0d9488; font-weight:700;">PROJECT OBJECTIVE & VISION</span>
        <h2>자연재해를 더 쉽게 이해하고, 안전을 사전에 준비하다</h2>
        <p>NDVM(Natural Disaster Vulnerability Map)은 공공데이터를 융합하여 지역별 위험 요인을 한눈에 파악하고, 시민이 직접 재난에 대비할 수 있는 도구를 제공하는 원스톱 안전 플랫폼입니다.</p>
      </div>
    </section>

    <div class="card-grid" style="margin-top: 1.5rem;">
      <article class="card panel">
        <span class="num" style="color:#dc2626; font-weight:800;">PROBLEM</span>
        <h3>🚨 기존 재난 정보의 한계</h3>
        <p>• <strong>데이터 분산</strong>: 기상청 강수량, 지자체 침수 이력, 행안부 대피소가 각기 다른 포털에 파편화</p>
        <p>• <strong>정적 인구 한계</strong>: 야간 상주인구 기준 분석으로 낮 시간대 강남·여의도 등 인파 밀집지의 실제 위험을 미반영</p>
        <p>• <strong>행동 도구 부재</strong>: 지도를 본 뒤 시민이 즉각 실천할 수 있는 구체적인 대비 수단 부재</p>
      </article>

      <article class="card panel">
        <span class="num" style="color:#0d9488; font-weight:800;">SOLUTION</span>
        <h3>💡 NDVM의 핵심 솔루션</h3>
        <p>• <strong>7대 재해 일체형</strong>: 침수, 산사태, 태풍, 폭염 등 7대 재해와 전국 251개 지자체 경계 지도를 하나로 통합</p>
        <p>• <strong>동적 취약성 분석</strong>: 24시간 시간대별 유동인구를 결합해 출퇴근 인파 과밀 시 위험 급증 시뮬레이션</p>
        <p>• <strong>안전동행 5대 도구</strong>: 위험신고서, 비상연락카드, 구호물자, 비상용품함, 오프라인 P2P 릴레이</p>
      </article>

      <article class="card panel">
        <span class="num" style="color:#2563eb; font-weight:800;">VALUE</span>
        <h3>🎯 지향하는 3대 가치</h3>
        <p>• <strong>예방(Prevention)</strong>: 우리 동네 취약 시설과 대피로를 사전에 1클릭 파악</p>
        <p>• <strong>대응(Response)</strong>: 실시간 재난문자 티커와 지도 위 레이더 펄스 마커 연동</p>
        <p>• <strong>생존(Resilience)</strong>: 통신이 두절되어도 100% 가동되는 PWA 오프라인 캐시 및 QR 릴레이</p>
      </article>
    </div>

    <div class="demo-step-footer" style="margin-top: 2rem; padding: 1.5rem; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>다음 시연 단계</strong>
        <p style="margin:0.2rem 0 0 0; color:#64748b; font-size:0.9rem;">전국 251개 지자체 경계 지도와 우리 동네 재난 정보 원스톱 패널을 탐색합니다.</p>
      </div>
      <button type="button" class="btn primary" onclick="window.goDemoStep(2)" style="font-weight:700; padding:0.75rem 1.5rem;">
        2. 지도에서 지역을 탐색 →
      </button>
    </div>
  </div>`;
}

// [시연 6단계] LocalStorage와 수동 릴레이 설명
function demoRelayPage() {
  return `<div class="page narrow demo-page">
    ${head('시연 6단계 / DEMO STEP 06', 'LocalStorage와 수동 릴레이 설명', '통신망 두절(Blackout) 상황에서도 데이터 유실 없이 브라우저에 저장하고 사람 사이에 전파')}

    <section class="feature panel" style="border-left: 5px solid #2563eb; background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);">
      <div class="feature-letter" style="color: #2563eb;" aria-hidden="true">6</div>
      <div>
        <span class="little-label" style="color:#2563eb; font-weight:700;">OFFLINE SURVIVAL ARCHITECTURE</span>
        <h2>서버 다운과 통신 두절을 가정한 완전 오프라인 데이터 생존 설계</h2>
        <p>인터넷 기지국이 파괴되거나 정전이 발생해도, 사용자의 비상용품 재고와 안부 메시지는 브라우저 로컬 저장소에 영구 보존되며 수동 P2P 릴레이를 통해 전파됩니다.</p>
      </div>
    </section>

    <div class="card-grid two" style="margin-top: 1.5rem;">
      <article class="card panel">
        <span class="num" style="color:#0f172a; font-weight:800;">STORAGE</span>
        <h3>💾 1. 브라우저 LocalStorage 영구 보관 구조</h3>
        <ul style="padding-left:1.2rem; margin:0.8rem 0; line-height:1.7; color:#334155; font-size:0.95rem;">
          <li><strong>서버 독립성</strong>: 외부 중앙 서버가 멈춰도 기기 자체 브라우저에 데이터 영구 저장</li>
          <li><strong>비상용품 관리함</strong>: 물품명, 목표 수량, 현재 수량, 유통기한 데이터 즉시 보존</li>
          <li><strong>신고서 임시저장</strong>: 작성 중인 신고서 내용 및 첨부 현장사진(Base64) 로컬 캐싱</li>
          <li><strong>데이터 내보내기</strong>: TXT 보충목록 저장 및 CSV 엑셀 백업 지원</li>
          <li><strong>개인정보 보호</strong>: 민감한 가족 비상 연락망과 집결지 정보가 외부 서버로 전송되지 않음</li>
        </ul>
      </article>

      <article class="card panel">
        <span class="num" style="color:#0d9488; font-weight:800;">RELAY</span>
        <h3>📶 2. 오프라인 수동 P2P 릴레이 메커니즘</h3>
        <ul style="padding-left:1.2rem; margin:0.8rem 0; line-height:1.7; color:#334155; font-size:0.95rem;">
          <li><strong>내장 순수 JS QR 엔진</strong>: 외부 CDN 접속 없이 기기에서 100% 로컬 QR 코드 생성</li>
          <li><strong>카메라 실시간 스캔</strong>: 단말기 간 화면 QR 코드를 직접 스캔하여 안부 데이터 교환</li>
          <li><strong>전달 코드 / TXT 파일 교환</strong>: 카메라 미지원 시 텍스트 코드 또는 파일 직접 교환</li>
          <li><strong>최대 4단계 홉(Hop) 제어</strong>: 메시지 무한 전파 및 네트워크 과부하 방지 (Hop &le; 4)</li>
          <li><strong>메시지 고유 해시 검증</strong>: 이미 수신한 동일 메시지 중복 처리 차단</li>
        </ul>
      </article>
    </div>

    <!-- 직접 시연해볼 수 있는 안심 릴레이 인터랙티브 영역 -->
    <section class="panel" id="demo-relay-interactive" style="margin-top: 1.5rem; background:#f8fafc; border: 2px dashed #0d9488;">
      <h3 style="color:#0d9488; margin-top:0;">⚡ 안심 그룹 오프라인 릴레이 바로 실습하기</h3>
      <p style="color:#64748b; font-size:0.95rem;">안전동행 메뉴의 [안심 그룹 오프라인 릴레이] 도구로 이동하여 QR 코드 생성과 카메라 스캔을 직접 테스트할 수 있습니다.</p>
      <div style="margin-top:1rem; display:flex; gap:0.8rem; flex-wrap:wrap;">
        <button type="button" class="btn primary" onclick="navigate('action'); setTimeout(() => { const tab = document.querySelector('[data-tool=\"relay\"]'); if (tab) tab.click(); }, 150);">
          📱 안심 릴레이 도구 열기 (QR 생성/스캔)
        </button>
      </div>
    </section>

    <div class="demo-step-footer" style="margin-top: 2rem; padding: 1.5rem; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <button type="button" class="btn" onclick="window.goDemoStep(5)">
        ← 5. 안전동행 도구 소개
      </button>
      <button type="button" class="btn primary" onclick="window.goDemoStep(7)" style="font-weight:700; padding:0.75rem 1.5rem;">
        7. 개발 한계와 향후 개선 방향 →
      </button>
    </div>
  </div>`;
}

// [시연 7단계] 개발 한계와 향후 개선 방향
function demoRoadmapPage() {
  return `<div class="page narrow demo-page">
    ${head('시연 7단계 / DEMO STEP 07', '개발 한계와 향후 개선 방향', '현재 프로토타입 단계의 현실적 제약 사항과 이를 극복하기 위한 단계별 고도화 로드맵')}

    <section class="feature panel" style="border-left: 5px solid #ea580c; background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);">
      <div class="feature-letter" style="color: #ea580c;" aria-hidden="true">7</div>
      <div>
        <span class="little-label" style="color:#ea580c; font-weight:700;">LIMITATIONS & FUTURE ROADMAP</span>
        <h2>솔직한 개발 한계 인식과 차세대 재난 안전 플랫폼으로의 진화 방향</h2>
        <p>본 프로젝트는 공공데이터 활용 가능성과 시민참여형 UI/UX를 검증한 성공적인 프로토타입이며, 향후 실서비스 배포를 위한 명확한 개선 과제를 설정했습니다.</p>
      </div>
    </section>

    <div class="card-grid two" style="margin-top: 1.5rem;">
      <article class="card panel">
        <span class="num" style="color:#dc2626; font-weight:800;">LIMITS</span>
        <h3>⚠️ 현재 개발의 한계점</h3>
        <ul style="padding-left:1.2rem; margin:0.8rem 0; line-height:1.7; color:#334155; font-size:0.95rem;">
          <li><strong>시범 취약도 모델링</strong>: 과거 재해연보 피해 통계 기반의 교육용 지표로, 정부 공식 위험 등급이나 실시간 침수 확률이 아님</li>
          <li><strong>공공 API 의존성</strong>: 기상청 ASOS 인증키 미등록 시 시뮬레이션 데이터로 대체되며, 대피시설 실시간 잔여 수용인원 API 미연계</li>
          <li><strong>수동 릴레이의 대면 한계</strong>: 블루투스 BLE나 무선 자동 전파가 아닌 화면 QR 스캔/파일 교환 방식이므로 대면 조작 필요</li>
          <li><strong>신고서 자동 접수 미지원</strong>: 작성된 신고서가 지자체 재난상황실에 자동 접수되지 않으며 인쇄/파일로 직접 제출해야 함</li>
        </ul>
      </article>

      <article class="card panel">
        <span class="num" style="color:#0d9488; font-weight:800;">ROADMAP</span>
        <h3>🚀 향후 개선 및 고도화 로드맵</h3>
        <ul style="padding-left:1.2rem; margin:0.8rem 0; line-height:1.7; color:#334155; font-size:0.95rem;">
          <li><strong>AI 기반 동적 피난 내비게이션</strong>: 시간대별 침수 수위 상승 예측과 실시간 인파 혼잡도를 반영한 최적 도보 대피 경로 안내</li>
          <li><strong>IoT 지하차도 수위계 센서 실시간 연동</strong>: 저지대 지하차도 침수 센서와 원격 차단기 가동 상태를 지도에 실시간 표출</li>
          <li><strong>지자체 재난상황실 공식 접수 연계</strong>: 신고서 작성기에서 [원클릭 접수] 시 지자체 행정망으로 정형 데이터 자동 전송</li>
          <li><strong>Web Bluetooth / WebRTC 자동 P2P</strong>: 화면을 비추지 않아도 근거리 단말끼리 무선으로 안부 메시지를 자동 교환하는 메쉬 네트워크 구축</li>
        </ul>
      </article>
    </div>

    <div class="demo-step-footer" style="margin-top: 2rem; padding: 1.5rem; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <button type="button" class="btn" onclick="window.goDemoStep(6)">
        ← 6. LocalStorage와 수동 릴레이 설명
      </button>
      <button type="button" class="btn primary" onclick="window.goDemoStep(1)" style="font-weight:700; padding:0.75rem 1.5rem; background:#0f172a;">
        🎬 처음으로 다시 시연하기 ⟲ (1. 목적 설명)
      </button>
    </div>
  </div>`;
}


