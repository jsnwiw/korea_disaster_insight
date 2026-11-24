/* NDVM 안전동행 확장: 비상용품 관리함 및 수동 오프라인 메시지 릴레이 시연
   네트워크 없는 상황에서 QR/전달코드/파일을 사람이 직접 교환한다.
   BLE 광고, Wi-Fi Direct, 자동 전파, 수신확인, 암호화 기능은 제공하지 않는다. */
'use strict';

const NDVM_STOCK_KEY = 'ndvm_inventory_v1';
const NDVM_RELAY_KEY = 'ndvm_manual_relay_v1';
const NDVM_CATEGORIES = ['물', '식품', '조명·전원', '의약·위생', '방한·보호', '기타'];
const NDVM_SAMPLE_STOCK = [
  {name:'생수', category:'물', unit:'병', qty:4, min:8, expiry:'', memo:'500mL 기준 예시'},
  {name:'즉석밥', category:'식품', unit:'개', qty:5, min:6, expiry:'', memo:''},
  {name:'손전등', category:'조명·전원', unit:'개', qty:1, min:1, expiry:'', memo:''},
  {name:'건전지', category:'조명·전원', unit:'개', qty:2, min:4, expiry:'', memo:''},
  {name:'응급처치 용품', category:'의약·위생', unit:'세트', qty:1, min:1, expiry:'', memo:''}
];
const NDVM_MAX_RELAY_HOPS = 4;
const NDVM_MAX_RELAY_MESSAGES = 90;
let ndvmStock = ndvmLoadArray(NDVM_STOCK_KEY);
let ndvmStockFilter = 'all';
let ndvmRelay = ndvmLoadRelay();
let ndvmSelectedRelayId = '';
let ndvmScannerStream = null;
let ndvmScanning = false;

