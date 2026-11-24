/* NDVM - Statistics Dashboard Module (Regional Risk Rankings, MOIS Annual Damage, CSV Export) */

const MOIS_ANNUAL_DAMAGE = [
  { year: '2014', tot: 180000, heavy_rain: 125000, typhoon: 45000, heavy_snow: 8000, earthquak: 2000, highlight: '부산·경남 집중호우' },
  { year: '2015', tot: 31800, heavy_rain: 22000, typhoon: 8000, heavy_snow: 1500, earthquak: 300, highlight: '가뭄 장기화 및 소규모 국지성 강우' },
  { year: '2016', tot: 288862, heavy_rain: 35887, typhoon: 214965, heavy_snow: 18689, earthquak: 11020, highlight: '태풍 차바 남부 내습 및 경주 지진(M5.8)' },
  { year: '2017', tot: 187302, heavy_rain: 101592, typhoon: 0, heavy_snow: 83, earthquak: 85022, highlight: '청주 290mm 폭우 및 포항 지진(M5.4)' },
  { year: '2018', tot: 141284, heavy_rain: 53800, typhoon: 64200, heavy_snow: 14032, earthquak: 0, highlight: '태풍 콩레이 및 폭염 극한일수' },
  { year: '2019', tot: 216226, heavy_rain: 1651, typhoon: 212778, heavy_snow: 671, earthquak: 0, highlight: '태풍 링링·타파·미탁 3연속 한반도 상륙' },
  { year: '2020', tot: 1318177, heavy_rain: 1095172, typhoon: 222541, heavy_snow: 0, earthquak: 0, highlight: '역대 최장 54일 장마 및 전국 수해 참사' },
  { year: '2021', tot: 66054, heavy_rain: 40646, typhoon: 21086, heavy_snow: 3527, earthquak: 0, highlight: '남부지방 국지성 극한호우' },
  { year: '2022', tot: 592656, heavy_rain: 332560, typhoon: 244046, heavy_snow: 15439, earthquak: 0, highlight: '수도권 115년 만의 기록적 폭우 및 태풍 힌남노' },
  { year: '2023', tot: 958221, heavy_rain: 774578, typhoon: 55777, heavy_snow: 2873, earthquak: 0, highlight: '전국 극한호우(오송 지하차도, 예천 산사태)' }
];

async function ensureDisasterRisks() {
  if (ndvmAllDisasterRisks) return ndvmAllDisasterRisks;
  try {
    const res = await fetch('./data/disaster_risks.json');
    if (res.ok) {
      ndvmAllDisasterRisks = await res.json();
      return ndvmAllDisasterRisks;
    }
  } catch (e) {
    console.warn('disaster_risks.json 로드 실패:', e);
  }
  return null;
}

function getFilteredStatsData() {
  const disaster = (state.statsDisaster === '전체 재해' || !state.statsDisaster) ? '침수·홍수' : state.statsDisaster;
  let allItems = [];
  if (ndvmAllDisasterRisks && Array.isArray(ndvmAllDisasterRisks[disaster])) {
    allItems = ndvmAllDisasterRisks[disaster];
  } else {
    allItems = generateFallbackRisks(disaster);
  }

  const group = state.statsRegionGroup || '전국';
  let filtered = allItems;
  if (group !== '전국') {
    filtered = allItems.filter(item => {
      const sido = (item.region || '').split(' ')[0];
      if (group === '수도권') return ['서울', '경기', '인천'].some(k => sido.startsWith(k));
      if (group === '충청권') return ['대전', '세종', '충청', '충북', '충남'].some(k => sido.startsWith(k));
      if (group === '영남권') return ['부산', '대구', '울산', '경상', '경북', '경남'].some(k => sido.startsWith(k));
      if (group === '호남권') return ['광주', '전라', '전북', '전남'].some(k => sido.startsWith(k));
      if (group === '강원·제주') return ['강원', '제주'].some(k => sido.startsWith(k));
      return true;
    });
  }

  const levels = { '매우 높음': 0, '높음': 0, '보통': 0, '낮음': 0 };
  filtered.forEach(x => {
    if (levels[x.level] !== undefined) levels[x.level]++;
    else levels['보통']++;
  });

  const totalScore = filtered.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const avgScore = filtered.length ? (totalScore / filtered.length).toFixed(1) : '0.0';
  const sorted = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top10 = sorted.slice(0, 10);
  const highest = sorted[0] || { region: '-', score: 0, level: '-' };

  const sidoMap = {};
  filtered.forEach(x => {
    const s = x.region.split(' ')[0];
    if (!sidoMap[s]) sidoMap[s] = { total: 0, count: 0 };
    sidoMap[s].total += Number(x.score || 0);
    sidoMap[s].count++;
  });
  const sidoRanking = Object.entries(sidoMap).map(([sido, data]) => ({
    sido,
    avg: (data.total / data.count).toFixed(1),
    count: data.count
  })).sort((a, b) => Number(b.avg) - Number(a.avg));

  return { filtered, levels, avgScore, highest, top10, sidoRanking, disaster, group };
}

