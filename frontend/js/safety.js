/* NDVM 안전동행 - 브라우저 전용 기능 (실제 신고 접수·서버 매칭 아님) */
'use strict';

const SAFETY_CATEGORIES = ['생수', '즉석식품', '담요', '위생용품', '응급용품', '기타'];
const SAFETY_REGIONS = ['서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도'];
const SAFETY_SAMPLES = [
  {id:'sample01',type:'supply',region:'경기도',item:'생수',qty:30,note:'지역 지원 예시',demo:true},
  {id:'sample02',type:'request',region:'경기도',item:'담요',qty:12,note:'임시대피소 예시 요청',demo:true},
  {id:'sample03',type:'supply',region:'서울특별시',item:'담요',qty:15,note:'구호물품 예시',demo:true},
  {id:'sample04',type:'request',region:'서울특별시',item:'즉석식품',qty:20,note:'예시 요청',demo:true},
  {id:'sample05',type:'supply',region:'부산광역시',item:'위생용품',qty:50,note:'예시 물품',demo:true},
  {id:'sample06',type:'request',region:'부산광역시',item:'생수',qty:18,note:'예시 요청',demo:true},
  {id:'sample07',type:'supply',region:'경기도',item:'담요',qty:20,note:'예시 지원',demo:true},
  {id:'sample08',type:'request',region:'경기도',item:'생수',qty:10,note:'예시 요청',demo:true}
];
const SAFETY_STORAGE_KEY = 'ndvm_safety_posts_v1';
let safetyTab = 'report';
let safetyReport = null;
let safetyCard = null;
let safetyPhotoUrl = null;
let safetyPosts = readSafetyPosts();

