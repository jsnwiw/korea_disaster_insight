/* NDVM - Application State & Common Helpers */

const state = {
  page: 'home',
  menuOpen: false,
  disaster: '침수·홍수',
  mapDisaster: '침수·홍수',
  region: '서울특별시',
  regionQuery: '',
  shelterQuery: '',
  shelterType: '전체 시설',
  searched: false,
  guideIndex: 0,
  statsPeriod: '연도별',
  statsDisaster: '침수·홍수',
  statsRegionGroup: '전국',
  statsTab: 'risk'
};

const apiBase = () => (window.NDVM_API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');

function esc(input) {
  return String(input ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function head(eyebrow, title, description) {
  return `<div class="page-head"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>`;
}

function note(text) {
  return `<div class="note">${text}</div>`;
}

function selectOptions(values, selected) {
  return values.map(x => `<option value="${esc(x)}" ${x === selected ? 'selected' : ''}>${esc(x)}</option>`).join('');
}

function chips(values, selected, kind) {
  return `<div class="chips" role="group" aria-label="선택 메뉴">${values.map((s, i) => `<button type="button" class="chip ${s === selected ? 'active' : ''}" data-${kind}="${kind === 'guide' ? i : esc(s)}" aria-pressed="${s === selected}">${esc(s)}</button>`).join('')}</div>`;
}


const $ = (s, root = document) => root.querySelector(s);
const escHtml = esc;