function exportStatsCsv() {
  const { filtered, disaster, group } = getFilteredStatsData();
  let csv = '\uFEFF';
  csv += '순위,시도,시군구,전체지역명,행정구역코드,재해유형,취약도점수,위험등급,과거피해연수,최근피해연도\n';
  const sorted = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
  sorted.forEach((item, idx) => {
    const parts = (item.region || '').split(' ');
    const sido = parts[0] || '';
    const sigungu = parts.slice(1).join(' ') || '';
    csv += `"${idx + 1}","${sido}","${sigungu}","${item.region}","${item.code || ''}","${disaster}","${item.score || 0}","${item.level || '보통'}","${item.damage_years || 0}","${item.latest_positive_damage_year || '-'}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NDVM_재난통계_${disaster}_${group}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function drawSidoChart(canvas, data) {
  if (!canvas || !data || !data.length) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width || 600);
  const rowHeight = 25;
  const height = Math.max(360, data.length * rowHeight + 35);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const left = 95;
  const right = 55;
  const plotW = width - left - right;
  const max = 100;

  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';

  data.forEach((item, i) => {
    const y = 22 + i * rowHeight;
    const score = Number(item.avg);
    const barW = Math.max(4, (score / max) * plotW);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#42585b';
    ctx.font = '12px sans-serif';
    ctx.fillText(item.sido, left - 12, y);

    ctx.fillStyle = '#edf3f2';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(left, y - 6, plotW, 12, 6);
      ctx.fill();
    } else {
      ctx.fillRect(left, y - 6, plotW, 12);
    }

    let color = '#10b981';
    if (score >= 70) color = '#ef4444';
    else if (score >= 55) color = '#f97316';
    else if (score >= 40) color = '#eab308';
    ctx.fillStyle = color;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(left, y - 6, barW, 12, 6);
      ctx.fill();
    } else {
      ctx.fillRect(left, y - 6, barW, 12);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${score.toFixed(1)}점`, left + barW + 8, y);
  });
}