function readSafetyPosts() {
  try {
    const data = JSON.parse(localStorage.getItem(SAFETY_STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter(p => p && /^local_/.test(p.id) && ['request','supply'].includes(p.type) && SAFETY_REGIONS.includes(p.region) && SAFETY_CATEGORIES.includes(p.item) && Number.isInteger(p.qty) && p.qty > 0 && p.qty <= 10000).slice(-50) : [];
  } catch (_) { return []; }
}
function saveSafetyPosts() {
  try { localStorage.setItem(SAFETY_STORAGE_KEY, JSON.stringify(safetyPosts)); return true; }
  catch (_) { return false; }
}
function safetyOptions(arr) { return arr.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join(''); }
function safeNotice(text, kind = '') {
  const el = document.getElementById('safety-message');
  if (!el) return;
  el.textContent = text;
  el.className = 'safety-message ' + kind;
}
function safetyPage() {
  return `<div class="page safety-page">
    ${head('NDVM / 안전동행', '안전동행', '자연재해를 대비하고, 필요한 행동을 직접 준비할 수 있는 도구입니다.')}
    <div class="safety-intro"><div><strong>정보 확인을 넘어, 직접 준비하는 재난 안전</strong><p>위험요소 신고서 만들기 · 비상 연락 카드 저장 · 구호물자 매칭 체험</p></div><span class="safety-chip">교육용 시제품</span></div>
    <nav class="safety-tabs" aria-label="안전동행 기능" role="tablist">
      <button type="button" role="tab" aria-selected="true" data-action-tab="report">01 <span>위험요소 신고서</span></button>
      <button type="button" role="tab" aria-selected="false" data-action-tab="card">02 <span>비상 연락 카드</span></button>
      <button type="button" role="tab" aria-selected="false" data-action-tab="match">03 <span>구호물자 매칭</span></button>
      <button type="button" role="tab" aria-selected="false" data-action-tab="inventory">04 <span>비상용품 관리함</span></button>
      <button type="button" role="tab" aria-selected="false" data-action-tab="relay">05 <span>안심 그룹 (오프라인 릴레이)</span></button>
    </nav>
    <div id="safety-message" class="safety-message" aria-live="polite"></div>

    <section id="action-report" class="action-panel panel" role="tabpanel" aria-label="위험요소 신고서 만들기">
      <div class="action-panel-head"><span class="safety-step">01 · PREVENTION</span><h2>위험요소 신고서 만들기</h2><p>침수 우려 지역이나 막힌 배수로 등 발견한 위험요소를 기록하고, 제출용 문서를 자동으로 정리하세요.</p></div>
      <div class="safety-columns">
        <form id="safety-report-form" class="safety-form">
          <label>위험요소 종류 (필수)<select name="category" required><option value="">선택해 주세요</option>${safetyOptions(['막힌 배수로', '침수 우려 장소', '파손된 안전시설', '산사태 우려 사면', '낙하·전도 위험', '기타'])}</select></label>
          <label>발견 장소 (필수)<input name="place" maxlength="120" placeholder="예: 경기도 수원시 ○○동 골목" required></label>
          <button type="button" class="safety-map-location" id="safety-use-map-region">지도에서 선택한 지역 입력</button>
          <label>발견 날짜 (필수)<input name="when" type="date" required></label>
          <label>위험 상황 설명 (필수)<textarea name="description" rows="5" maxlength="1000" placeholder="어떤 점이 위험한지, 현재 상황을 구체적으로 적어주세요." required></textarea></label>
          <label>참고 사진 (선택, 이미지 1장)<input name="photo" type="file" accept="image/*" id="safety-report-photo"></label>
          <p class="safety-hint">사진은 이 브라우저에서 미리보기·인쇄에만 이용하며 서버로 전송하지 않습니다. 위험한 장소에 가까이 다가가 촬영하지 마세요.</p>
          <button type="submit" class="btn primary">신고서 자동 작성</button>
        </form>
        <div class="safety-preview" id="report-preview" aria-live="polite"><div class="safety-empty"><span class="safety-empty-icon">▤</span><strong>신고서 미리보기</strong><p>왼쪽 내용을 입력하면 신고서가 자동으로 작성됩니다.</p></div></div>
      </div>
      <p class="safety-footnote">※ 이 페이지는 신고 내용을 작성·저장하는 도구입니다. <b>행정기관으로 자동 접수되지 않으며</b> 실제 민원은 사용자가 관할 기관의 공식 창구에 별도로 제출해야 합니다.</p>
    </section>

    <section id="action-card" class="action-panel panel" role="tabpanel" aria-label="비상 연락 카드 만들기" hidden>
      <div class="action-panel-head"><span class="safety-step">02 · PREPAREDNESS</span><h2>비상 연락 카드 만들기</h2><p>통신이 원활하지 않을 때를 대비해 연락처와 집결 장소를 카드로 저장하거나 인쇄해 두세요.</p></div>
      <div class="safety-columns">
        <form id="safety-card-form" class="safety-form">
          <label>카드에 표시할 이름 (필수)<input name="owner" maxlength="25" placeholder="예: 김하늘" required></label>
          <label>비상 연락처 1 (필수)<input name="phone1" maxlength="30" inputmode="tel" placeholder="예: 010-0000-0000" required></label>
          <label>비상 연락처 2 (선택)<input name="phone2" maxlength="30" inputmode="tel" placeholder="예: 가족 또는 보호자 연락처"></label>
          <label>가족 집결 장소 (필수)<input name="meeting" maxlength="90" placeholder="예: 근처 주민센터 정문" required></label>
          <label>추가 메모 (선택)<textarea name="memo" rows="3" maxlength="150" placeholder="예: 연락되지 않으면 미리 정한 집결 장소에서 만나기"></textarea></label>
          <button type="submit" class="btn primary">비상 카드 만들기</button>
          <p class="safety-hint">입력 정보는 서버에 전송하거나 자동 저장하지 않습니다. 공유용 카드에 민감한 개인정보를 과도하게 적지 마세요.</p>
        </form>
        <div class="safety-preview safety-card-preview" id="card-preview" aria-live="polite"><div class="safety-empty"><span class="safety-empty-icon">▣</span><strong>비상 연락 카드 미리보기</strong><p>입력한 내용으로 저장 가능한 카드 이미지를 만듭니다.</p></div></div>
      </div>
      <p class="safety-footnote">※ 재난 상황에서는 공식 긴급 안내를 따르세요. 저장한 PNG 파일 또는 인쇄한 카드는 인터넷이 끊겨도 열람할 수 있습니다.</p>
    </section>

    <section id="action-match" class="action-panel panel" role="tabpanel" aria-label="구호물자 매칭 체험" hidden>
      <div class="action-panel-head"><span class="safety-step">03 · SOLIDARITY</span><h2>구호물자 요청·지원 매칭</h2><p>물품을 요청하거나 지원 가능한 물품을 등록하면, 지역·품목·수량을 기준으로 맞는 목록을 찾아줍니다.</p></div>
      <div class="safety-demo-notice"><strong>시연 전용 기능</strong> · 예시 데이터와 현재 브라우저에 등록한 목록만 비교합니다. 실제 사용자 간 연결·물품 배송·지원 요청 접수는 이루어지지 않습니다.</div>
      <div class="safety-columns safety-match-layout">
        <form id="safety-match-form" class="safety-form safety-match-form">
          <h3>새 요청 또는 지원 등록</h3>
          <label>등록 유형 <select name="type"><option value="request">물품이 필요해요 (요청)</option><option value="supply">물품을 지원할게요 (지원)</option></select></label>
          <label>지역 (필수)<select name="region" required>${safetyOptions(SAFETY_REGIONS)}</select></label>
          <label>물품 종류 (필수)<select name="item" required>${safetyOptions(SAFETY_CATEGORIES)}</select></label>
          <label>수량 (필수)<input name="qty" type="number" min="1" max="10000" step="1" value="10" required></label>
          <label>간단한 설명 (선택)<input name="note" maxlength="80" placeholder="예: 임시대피소에서 필요한 물품"></label>
          <button type="submit" class="btn primary">등록하고 일치 목록 찾기</button>
          <p class="safety-hint">실명, 전화번호, 상세 주소를 입력하지 마세요. 이 목록은 현재 기기에서만 저장됩니다.</p>
        </form>
        <div class="safety-preview safety-match-results" id="safety-match-results" aria-live="polite"></div>
      </div>
      <div class="safety-list-section"><div class="safety-list-head"><h3>현재 브라우저에 등록한 목록</h3><span class="safety-muted">개별 삭제 가능</span></div><div id="safety-my-list"></div></div>
      <p class="safety-footnote">※ 샘플 데이터는 가상의 물품 요청·지원 사례입니다. 실제 연결을 위해서는 인증, 안전한 연락 기능, 서버 및 개인정보 보호 설계가 추가로 필요합니다.</p>
    </section>
    ${extraInventoryPage()}
    ${extraRelayPage()}
  </div>`;
}

function initSafetyPage() {
  showSafetyTab(safetyTab);
  const date = document.querySelector('#safety-report-form [name="when"]');
  if (date && !date.value) {
    const now = new Date();
    const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
    date.value = `${y}-${m}-${d}`;
  }
  if (safetyReport) renderSafetyReport();
  if (safetyCard) renderSafetyCard();
  renderSafetyMatches();
  initSafetyExtras();
}
function showSafetyTab(tab) {
  safetyTab = ['report','card','match','inventory','relay'].includes(tab) ? tab : 'report';
  document.querySelectorAll('[data-action-tab]').forEach(btn => {
    const active = btn.dataset.actionTab === safetyTab;
    btn.classList.toggle('selected', active);
    btn.setAttribute('aria-selected', String(active));
    btn.tabIndex = active ? 0 : -1;
  });
  ['report','card','match','inventory','relay'].forEach(t => {
    const el = document.getElementById('action-' + t);
    if (el) el.hidden = safetyTab !== t;
  });
  safeNotice('');
}
function safetyFormData(form) {
  const values = new FormData(form);
  return Object.fromEntries(Array.from(values.entries()).filter(([k,v]) => typeof v === 'string').map(([k,v]) => [k,v.trim()]));
}
function safetyDownload(filename, value, mime) {
  const url = URL.createObjectURL(new Blob([value], {type:mime}));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function safetyCopy(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } }
  catch (_) {}
  const field = document.createElement('textarea');
  field.value = text; field.style.position='fixed'; field.style.left='-9999px';
  document.body.appendChild(field); field.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) {}
  field.remove(); return ok;
}
function safetyPrint(markup, title) {
  const sheet = document.getElementById('ndvm-print-sheet');
  if (!sheet) return;
  sheet.innerHTML = `<div class="safety-print-document"><h1>${esc(title)}</h1>${markup}<p class="safety-print-footer">NDVM 안전동행 · 사용자가 직접 작성한 자료이며 공식 접수 문서가 아닙니다.</p></div>`;
  window.print();
}
function safetyReportText() {
  const r = safetyReport;
  if (!r) return '';
  return `[재난 위험요소 신고서 초안]\n위험요소: ${r.category}\n발견 장소: ${r.place}\n발견 날짜: ${r.when}\n\n[상세 내용]\n${r.description}\n\n사진 첨부: ${r.photoName || '없음'}\n\n※ 이 문서는 자동 접수되지 않습니다. 관할 기관에 직접 제출해 주세요.`;
}
function safetyReportMarkup() {
  const r = safetyReport; if (!r) return '';
  return `<div class="safety-report-sheet"><dl><dt>위험요소</dt><dd>${esc(r.category)}</dd><dt>발견 장소</dt><dd>${esc(r.place)}</dd><dt>발견 날짜</dt><dd>${esc(r.when)}</dd><dt>상세 설명</dt><dd class="safety-multiline">${esc(r.description).replace(/\n/g,'<br>')}</dd></dl>${safetyPhotoUrl?`<p><strong>참고 사진</strong></p><img class="safety-report-image" alt="사용자가 선택한 참고 사진" src="${safetyPhotoUrl}">`:`<p class="safety-muted">참고 사진: ${esc(r.photoName || '없음')}</p>`}</div>`;
}
function renderSafetyReport() {
  const box = document.getElementById('report-preview');
  if (!box || !safetyReport) return;
  box.innerHTML = `<h3>작성된 신고서 초안</h3>${safetyReportMarkup()}<div class="safety-buttons"><button type="button" data-safety-action="report-copy" class="btn primary">내용 복사</button><button type="button" data-safety-action="report-save" class="btn">TXT 저장</button><button type="button" data-safety-action="report-print" class="btn">인쇄 · PDF</button></div>`;
}
function safetyCardMarkup() {
  const c = safetyCard; if (!c) return '';
  return `<div class="safety-generated-card"><div class="safety-card-top">NDVM <span>비상 연락 카드</span></div><h3>${esc(c.owner)}</h3><p><b>비상 연락처 1</b><span>${esc(c.phone1)}</span></p><p><b>비상 연락처 2</b><span>${esc(c.phone2 || '미등록')}</span></p><p><b>가족 집결 장소</b><span>${esc(c.meeting)}</span></p>${c.memo?`<p><b>추가 메모</b><span>${esc(c.memo)}</span></p>`:''}<div class="safety-card-bottom">미리 저장하거나 인쇄해 두세요 · 긴급 신고 119 / 112</div></div>`;
}
function renderSafetyCard() {
  const box = document.getElementById('card-preview');
  if (!box || !safetyCard) return;
  box.innerHTML = `${safetyCardMarkup()}<div class="safety-buttons"><button type="button" data-safety-action="card-png" class="btn primary">이미지(PNG) 저장</button><button type="button" data-safety-action="card-print" class="btn">인쇄 · PDF</button></div>`;
}
function drawCardPng() {
  if (!safetyCard) return;
  const c = safetyCard, canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 760;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3f9f7';ctx.fillRect(0,0,1200,760);
  ctx.fillStyle = '#193e47';ctx.fillRect(0,0,1200,122);
  ctx.fillStyle = '#fff';ctx.font='bold 40px "Malgun Gothic",sans-serif';ctx.fillText('NDVM',58,77);
  ctx.font='bold 29px "Malgun Gothic",sans-serif';ctx.fillText('비상 연락 카드',230,77);
  ctx.fillStyle='#193e47';ctx.font='bold 45px "Malgun Gothic",sans-serif';ctx.fillText(c.owner,60,201);
  const lines = [['비상 연락처 1',c.phone1],['비상 연락처 2',c.phone2||'미등록'],['가족 집결 장소',c.meeting],['추가 메모',c.memo||'없음']];
  let y=278;
  lines.forEach(([label,val])=>{
    ctx.fillStyle='#637e82';ctx.font='bold 25px "Malgun Gothic",sans-serif';ctx.fillText(label,60,y);
    ctx.fillStyle='#203b42';ctx.font='28px "Malgun Gothic",sans-serif';
    const words = Array.from(val), maxW=790;let line='',count=0;
    words.forEach(char=>{const test=line+char;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,340,y+(count*37));line=char;count++;}else line=test;});
    if(line)ctx.fillText(line,340,y+(count*37));
    y += Math.max(93, (count+1)*37 + 17);
  });
  ctx.fillStyle='#d2e6e1';ctx.fillRect(0,704,1200,56);
  ctx.fillStyle='#42686c';ctx.font='22px "Malgun Gothic",sans-serif';ctx.fillText('미리 저장하거나 인쇄해 두세요     ·     긴급 신고 119 / 112',58,740);
  canvas.toBlob(blob=>{
    if (!blob) { safeNotice('이미지 저장에 실패했습니다. 인쇄 기능을 이용해 주세요.', 'error');return; }
    safetyDownload('NDVM_비상연락카드.png',blob,'image/png');
    safeNotice('비상 연락 카드 이미지를 저장했습니다.', 'success');
  },'image/png');
}
function postTag(p) { return p.type === 'request' ? '요청' : '지원'; }
function safetyPostsAll() { return [...safetyPosts, ...SAFETY_SAMPLES]; }
function safetyItemMarkup(p, isMine=false) {
  return `<div class="safety-listing"><div class="safety-listing-first"><span class="safety-listing-type ${p.type}">${postTag(p)}</span><strong>${esc(p.item)}</strong><span class="safety-muted">${esc(p.region)}</span>${p.demo?'<span class="safety-demo-label">예시</span>':''}</div><div class="safety-listing-detail"><span>수량 ${p.qty}개</span>${p.note?`<span>${esc(p.note)}</span>`:''}${isMine?`<button type="button" data-safety-remove="${esc(p.id)}" aria-label="이 목록 삭제" class="safety-remove">삭제</button>`:''}</div></div>`;
}
function renderSafetyMatches() {
  const list = document.getElementById('safety-my-list');
  if (list) list.innerHTML = safetyPosts.length ? safetyPosts.slice().reverse().map(p=>safetyItemMarkup(p,true)).join('') : '<p class="safety-muted">등록한 목록이 없습니다. 요청 또는 지원을 추가해 보세요.</p>';
  const out = document.getElementById('safety-match-results');
  if (!out) return;
  if (!safetyPosts.length) {
    out.innerHTML = `<div class="safety-empty"><span class="safety-empty-icon">↔</span><strong>조건에 맞는 물품 찾기</strong><p>요청이나 지원을 등록하면 아래 예시 목록과 자동으로 비교합니다.</p></div><h3>시연용 목록 일부</h3>${SAFETY_SAMPLES.slice(0,4).map(p=>safetyItemMarkup(p)).join('')}`;
    return;
  }
  const latest = safetyPosts[safetyPosts.length-1];
  const matches = safetyPostsAll().filter(p => p.id !== latest.id && p.type !== latest.type && p.region===latest.region && p.item===latest.item).sort((a,b)=>Math.min(latest.qty,b.qty)-Math.min(latest.qty,a.qty));
  out.innerHTML = `<h3>일치 목록 검색 결과</h3><p class="safety-filter-summary">${esc(latest.region)} · ${esc(latest.item)} · ${postTag(latest)} ${latest.qty}개</p>${matches.length ? `<p class="safety-result-count">조건에 맞는 ${matches.length}건을 찾았습니다.</p>${matches.slice(0,8).map(p=>`${safetyItemMarkup(p)}<p class="safety-match-amount">비교 가능한 수량: 최대 ${Math.min(latest.qty,p.qty)}개 · 단순 수량 비교</p>`).join('')}` : `<div class="safety-empty compact"><strong>일치하는 목록이 없습니다.</strong><p>같은 지역과 같은 품목의 반대 유형 등록이 필요합니다.</p></div>`}`;
}