function ndvmLoadArray(key) {
  try { const r=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(r)?r.slice(0,100):[]; } catch(_){return [];}
}
function ndvmLoadRelay(){
  try {const r=JSON.parse(localStorage.getItem(NDVM_RELAY_KEY)||'null');if(r&&typeof r==='object')return {alias:String(r.alias||'').slice(0,20),group:String(r.group||'').slice(0,24), messages:Array.isArray(r.messages)?r.messages.slice(-NDVM_MAX_RELAY_MESSAGES):[]};}
  catch(_){}
  return {alias:'',group:'',messages:[]};
}
function ndvmStore(key,data){try {localStorage.setItem(key,JSON.stringify(data));return true;}catch(_){return false;}}
function ndvmUUID(){return (typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}_${Math.random().toString(36).slice(2,12)}`;}
function ndvmText(value,max=100){return String(value??'').trim().slice(0,max);}
function ndvmDaysLeft(date){if(!date)return null;const t=new Date(date+'T00:00:00');if(Number.isNaN(t.valueOf()))return null;const today=new Date();today.setHours(0,0,0,0);return Math.round((t-today)/86400000);}
function ndvmNotice(id,text,bad=false){let el=document.getElementById(id);if(el){el.textContent=text;el.classList.toggle('is-error',bad);}}
function extraInventoryPage(){
return `<section id="action-inventory" class="action-panel panel" role="tabpanel" aria-label="비상용품 스마트 관리함" hidden>
  <div class="action-panel-head"><span class="safety-step">04 · EMERGENCY INVENTORY</span><h2>비상용품 스마트 관리함</h2><p>준비해 둔 물품의 수량과 유통기한을 관리하고, 보충이 필요한 물품만 별도로 정리하세요.</p></div>
  <div class="extras-cols"><form id="ndvm-stock-form" class="safety-form extra-form">
    <label>물품 이름 <input name="name" placeholder="예: 생수 500mL" maxlength="40" required></label>
    <div class="extras-two"><label>분류<select name="category">${NDVM_CATEGORIES.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label><label>단위<select name="unit"><option>개</option><option>병</option><option>팩</option><option>세트</option><option>상자</option><option>포</option><option>기타</option></select></label></div>
    <div class="extras-two"><label>현재 수량<input name="qty" type="number" min="0" max="9999" step="1" value="1" required></label><label>필요 수량(목표)<input name="min" type="number" min="1" max="9999" step="1" value="3" required></label></div>
    <label>유통기한 또는 점검일 (선택)<input type="date" name="expiry"></label>
    <label>메모 (선택)<input name="memo" maxlength="70" placeholder="예: 서랍 두 번째 칸"></label>
    <button class="btn primary" type="submit">물품 등록하기</button>
    <button class="btn extra-subtle" type="button" id="ndvm-stock-sample">시연용 물품 5개 넣기</button>
    <p class="safety-hint">목표 수량은 가구별로 직접 설정하는 값이며, 자동 계산한 공식 비상물품 기준이 아닙니다. 기록은 사용 중인 기기에만 저장됩니다.</p>
  </form><div class="extra-dashboard" aria-live="polite"><div id="ndvm-stock-summary"></div><div id="ndvm-stock-shortlist"></div></div></div>
  <div class="extras-list-heading"><h3>등록한 물품</h3><div class="extras-actions"><button type="button" class="btn" id="ndvm-stock-export">부족한 물품 목록 저장</button><button type="button" class="btn extra-subtle" id="ndvm-stock-csv">전체 목록 CSV</button></div></div>
  <div class="extras-filters" role="group" aria-label="물품 필터"><button type="button" class="extra-filter selected" data-stock-filter="all">전체</button><button type="button" class="extra-filter" data-stock-filter="needs">보충 필요</button><button type="button" class="extra-filter" data-stock-filter="expiry">기한 임박·경과</button></div>
  <div id="ndvm-stock-list" aria-live="polite"></div><p id="ndvm-stock-notice" class="extra-notice" role="status"></p>
  <p class="safety-footnote">※ 유통기한은 입력된 날짜만 비교합니다. 사용 가능 여부와 안전성은 실제 제품 표시·보관 상태를 확인해야 합니다. 자동 푸시 알림은 지원하지 않습니다.</p>
</section>`;
}
function extraRelayPage(){
 return `<section id="action-relay" class="action-panel panel" role="tabpanel" aria-label="안심 그룹 오프라인 메시지 릴레이" hidden>
 <div class="action-panel-head"><span class="safety-step">05 · OFFLINE RELAY LAB</span><h2>안심 그룹 · 오프라인 메시지 릴레이</h2><p>인터넷이 없어도 메시지를 기기에 보관한 뒤, 사람과 사람 사이에서 QR 또는 전달 코드를 직접 교환하는 방식으로 이어 전달할 수 있습니다.</p></div>
 <div class="extra-warning"><strong>중요: 실제 자동 통신망이 아닙니다.</strong> 일반 웹페이지에서는 스마트폰끼리 BLE·Wi-Fi Direct로 메시지를 자동 중계할 수 없습니다. 이 기능은 <b>직접 보여주기/복사/파일 공유 → 다른 기기에서 가져오기 → 다시 전달하기</b>를 실습하는 교육용 시제품입니다. 도달·안전·수신 여부를 보장하지 않으며 긴급 상황에서는 119·112 등 공식 구조 수단을 우선 이용하세요.</div>
 <div class="extras-cols">
  <div><form id="ndvm-relay-settings" class="safety-form extra-form">
   <h3>① 안심 그룹 설정</h3>
   <label>그룹 이름 또는 공유 코드<input name="group" maxlength="24" placeholder="예: 우리동네A" required></label>
   <label>그룹 안에서 사용할 별칭<input name="alias" maxlength="20" placeholder="예: 하늘" required></label>
   <button type="submit" class="btn primary">그룹 설정 저장</button><p class="safety-hint">같은 그룹 코드를 쓰는 기기끼리 전달할 수 있습니다. 그룹 코드는 암호가 아니며, 신원 확인이나 메시지 암호화 기능은 없습니다.</p>
  </form><form id="ndvm-relay-compose" class="safety-form extra-form extra-spaced">
  <h3>② 안부 메시지 작성</h3>
  <label>상태<select name="status"><option>안전함</option><option>이동 중</option><option>도움 필요</option><option>연락 요청</option></select></label>
  <label>대략적인 위치 (선택)<input name="area" maxlength="40" placeholder="예: ○○구 ○○동 / 정확한 주소 제외"></label>
  <label>전달 내용<input name="text" maxlength="80" placeholder="예: 학교 운동장으로 이동 중입니다." required></label>
  <button type="submit" class="btn primary">기기에 메시지 저장</button>
  </form></div>
  <div class="extra-relay-panel"><h3>③ 메시지 전달·가져오기</h3><p class="safety-hint">전달할 메시지를 선택하면 QR 코드와 전달 코드가 만들어집니다. 상대방은 그것을 자신의 기기에 가져와 다시 다음 사람에게 전달할 수 있습니다.</p>
  <div id="ndvm-relay-qr" class="relay-qrbox"><div class="relay-empty">먼저 그룹을 설정하고 메시지를 작성해 주세요.</div></div>
  <div class="extra-actions"><button type="button" class="btn" id="ndvm-relay-copy">전달 코드 복사</button><button type="button" class="btn extra-subtle" id="ndvm-relay-file">전달 파일 저장</button></div>
  <label class="extra-label" for="ndvm-relay-paste">상대방의 전달 코드 붙여넣기</label>
  <textarea id="ndvm-relay-paste" rows="4" placeholder="NDVM1. 으로 시작하는 코드를 붙여넣으세요" spellcheck="false"></textarea>
  <div class="extra-actions"><button type="button" class="btn primary" id="ndvm-relay-import">전달 코드 가져오기</button><label class="btn extra-file-btn">전달 파일 열기 <input type="file" id="ndvm-relay-upload" accept=".txt,.json,text/plain,application/json" hidden></label></div>
  <button type="button" class="btn extra-subtle" id="ndvm-relay-scan">카메라로 QR 읽기 (지원 기기)</button>
  <div id="ndvm-relay-camera" class="relay-camera" hidden><video id="ndvm-relay-video" autoplay playsinline muted></video><button type="button" class="btn" id="ndvm-relay-stop">카메라 종료</button></div>
  <p id="ndvm-relay-notice" class="extra-notice" role="status"></p></div>
 </div>
 <div class="extras-list-heading"><h3>내 기기에 보관된 그룹 메시지</h3><div class="extras-actions"><button type="button" class="btn extra-subtle" id="ndvm-relay-export-all">그룹 메시지 묶음 저장</button><button type="button" class="btn extra-subtle" id="ndvm-relay-clear">메시지 전체 삭제</button></div></div>
 <div class="relay-group-status" id="ndvm-relay-group-status"></div><div id="ndvm-relay-list" aria-live="polite"></div>
 <p class="safety-footnote">※ 인터넷을 끊기 전 페이지를 한 번 열어 오프라인 캐시를 준비하세요(HTTPS 또는 localhost에서 지원). QR 공유는 사람이 직접 기기를 마주 보고 교환해야 하며, 주변 스마트폰으로 자동 전파되지 않습니다. 타인의 위치나 상태는 검증되지 않은 입력 정보입니다.</p>
 </section>`;
}
function initSafetyExtras(){
  const settings=document.getElementById('ndvm-relay-settings');
  if(settings){settings.elements.group.value=ndvmRelay.group;settings.elements.alias.value=ndvmRelay.alias;}
  renderNdvmStock();renderNdvmRelay();
}
function ndvmStockState(item){
  const days=ndvmDaysLeft(item.expiry);
  return {short:Number(item.qty)<Number(item.min),expired:days!==null&&days<0,soon:days!==null&&days>=0&&days<=30,days};
}
function renderNdvmStock(){
 const summary=document.getElementById('ndvm-stock-summary'), out=document.getElementById('ndvm-stock-list'), short=document.getElementById('ndvm-stock-shortlist');if(!out)return;
 ndvmStock=ndvmStock.filter(x=>x&&typeof x==='object'&&x.id).slice(0,100);
 const shortage=ndvmStock.filter(x=>ndvmStockState(x).short), expiry=ndvmStock.filter(x=>{const s=ndvmStockState(x);return s.expired||s.soon;});
 summary.innerHTML=`<div class="extra-summary-grid"><div><strong>${ndvmStock.length}</strong><span>등록 물품</span></div><div><strong>${shortage.length}</strong><span>보충 필요</span></div><div><strong>${expiry.length}</strong><span>기한 확인</span></div></div>`;
 short.innerHTML=`<div class="extra-shortage"><h3>나의 준비 목록</h3>${shortage.length?`<ul>${shortage.slice(0,8).map(i=>`<li><b>${esc(i.name)}</b> · ${Math.max(0,i.min-i.qty)}${esc(i.unit)} 보충</li>`).join('')}</ul>`:'<p>현재 설정한 목표보다 부족한 물품이 없습니다.</p>'}${expiry.length?`<p class="extra-expire-tip">기한 확인 필요: ${expiry.map(i=>esc(i.name)).join(', ')}</p>`:''}</div>`;
 const filter=ndvmStock.filter(i=>{const s=ndvmStockState(i);return ndvmStockFilter==='all'||(ndvmStockFilter==='needs'&&s.short)||(ndvmStockFilter==='expiry'&&(s.expired||s.soon));});
 out.innerHTML=filter.length?filter.map(i=>{const s=ndvmStockState(i);let alert=s.expired?'<em class="extra-tag danger">기한 경과</em>':s.soon?'<em class="extra-tag caution">기한 임박</em>':'';if(s.short)alert+='<em class="extra-tag caution">보충 필요</em>';
 return `<article class="extra-stock-card"><div class="extra-stock-main"><strong>${esc(i.name)}</strong><small>${esc(i.category)} · ${esc(i.memo||'보관 위치 미입력')}</small><div class="extra-tags">${alert||'<em class="extra-tag normal">설정한 목표 충족</em>'}</div><small>목표 ${i.min}${esc(i.unit)} · ${i.expiry?'점검일 '+esc(i.expiry):'기한 미설정'}</small></div><div class="extra-stock-qty"><button type="button" data-stock-step="-1" data-stock-id="${esc(i.id)}" aria-label="${esc(i.name)} 수량 감소">−</button><span><b>${i.qty}</b>${esc(i.unit)}</span><button type="button" data-stock-step="1" data-stock-id="${esc(i.id)}" aria-label="${esc(i.name)} 수량 증가">+</button></div><button type="button" class="extra-remove" data-stock-remove="${esc(i.id)}">삭제</button></article>`;}).join(''):'<div class="relay-empty">표시할 물품이 없습니다. 왼쪽에서 물품을 등록해 주세요.</div>';
 document.querySelectorAll('[data-stock-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.stockFilter===ndvmStockFilter));
}
function ndvmSaveStock(){const ok=ndvmStore(NDVM_STOCK_KEY,ndvmStock);renderNdvmStock();ndvmNotice('ndvm-stock-notice',ok?'현재 기기에 저장했습니다.':'브라우저 저장이 차단되어 있습니다. CSV로 백업해 주세요.',!ok);}
function ndvmStockExport(needsOnly){
 const rows=needsOnly?ndvmStock.filter(i=>ndvmStockState(i).short):ndvmStock;
 if(needsOnly){const txt=['NDVM 비상용품 보충 목록','작성일: '+new Date().toLocaleDateString('ko-KR'),''];rows.forEach(i=>txt.push(`□ ${i.name}: ${i.min-i.qty}${i.unit} 더 준비 (현재 ${i.qty}${i.unit}/목표 ${i.min}${i.unit})`));if(!rows.length)txt.push('보충이 필요한 물품 없음');safetyDownload('NDVM_비상용품_보충목록.txt',txt.join('\n'),'text/plain;charset=utf-8');return;}
 const vals=[['이름','분류','현재수량','목표수량','단위','점검일','메모'],...rows.map(i=>[i.name,i.category,i.qty,i.min,i.unit,i.expiry||'',i.memo||''])];
 const csv='\uFEFF'+vals.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');safetyDownload('NDVM_비상용품_전체목록.csv',csv,'text/csv;charset=utf-8');
}
function ndvmRelayValidMessage(m){return m&&typeof m.id==='string'&&m.id.length<=90&&typeof m.sender==='string'&&m.sender.length<=20&&typeof m.status==='string'&&['안전함','이동 중','도움 필요','연락 요청'].includes(m.status)&&typeof m.text==='string'&&m.text.length<=80&&typeof m.area==='string'&&m.area.length<=40&&Number.isInteger(m.hops)&&m.hops>=0&&m.hops<=NDVM_MAX_RELAY_HOPS&&Number.isFinite(m.time)&&m.time>0&&m.time<Date.now()+3600000;}
function ndvmEncodePacket(messages){
 const obj={v:1,g:ndvmRelay.group,m:messages.map(m=>({...m,hops:Math.min(NDVM_MAX_RELAY_HOPS,m.hops+1)}))};
 const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary='';bytes.forEach(x=>binary+=String.fromCharCode(x));return 'NDVM1.'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function ndvmDecodePacket(value){
 const code=String(value||'').trim().replace(/\s/g,'');if(!code.startsWith('NDVM1.')||code.length>20000)throw Error('NDVM 전달 코드 형식이 아닙니다.');let str=code.slice(6).replace(/-/g,'+').replace(/_/g,'/');str+='='.repeat((4-str.length%4)%4);
 const raw=atob(str);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const obj=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(obj.v!==1||typeof obj.g!=='string'||obj.g.length>24||!Array.isArray(obj.m)||obj.m.length>25||!obj.m.every(ndvmRelayValidMessage))throw Error('메시지 구조가 올바르지 않습니다.');return obj;
}
function ndvmRelaySave(){const ok=ndvmStore(NDVM_RELAY_KEY,ndvmRelay);renderNdvmRelay();return ok;}
function ndvmRelaySelected(){return ndvmRelay.messages.find(x=>x.id===ndvmSelectedRelayId)||ndvmRelay.messages[ndvmRelay.messages.length-1];}
function ndvmQrRender(){const el=document.getElementById('ndvm-relay-qr');if(!el)return;el.textContent='';let message=ndvmRelaySelected();if(!ndvmRelay.group||!message){el.innerHTML='<div class="relay-empty">그룹을 설정하고 메시지를 작성하거나 가져오세요.</div>';return;}if(message.hops>=NDVM_MAX_RELAY_HOPS){el.innerHTML='<div class="relay-empty">이 메시지는 시연용 최대 전달 횟수에 도달했습니다.</div>';return;}
 try {
  const code=ndvmEncodePacket([message]);const qr=new NDVMQRCode(0,NDVMQRErrorLevel.L);qr.addData(code);qr.make();const n=qr.getModuleCount(),c=document.createElement('canvas');let cell=Math.max(2,Math.floor(288/(n+8)));c.width=c.height=cell*(n+8);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#193e47';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))ctx.fillRect((x+4)*cell,(y+4)*cell,cell,cell);c.setAttribute('aria-label','선택한 안부 메시지 QR 코드');el.appendChild(c);let info=document.createElement('p');info.className='safety-hint';info.textContent='선택한 메시지 1건 · 직접 대면하여 스캔하거나 전달 코드를 공유하세요.';el.appendChild(info);
 } catch(e){el.innerHTML='<div class="relay-empty">QR 생성 길이 제한입니다. 전달 코드 복사 또는 파일 저장을 이용하세요.</div>'}
}
function renderNdvmRelay(){
 const form=document.getElementById('ndvm-relay-settings');if(!form)return;
 const grp=document.getElementById('ndvm-relay-group-status');grp.textContent=ndvmRelay.group?`현재 그룹: ${ndvmRelay.group} · 별칭: ${ndvmRelay.alias||'미설정'} · 저장 메시지 ${ndvmRelay.messages.length}건`:'그룹을 먼저 설정해야 안부 메시지를 만들거나 전달할 수 있습니다.';
 const out=document.getElementById('ndvm-relay-list');out.innerHTML=ndvmRelay.messages.length? [...ndvmRelay.messages].reverse().map(m=>`<article class="relay-msg ${ndvmSelectedRelayId===m.id?'selected':''}"><div><strong>${esc(m.status)}</strong> <span>${esc(m.sender)} · ${esc(new Date(m.time).toLocaleString('ko-KR'))}</span><p>${esc(m.text)}</p><small>${m.area?`대략적인 위치: ${esc(m.area)} · `:''}전달 단계: ${m.hops}/${NDVM_MAX_RELAY_HOPS} · ${m.hops>=NDVM_MAX_RELAY_HOPS?'더 이상 전달 불가':'수동 전달 가능'}</small></div><button type="button" class="btn" data-relay-select="${esc(m.id)}" ${m.hops>=NDVM_MAX_RELAY_HOPS?'disabled':''}>QR 선택</button></article>`).join(''):'<div class="relay-empty">아직 그룹 메시지가 없습니다. 메시지를 작성하거나 다른 기기에서 가져오세요.</div>';
 ndvmQrRender();
}
function ndvmRelayImport(raw){
 if(!ndvmRelay.group)throw Error('먼저 그룹 코드를 저장해 주세요.');
 const pack=ndvmDecodePacket(raw);if(pack.g!==ndvmRelay.group)throw Error('다른 그룹의 메시지입니다. 그룹 코드를 확인해 주세요.');
 let added=0;for(const m of pack.m){if(!ndvmRelay.messages.some(old=>old.id===m.id)){ndvmRelay.messages.push(m);added++;}}
 ndvmRelay.messages=ndvmRelay.messages.slice(-NDVM_MAX_RELAY_MESSAGES);ndvmRelaySave();return added;
}
function ndvmRelayCode(){const m=ndvmRelaySelected();if(!m)throw Error('전달할 메시지가 없습니다.');if(m.hops>=NDVM_MAX_RELAY_HOPS)throw Error('시연용 최대 전달 횟수를 초과했습니다.');return ndvmEncodePacket([m]);}
async function ndvmQrScan(){
 const holder=document.getElementById('ndvm-relay-camera'),video=document.getElementById('ndvm-relay-video');if(!holder||!video)return;
 if(!('BarcodeDetector' in window)){ndvmNotice('ndvm-relay-notice','이 브라우저는 QR 카메라 인식을 지원하지 않습니다. 전달 코드 붙여넣기를 사용해 주세요.',true);return;}
 if(!navigator.mediaDevices?.getUserMedia){ndvmNotice('ndvm-relay-notice','카메라를 사용하려면 HTTPS 또는 localhost가 필요합니다.',true);return;}
 try{
 const support=await BarcodeDetector.getSupportedFormats();if(!support.includes('qr_code'))throw Error('QR 인식을 지원하지 않습니다.');
 ndvmScannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});video.srcObject=ndvmScannerStream;holder.hidden=false;await video.play();ndvmScanning=true;ndvmNotice('ndvm-relay-notice','QR을 카메라 중앙에 비춰 주세요.');const detector=new BarcodeDetector({formats:['qr_code']});
 const tick=async()=>{if(!ndvmScanning||!video.isConnected)return;try{const found=await detector.detect(video);if(found.length){const text=found[0].rawValue;document.getElementById('ndvm-relay-paste').value=text;ndvmStopScanner();ndvmNotice('ndvm-relay-notice','QR을 읽었습니다. [전달 코드 가져오기]를 누르세요.');return;}}catch(_){}if(ndvmScanning)setTimeout(tick,300);};tick();
 }catch(e){ndvmStopScanner();ndvmNotice('ndvm-relay-notice','카메라를 열지 못했습니다. 권한/보안 연결을 확인하거나 코드 붙여넣기를 사용해 주세요.',true);}
}
function ndvmStopScanner(){ndvmScanning=false;if(ndvmScannerStream){ndvmScannerStream.getTracks().forEach(t=>t.stop());ndvmScannerStream=null;}const holder=document.getElementById('ndvm-relay-camera');if(holder)holder.hidden=true;}

// 액션은 이벤트 위임으로 연결되며 다른 페이지에서도 충돌하지 않도록 ID를 확인한다.
document.addEventListener('submit', e=>{
 const f=e.target;
 if(f.id==='ndvm-stock-form'){
  e.preventDefault();const data=safetyFormData(f);const qty=Number(data.qty),min=Number(data.min);if(!Number.isInteger(qty)||qty<0||qty>9999||!Number.isInteger(min)||min<1||min>9999){ndvmNotice('ndvm-stock-notice','수량은 0~9999, 목표 수량은 1~9999 사이로 입력해 주세요.',true);return;}
  if(ndvmStock.length>=100){ndvmNotice('ndvm-stock-notice','등록 가능한 물품은 최대 100개입니다.',true);return;}
  ndvmStock.push({id:ndvmUUID(),name:ndvmText(data.name,40),category:ndvmText(data.category,20),unit:ndvmText(data.unit,6),qty,min,expiry:ndvmText(data.expiry,10),memo:ndvmText(data.memo,70)});ndvmSaveStock();f.reset();f.elements.qty.value=1;f.elements.min.value=3;
 }
 if(f.id==='ndvm-relay-settings'){
  e.preventDefault();const d=safetyFormData(f),group=ndvmText(d.group,24),alias=ndvmText(d.alias,20);if(!group||!alias){ndvmNotice('ndvm-relay-notice','그룹 코드와 별칭을 모두 입력해 주세요.',true);return;}
  if(ndvmRelay.group&&ndvmRelay.group!==group&&ndvmRelay.messages.length){if(!confirm('그룹을 바꾸면 기존에 보관한 메시지는 삭제됩니다. 계속할까요?'))return;ndvmRelay.messages=[];ndvmSelectedRelayId='';}
  ndvmRelay.group=group;ndvmRelay.alias=alias;ndvmRelaySave();ndvmNotice('ndvm-relay-notice','현재 기기에 그룹 설정을 저장했습니다. 실제 연결이나 가입이 이루어진 것은 아닙니다.');
 }
 if(f.id==='ndvm-relay-compose'){
  e.preventDefault();if(!ndvmRelay.group||!ndvmRelay.alias){ndvmNotice('ndvm-relay-notice','그룹 설정을 먼저 저장해 주세요.',true);return;}
  const d=safetyFormData(f);if(!d.text?.trim())return;
  const m={id:ndvmUUID(),sender:ndvmRelay.alias,status:ndvmText(d.status,10),text:ndvmText(d.text,80),area:ndvmText(d.area,40),time:Date.now(),hops:0};ndvmRelay.messages.push(m);ndvmRelay.messages=ndvmRelay.messages.slice(-NDVM_MAX_RELAY_MESSAGES);ndvmSelectedRelayId=m.id;ndvmRelaySave();f.elements.text.value='';ndvmNotice('ndvm-relay-notice','메시지를 기기에 보관했습니다. 직접 교환해야 다른 기기로 전달됩니다.');
 }
});
document.addEventListener('click', async e=>{
 const btn=e.target.closest('button');if(!btn)return;
 if(btn.id==='ndvm-stock-sample'){if(ndvmStock.length&& !confirm('예시 물품 5개를 추가할까요?'))return;ndvmStock.push(...NDVM_SAMPLE_STOCK.map(x=>({...x,id:ndvmUUID()})));ndvmStock=ndvmStock.slice(-100);ndvmSaveStock();return;}
 if(btn.dataset.stockFilter){ndvmStockFilter=btn.dataset.stockFilter;renderNdvmStock();return;}
 if(btn.dataset.stockStep){const row=ndvmStock.find(x=>x.id===btn.dataset.stockId);if(!row)return;row.qty=Math.max(0,Math.min(9999,Number(row.qty)+Number(btn.dataset.stockStep)));ndvmSaveStock();return;}
 if(btn.dataset.stockRemove){ndvmStock=ndvmStock.filter(x=>x.id!==btn.dataset.stockRemove);ndvmSaveStock();return;}
 if(btn.id==='ndvm-stock-export'){ndvmStockExport(true);return;}
 if(btn.id==='ndvm-stock-csv'){ndvmStockExport(false);return;}
 if(btn.dataset.relaySelect){ndvmSelectedRelayId=btn.dataset.relaySelect;renderNdvmRelay();return;}
 if(btn.id==='ndvm-relay-copy'){try{const ok=await safetyCopy(ndvmRelayCode());ndvmNotice('ndvm-relay-notice',ok?'전달 코드를 복사했습니다. 상대방 기기에서 붙여넣으세요.':'복사할 수 없습니다. 전달 파일 저장을 이용하세요.',!ok);}catch(err){ndvmNotice('ndvm-relay-notice',err.message,true);}return;}
 if(btn.id==='ndvm-relay-file'){try{safetyDownload('NDVM_안부메시지_전달코드.txt',ndvmRelayCode(),'text/plain;charset=utf-8');ndvmNotice('ndvm-relay-notice','전달 파일을 저장했습니다. 파일을 다른 기기에 직접 전달해야 합니다.');}catch(err){ndvmNotice('ndvm-relay-notice',err.message,true);}return;}
 if(btn.id==='ndvm-relay-import'){try{const cnt=ndvmRelayImport(document.getElementById('ndvm-relay-paste').value);ndvmNotice('ndvm-relay-notice',cnt?`${cnt}건을 현재 기기에 저장했습니다. 다음 사용자에게 다시 전달할 수 있습니다.`:'이미 가지고 있는 메시지입니다(중복 제거).');}catch(err){ndvmNotice('ndvm-relay-notice',err.message,true);}return;}
 if(btn.id==='ndvm-relay-export-all'){try{const list=ndvmRelay.messages.filter(m=>m.hops<NDVM_MAX_RELAY_HOPS).slice(-25);if(!list.length)throw Error('전달 가능한 메시지가 없습니다.');const code=ndvmEncodePacket(list);safetyDownload('NDVM_안심그룹_메시지묶음.txt',code,'text/plain;charset=utf-8');ndvmNotice('ndvm-relay-notice',`${list.length}건의 전달 파일을 저장했습니다. 직접 보내야 상대가 받을 수 있습니다.`);}catch(err){ndvmNotice('ndvm-relay-notice',err.message,true);}return;}
 if(btn.id==='ndvm-relay-clear'){if(!confirm('이 기기에 보관된 메시지를 모두 삭제할까요?'))return;ndvmRelay.messages=[];ndvmSelectedRelayId='';ndvmRelaySave();ndvmNotice('ndvm-relay-notice','현재 기기의 메시지를 삭제했습니다. 다른 기기에 전달된 사본은 지워지지 않습니다.');return;}
 if(btn.id==='ndvm-relay-scan'){ndvmQrScan();return;}
 if(btn.id==='ndvm-relay-stop'){ndvmStopScanner();return;}
});
document.addEventListener('change',async e=>{
 if(e.target?.id!=='ndvm-relay-upload')return;
 const file=e.target.files?.[0];if(!file)return;if(file.size>30000){ndvmNotice('ndvm-relay-notice','파일은 최대 30KB까지 읽을 수 있습니다.',true);return;}
 try{const text=await file.text();const count=ndvmRelayImport(text);ndvmNotice('ndvm-relay-notice',`${count}건을 가져왔습니다. 이미 저장된 메시지는 제외합니다.`);}catch(err){ndvmNotice('ndvm-relay-notice',err.message,true);}e.target.value='';
});
window.addEventListener('hashchange',ndvmStopScanner);