function drawDamageChart(canvas, rows) {
  if (!canvas || !rows || !rows.length) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(340, rect.width || 750);
  const height = 300;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const left = 75;
  const right = 20;
  const top = 25;
  const bottom = 45;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const maxTot = Math.max(...rows.map(r => r.tot / 100));
  const yMax = Math.ceil(maxTot / 2000) * 2000;

  ctx.strokeStyle = '#e6efed';
  ctx.lineWidth = 1;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7d9598';

  for (let i = 0; i <= 4; i++) {
    const y = top + (plotH * i) / 4;
    const val = Math.round(yMax * (1 - i / 4));
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    ctx.fillText(`${val.toLocaleString()}억`, left - 10, y);
  }

  const step = plotW / rows.length;
  const barW = Math.max(14, step * 0.58);

  rows.forEach((r, i) => {
    const val = r.tot / 100;
    const bh = Math.max(3, (val / yMax) * plotH);
    const x = left + i * step + (step - barW) / 2;
    const y = top + plotH - bh;

    let color = '#0284c7';
    if (val >= 10000) color = '#dc2626';
    else if (val >= 5000) color = '#ea580c';
    else if (val < 1000) color = '#10b981';

    ctx.fillStyle = color;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, barW, bh, [4, 4, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, barW, bh);
    }

    ctx.fillStyle = '#526e72';
    ctx.textAlign = 'center';
    ctx.font = '12px sans-serif';
    ctx.fillText(r.year, x + barW / 2, top + plotH + 16);

    if (val >= 1000) {
      ctx.fillStyle = color;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${Math.round(val).toLocaleString()}억`, x + barW / 2, y - 8);
    }
  });
}

async function initNdvmStats() {
  await ensureDisasterRisks();
  const cSido = document.getElementById('stats-sido-chart');
  if (cSido) {
    const { sidoRanking } = getFilteredStatsData();
    drawSidoChart(cSido, sidoRanking);
  }
  const cDamage = document.getElementById('stats-damage-chart');
  if (cDamage) {
    drawDamageChart(cDamage, MOIS_ANNUAL_DAMAGE);
  }
}

function statsPage() {
  state.statsTab = state.statsTab || 'risk';
  state.statsDisaster = state.statsDisaster || '침수·홍수';
  state.statsRegionGroup = state.statsRegionGroup || '전국';

  const { filtered, levels, avgScore, highest, top10, sidoRanking, disaster, group } = getFilteredStatsData();

  const totalFiltered = filtered.length || 1;
  const pCritical = ((levels['매우 높음'] / totalFiltered) * 100).toFixed(1);
  const pWarning = ((levels['높음'] / totalFiltered) * 100).toFixed(1);
  const pModerate = ((levels['보통'] / totalFiltered) * 100).toFixed(1);
  const pLow = ((levels['낮음'] / totalFiltered) * 100).toFixed(1);

  // Tab 1: Risk Analysis
  const riskTabHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:20px;">
      <div class="stat-box panel">
        <small>분석 대상 지자체</small>
        <strong>${filtered.length}개 시·군·구</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#859da0">${esc(group)} (${esc(disaster)})</p>
      </div>
      <div class="stat-box panel">
        <small>평균 취약도 지수</small>
        <strong>${avgScore}점</strong>
        <p style="margin:4px 0 0;font-size:11px;color:${Number(avgScore)>=60?'#ea580c':'#059669'}">
          ${Number(avgScore)>=60 ? '⚠️ 집중 관리 권역' : '✅ 안정 관리 권역'}
        </p>
      </div>
      <div class="stat-box panel">
        <small>최고 취약 지자체</small>
        <strong style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(highest.region)}">${esc(highest.region)}</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#dc2626;font-weight:700">${highest.score}점 (${esc(highest.level)})</p>
      </div>
      <div class="stat-box panel">
        <small>고위험 (심각·경계) 비율</small>
        <strong>${levels['매우 높음'] + levels['높음']}개소</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#ea580c">전체의 ${(Number(pCritical)+Number(pWarning)).toFixed(0)}% 차지</p>
      </div>
    </div>

    <!-- 위험 등급 분포 프로그레스 바 -->
    <div class="panel" style="padding:18px 22px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:13px;font-weight:700;color:#355359;">취약 등급별 지자체 분포</span>
        <span style="font-size:11px;color:#7d9699;">전체 ${filtered.length}개소 중 비중</span>
      </div>
      <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:#eef3f2;margin-bottom:12px;">
        <div style="width:${pCritical}%;background:#ef4444;" title="심각: ${levels['매우 높음']}개소 (${pCritical}%)"></div>
        <div style="width:${pWarning}%;background:#f97316;" title="경계: ${levels['높음']}개소 (${pWarning}%)"></div>
        <div style="width:${pModerate}%;background:#eab308;" title="주의: ${levels['보통']}개소 (${pModerate}%)"></div>
        <div style="width:${pLow}%;background:#10b981;" title="관심: ${levels['낮음']}개소 (${pLow}%)"></div>
      </div>
      <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:10px;font-size:12px;">
        <span style="color:#ef4444;font-weight:600">● 심각(매우 높음) ${levels['매우 높음']}개 (${pCritical}%)</span>
        <span style="color:#f97316;font-weight:600">● 경계(높음) ${levels['높음']}개 (${pWarning}%)</span>
        <span style="color:#ca8a04;font-weight:600">● 주의(보통) ${levels['보통']}개 (${pModerate}%)</span>
        <span style="color:#10b981;font-weight:600">● 관심(낮음) ${levels['낮음']}개 (${pLow}%)</span>
      </div>
    </div>

    <!-- 2단 그리드: 시도별 순위 차트 & Top 10 테이블 -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;margin-bottom:20px;">
      <!-- 시도별 평균 위험도 차트 -->
      <section class="panel" style="padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div>
            <span class="little-label">SIDO RISK COMPARISON</span>
            <h3 style="font-size:17px;margin:3px 0 0;">시·도별 평균 위험도 순위</h3>
          </div>
          <span class="pill" style="font-size:10px;padding:3px 8px;">100점 만점 기준</span>
        </div>
        <p style="font-size:12px;color:#71898c;margin:0 0 12px;">관할 시·군·구 점수의 가중평균값 기준 순위입니다.</p>
        <canvas id="stats-sido-chart" style="width:100%;display:block;"></canvas>
      </section>

      <!-- 최고 취약 지역 Top 10 순위 테이블 -->
      <section class="panel" style="padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div>
            <span class="little-label">HIGHEST VULNERABILITY RANKING</span>
            <h3 style="font-size:17px;margin:3px 0 0;">최고 위험 지자체 TOP 10</h3>
          </div>
          <span class="pill" style="background:#ef444415;color:#ef4444;font-size:10px;padding:3px 8px;font-weight:600;">집중 관리 권역</span>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid #dfeae8;color:#607e82;">
                <th style="padding:8px 6px;">순위</th>
                <th style="padding:8px 6px;">지역명</th>
                <th style="padding:8px 6px;">점수</th>
                <th style="padding:8px 6px;">등급</th>
              </tr>
            </thead>
            <tbody>
              ${top10.map((item, idx) => `
                <tr style="border-bottom:1px solid #f0f5f4;">
                  <td style="padding:8px 6px;font-weight:700;color:${idx<3?'#ef4444':'#557579'};">${idx + 1}</td>
                  <td style="padding:8px 6px;font-weight:600;">${esc(item.region)}</td>
                  <td style="padding:8px 6px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <div style="flex:1;height:6px;width:50px;background:#eef3f2;border-radius:3px;overflow:hidden;">
                        <div style="width:${item.score}%;height:100%;background:${item.score>=70?'#ef4444':(item.score>=50?'#f97316':'#10b981')};"></div>
                      </div>
                      <span style="font-size:11px;font-weight:700;">${item.score}</span>
                    </div>
                  </td>
                  <td style="padding:8px 6px;">
                    <span class="pill" style="font-size:10px;padding:2px 6px;background:${item.score>=70?'#ef444415':(item.score>=50?'#f9731615':'#10b98115')};color:${item.score>=70?'#dc2626':(item.score>=50?'#ea580c':'#059669')};font-weight:700;">
                      ${esc(item.level)}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  // Tab 2: Damage History (MOIS)
  const totalMoisDamage = MOIS_ANNUAL_DAMAGE.reduce((acc, c) => acc + c.tot, 0);
  const totalHeavyRain = MOIS_ANNUAL_DAMAGE.reduce((acc, c) => acc + c.heavy_rain, 0);
  const totalTyphoon = MOIS_ANNUAL_DAMAGE.reduce((acc, c) => acc + c.typhoon, 0);

  const damageTabHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:20px;">
      <div class="stat-box panel">
        <small>10개년 누적 총 피해액</small>
        <strong>${(totalMoisDamage / 10000).toFixed(1)}조 원</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#859da0">2014 ~ 2023년 행안부 공식 집계</p>
      </div>
      <div class="stat-box panel">
        <small>최대 피해 연도</small>
        <strong style="color:#dc2626;">2020년 (1.32조 원)</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#dc2626">역대 최장 54일 장마 및 전국 집중호우</p>
      </div>
      <div class="stat-box panel">
        <small>호우(집중강우) 피해 비중</small>
        <strong>${((totalHeavyRain / totalMoisDamage) * 100).toFixed(1)}%</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#0284c7">누적 ${(totalHeavyRain / 10000).toFixed(1)}조 원</p>
      </div>
      <div class="stat-box panel">
        <small>태풍 피해 비중</small>
        <strong>${((totalTyphoon / totalMoisDamage) * 100).toFixed(1)}%</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#0284c7">누적 ${(totalTyphoon / 10000).toFixed(1)}조 원</p>
      </div>
    </div>

    <!-- 연도별 피해액 차트 -->
    <section class="panel" style="padding:24px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <div>
          <span class="little-label">ANNUAL DAMAGE STATISTICS</span>
          <h3 style="font-size:18px;margin:3px 0 0;">연도별 자연재해 피해액 추이 (2014~2023)</h3>
        </div>
        <span class="pill" style="border-color:#0284c7;color:#0284c7;font-weight:600;">행정안전부 공공데이터 연계</span>
      </div>
      <p style="font-size:12px;color:#6d888c;margin:0 0 16px;">
        단위: 억원 (붉은색: 5,000억원 초과 극심 피해 연도). 2020년 최장 장마, 2022년 수도권 집중호우·힌남노, 2023년 극한호우로 피해가 급증했습니다.
      </p>
      <canvas id="stats-damage-chart" style="width:100%;display:block;"></canvas>
    </section>

    <!-- 연도별 상세 테이블 -->
    <section class="panel" style="padding:22px;">
      <h3 style="font-size:17px;margin:0 0 14px;">연도별 주요 재해 사건 및 피해 규모</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid #dfeae8;color:#5a7b7f;background:#f8fbfa;">
              <th style="padding:10px 8px;">연도</th>
              <th style="padding:10px 8px;">총 피해액</th>
              <th style="padding:10px 8px;">호우 피해</th>
              <th style="padding:10px 8px;">태풍 피해</th>
              <th style="padding:10px 8px;">기타(지진/대설)</th>
              <th style="padding:10px 8px;">주요 재난 기록</th>
            </tr>
          </thead>
          <tbody>
            ${MOIS_ANNUAL_DAMAGE.map(r => `
              <tr style="border-bottom:1px solid #f0f5f4;">
                <td style="padding:10px 8px;font-weight:700;">${r.year}년</td>
                <td style="padding:10px 8px;font-weight:700;color:${r.tot>=500000?'#dc2626':'#334155'};">${Math.round(r.tot/100).toLocaleString()}억</td>
                <td style="padding:10px 8px;">${Math.round(r.heavy_rain/100).toLocaleString()}억</td>
                <td style="padding:10px 8px;">${Math.round(r.typhoon/100).toLocaleString()}억</td>
                <td style="padding:10px 8px;">${Math.round((r.earthquak+r.heavy_snow)/100).toLocaleString()}억</td>
                <td style="padding:10px 8px;color:#526f74;">${esc(r.highlight)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  // Tab 3: Shelter Infrastructure
  const shelterTabHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:20px;">
      <div class="stat-box panel">
        <small>연계 대피시설 총계</small>
        <strong>${ALL_SHELTERS.length}개소</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#859da0">전국 17개 광역시·도 대표 거점</p>
      </div>
      <div class="stat-box panel">
        <small>지진 옥외대피장소</small>
        <strong>${ALL_SHELTERS.filter(s=>s.type==='지진옥외대피장소').length}개소</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#0284c7">수용능력 58,000+ 명</p>
      </div>
      <div class="stat-box panel">
        <small>민방위 대피시설</small>
        <strong>${ALL_SHELTERS.filter(s=>s.type==='민방위 대피시설').length}개소</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#059669">지하철역·환승센터 등 28,000+ 명</p>
      </div>
      <div class="stat-box panel">
        <small>무더위 / 한파 쉼터</small>
        <strong>${ALL_SHELTERS.filter(s=>s.type==='무더위쉼터').length}개소</strong>
        <p style="margin:4px 0 0;font-size:11px;color:#d97706">주민센터·복지관 등 밀착형 쉼터</p>
      </div>
    </div>

    <div class="card-grid" style="margin-bottom:20px;">
      <article class="card panel">
        <span class="num">INFRA 01</span>
        <h3>지진옥외대피장소</h3>
        <p>건물 붕괴 위험이 없는 학교 운동장, 광장, 공원 중심 지정. 1인당 최소 3.3㎡ 확보를 권장합니다.</p>
      </article>
      <article class="card panel">
        <span class="num">INFRA 02</span>
        <h3>민방위 대피시설</h3>
        <p>포격 및 공습 위험 시 신속 이동 가능한 지하 2층 이하 지하철 역사, 대형 환승센터 주차장 연계.</p>
      </article>
      <article class="card panel">
        <span class="num">INFRA 03</span>
        <h3>무더위 / 한파 쉼터</h3>
        <p>에너지 취약계층 및 고령자 보호를 위한 냉난방 설비 및 비상 음용수를 상시 구비한 공공시설.</p>
      </article>
    </div>

    <div style="text-align:center;padding:16px;">
      <button type="button" class="btn primary" data-page="shelter">대피시설 검색 및 길찾기 바로가기 →</button>
    </div>
  `;

  return `<div class="page narrow">
    ${head('05 / DATA STATISTICS', '통계 대시보드', '전국 251개 지자체 재난 취약도 분석 지표와 행정안전부 10개년 자연재난 피해 공식 통계를 실시간으로 분석합니다.')}

    <!-- 상단 대시보드 탭 네비게이션 -->
    <div class="chips" role="tablist" style="margin-bottom:18px;">
      <button type="button" class="chip ${state.statsTab==='risk'?'active':''}" data-stats-tab="risk">📊 지자체 취약도 분석</button>
      <button type="button" class="chip ${state.statsTab==='damage'?'active':''}" data-stats-tab="damage">📈 연도별 피해 통계 (행안부)</button>
      <button type="button" class="chip ${state.statsTab==='shelter'?'active':''}" data-stats-tab="shelter">🛡️ 대피시설 인프라 현황</button>
    </div>

    <!-- 필터 바 (취약도 분석 탭일 때 노출) -->
    ${state.statsTab === 'risk' ? `
      <div class="panel" style="padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#506d70;">
            재해 유형:
            <select id="stats-disaster" style="padding:6px 12px;border:1px solid #dfeae8;border-radius:8px;background:#fff;font-size:12px;color:#355359;outline:0;cursor:pointer;">
              ${selectOptions(['전체 재해', ...TYPES], state.statsDisaster)}
            </select>
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#506d70;">
            분석 권역:
            <select id="stats-region-group" style="padding:6px 12px;border:1px solid #dfeae8;border-radius:8px;background:#fff;font-size:12px;color:#355359;outline:0;cursor:pointer;">
              ${selectOptions(['전국', '수도권', '충청권', '영남권', '호남권', '강원·제주'], state.statsRegionGroup)}
            </select>
          </label>
        </div>
        <button type="button" class="btn" id="btn-export-stats-csv" style="padding:6px 14px;font-size:12px;display:inline-flex;align-items:center;gap:6px;">
          📥 통계 데이터 CSV 다운로드
        </button>
      </div>
    ` : ''}

    ${state.statsTab === 'risk' ? riskTabHtml : (state.statsTab === 'damage' ? damageTabHtml : shelterTabHtml)}

    ${note('※ 본 통계 대시보드는 행정안전부 자연재난 연도별 피해 통계(apis.data.go.kr/1741000/NaturalDisasterDamageByYear), 산림청 황폐지 통계(api.odcloud.kr), 기상청 ASOS 관측자료 및 전국 251개 지자체 재난위험 표준 데이터베이스를 종합 집계하여 제공됩니다.')}
  </div>`;
}




// Stats module event delegation
document.addEventListener('click', e => {
  const tabBtn = e.target.closest('[data-stats-tab]');
  if (tabBtn) {
    state.statsTab = tabBtn.getAttribute('data-stats-tab');
    showPage('stats');
    return;
  }
  if (e.target.id === 'btn-export-stats-csv' || e.target.closest('#btn-export-stats-csv')) {
    exportStatsCsv();
    return;
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'stats-disaster') {
    state.statsDisaster = e.target.value;
    showPage('stats');
  }
  if (e.target.id === 'stats-region-group') {
    state.statsRegionGroup = e.target.value;
    showPage('stats');
  }
});

window.addEventListener('resize', () => {
  if (state.page === 'stats') initNdvmStats();
});