document.addEventListener('click', async e => {
  const tab = e.target.closest('[data-action-tab]');
  if (tab) { showSafetyTab(tab.dataset.actionTab); return; }
  const useMapRegion = e.target.closest('#safety-use-map-region');
  if (useMapRegion) {
    const place = document.querySelector('#safety-report-form [name="place"]');
    if (place) { place.value = state.region || ''; place.focus(); safeNotice('지도에서 선택한 지역명을 입력했습니다. 정확한 장소를 추가로 적어 주세요.','success'); }
    return;
  }
  const remove = e.target.closest('[data-safety-remove]');
  if (remove) { safetyPosts = safetyPosts.filter(p => p.id!==remove.dataset.safetyRemove); saveSafetyPosts(); renderSafetyMatches(); safeNotice('등록한 목록을 삭제했습니다.','success'); return; }
  const copyInquiry = e.target.closest('#home-inquiry-copy');
  if (copyInquiry) {
    const textarea = document.getElementById('home-inquiry');
    const status = document.getElementById('home-inquiry-status');
    if (!textarea || !status) return;
    if (!textarea.value.trim()) { status.textContent='문의 내용을 먼저 입력해 주세요.'; return; }
    const copied = await safetyCopy('[NDVM 문의 및 의견]\n' + textarea.value.trim());
    status.textContent = copied ? '문의 내용을 복사했습니다. 담당자에게 직접 전달해 주세요.' : '복사가 제한되어 있습니다. 입력 내용을 직접 선택해 복사해 주세요.';
    return;
  }
  const btn = e.target.closest('[data-safety-action]');
  if (!btn) return;
  const action = btn.dataset.safetyAction;
  if (action==='report-copy' && safetyReport) safeNotice((await safetyCopy(safetyReportText())) ? '신고서 내용을 복사했습니다.' : '복사에 실패했습니다. TXT 저장 기능을 이용해 주세요.', 'success');
  if (action==='report-save' && safetyReport) { safetyDownload('NDVM_위험요소_신고서.txt',safetyReportText(),'text/plain;charset=utf-8'); safeNotice('신고서 텍스트 파일을 저장했습니다.','success'); }
  if (action==='report-print' && safetyReport) safetyPrint(safetyReportMarkup(),'재난 위험요소 신고서 초안');
  if (action==='card-png' && safetyCard) drawCardPng();
  if (action==='card-print' && safetyCard) safetyPrint(safetyCardMarkup(),'비상 연락 카드');
});
document.addEventListener('keydown', e => {
  const btn=e.target.closest('[data-action-tab]');
  if (!btn || !['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const tabs=['report','card','match','inventory','relay'];
  const current=tabs.indexOf(btn.dataset.actionTab);
  const next=e.key==='Home'?0:e.key==='End'?4:(current+(e.key==='ArrowRight'?1:4))%5;
  showSafetyTab(tabs[next]);
  const target=document.querySelector(`[data-action-tab="${tabs[next]}"]`);
  if(target) target.focus();
});
document.addEventListener('submit', e => {
  const form = e.target;
  if (!form || !['safety-report-form','safety-card-form','safety-match-form'].includes(form.id)) return;
  e.preventDefault();
  const data = safetyFormData(form);
  if (form.id==='safety-report-form') {
    const photo = form.elements.photo.files[0];
    if (photo && (!photo.type.startsWith('image/') || photo.size > 5*1024*1024)) { safeNotice('사진은 5MB 이하의 이미지 파일만 선택해 주세요.','error');return; }
    if (safetyPhotoUrl) URL.revokeObjectURL(safetyPhotoUrl);
    safetyPhotoUrl = photo ? URL.createObjectURL(photo) : null;
    safetyReport = {...data,photoName:photo?photo.name:''};
    renderSafetyReport(); safeNotice('신고서 초안이 작성되었습니다. 내용을 확인한 뒤 저장하세요.','success');
  }
  if (form.id==='safety-card-form') {
    safetyCard = data; renderSafetyCard();safeNotice('비상 연락 카드를 만들었습니다. PNG로 저장하거나 인쇄하세요.','success');
  }
  if (form.id==='safety-match-form') {
    const qty = Number(data.qty);
    if (!Number.isInteger(qty) || qty<1 || qty>10000 || !SAFETY_REGIONS.includes(data.region) || !SAFETY_CATEGORIES.includes(data.item) || !['request','supply'].includes(data.type)) { safeNotice('지역, 품목, 수량을 확인해 주세요.','error');return; }
    safetyPosts.push({id:`local_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, type:data.type, region:data.region, item:data.item, qty, note:(data.note||'').slice(0,80), demo:false});
    safetyPosts = safetyPosts.slice(-50);
    const stored=saveSafetyPosts(); renderSafetyMatches();
    safeNotice(stored?'목록을 현재 기기에 저장하고 매칭 결과를 검색했습니다.':'목록을 등록했지만 브라우저 저장은 제한되어 있습니다.','success');
    form.elements.note.value='';
  }
});
