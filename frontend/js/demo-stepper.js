/* NDVM - Interactive 7-Step Demonstration Controller */

(() => {
  'use strict';

  const DEMO_STEPS_CONFIG = [
    { step: 1, id: 'demo-1', title: '1. 목적 설명', page: 'demo-1', desc: 'NDVM 프로젝트 기획 배경과 개발 목적' },
    { step: 2, id: 'demo-2', title: '2. 지역 탐색', page: 'demo-2', desc: '전국 251개 지자체 경계 지도 및 우리 동네 재난 정보 원스톱 패널' },
    { step: 3, id: 'demo-3', title: '3. 동적 취약성', page: 'demo-3', desc: '시간대별 실시간 유동인구 결합 24시간 위험도 시뮬레이션' },
    { step: 4, id: 'demo-4', title: '4. 재난 알림', page: 'demo-4', desc: '실시간 긴급재난문자 티커 및 지도 위 2중 레이더 펄스 마커' },
    { step: 5, id: 'demo-5', title: '5. 안전동행', page: 'demo-5', desc: '시민참여형 재난 대비 5대 실천 도구' },
    { step: 6, id: 'demo-6', title: '6. 로컬저장/릴레이', page: 'demo-6', desc: '브라우저 LocalStorage 영구보관 및 오프라인 수동 P2P 릴레이' },
    { step: 7, id: 'demo-7', title: '7. 한계 및 개선방향', page: 'demo-7', desc: '시범 모델링의 현실적 한계와 AI·IoT 연계 고도화 로드맵' }
  ];

  window.ndvmCurrentDemoStep = 1;

  function getStepFromPage(pageId) {
    if (pageId.startsWith('demo-')) {
      const num = parseInt(pageId.replace('demo-', ''), 10);
      if (num >= 1 && num <= 7) return num;
    }
    if (pageId === 'home' || pageId === 'about') return 1;
    if (pageId === 'map' || pageId === 'disaster') return 2;
    if (pageId === 'action') return 5;
    return 1;
  }

  function renderDemoBar() {
    let container = document.getElementById('ndvm-demo-stepper-bar');
    if (!container) {
      container = document.createElement('nav');
      container.id = 'ndvm-demo-stepper-bar';
      container.className = 'ndvm-demo-stepper-bar';
      container.setAttribute('aria-label', '7단계 시연 내비게이션');
      const topbar = document.querySelector('.topbar');
      if (topbar && topbar.parentNode) {
        topbar.parentNode.insertBefore(container, topbar.nextSibling);
      } else {
        document.body.insertBefore(container, document.body.firstChild);
      }
    }

    const cur = window.ndvmCurrentDemoStep || 1;
    const curConf = DEMO_STEPS_CONFIG[cur - 1] || DEMO_STEPS_CONFIG[0];

    container.innerHTML = `
      <div class="demo-bar-inner">
        <div class="demo-badge-wrap">
          <span class="demo-badge">🎬 시연 진행 (${cur}/7)</span>
          <strong class="demo-step-title">${curConf.title}</strong>
          <span class="demo-step-desc">${curConf.desc}</span>
        </div>
        <div class="demo-steps-chips" role="tablist">
          ${DEMO_STEPS_CONFIG.map(s => `
            <button type="button" class="demo-step-chip ${s.step === cur ? 'active' : ''} ${s.step < cur ? 'completed' : ''}" 
                    onclick="window.goDemoStep(${s.step})" 
                    title="${s.desc}"
                    role="tab" 
                    aria-selected="${s.step === cur}">
              <span class="step-num">${s.step}</span>
              <span class="step-label">${s.title.split('. ')[1] || s.title}</span>
            </button>
          `).join('')}
        </div>
        <div class="demo-nav-actions">
          <button type="button" class="btn-demo-nav prev" onclick="window.prevDemoStep()" ${cur === 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} title="이전 시연 단계로 이동">
            ◀ 이전
          </button>
          <button type="button" class="btn-demo-nav next primary" onclick="window.nextDemoStep()" title="다음 시연 단계로 이동">
            ${cur === 7 ? '처음으로 ⟲' : '다음 단계 ▶'}
          </button>
        </div>
      </div>
    `;
  }

  window.goDemoStep = function(stepNum) {
    if (stepNum < 1) stepNum = 1;
    if (stepNum > 7) stepNum = 1;
    window.ndvmCurrentDemoStep = stepNum;
    const targetPage = `demo-${stepNum}`;

    if (typeof navigate === 'function') {
      navigate(targetPage);
    } else {
      location.hash = targetPage;
    }

    renderDemoBar();

    // Trigger step-specific interactive actions
    handleStepInteraction(stepNum);
  };

  window.nextDemoStep = function() {
    let next = (window.ndvmCurrentDemoStep || 1) + 1;
    if (next > 7) next = 1;
    window.goDemoStep(next);
  };

  window.prevDemoStep = function() {
    let prev = (window.ndvmCurrentDemoStep || 1) - 1;
    if (prev < 1) prev = 1;
    window.goDemoStep(prev);
  };

  function handleStepInteraction(stepNum) {
    if (stepNum === 2) {
      // Step 2: 지도 지역 탐색
      setTimeout(() => {
        if (typeof window.ndvmLeafletMap !== 'undefined' && window.ndvmLeafletMap) {
          window.ndvmLeafletMap.invalidateSize();
        }
        const panel = document.getElementById('ndvm-neighborhood-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
    } else if (stepNum === 3) {
      // Step 3: 동적 취약성
      setTimeout(() => {
        if (!window.ndvmDynamicActive && typeof toggleDynamicVulnerability === 'function') {
          toggleDynamicVulnerability();
        }
        const dynBar = document.getElementById('ndvm-dynamic-timeline-bar');
        if (dynBar) {
          dynBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    } else if (stepNum === 4) {
      // Step 4: 재난 알림 확인
      setTimeout(() => {
        const ticker = document.getElementById('ndvm-alert-ticker-container');
        if (ticker) {
          ticker.style.outline = '3px solid #dc2626';
          ticker.style.boxShadow = '0 0 16px rgba(220, 38, 38, 0.4)';
          setTimeout(() => {
            ticker.style.outline = '';
            ticker.style.boxShadow = '';
          }, 2500);
        }
        if (typeof window.toggleAlertPulseLayer === 'function' && !window.ndvmAlertRadarActive) {
          window.toggleAlertPulseLayer();
        }
      }, 300);
    } else if (stepNum === 6) {
      // Step 6: LocalStorage & 수동 릴레이
      setTimeout(() => {
        const relaySection = document.getElementById('demo-relay-interactive');
        if (relaySection) {
          relaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  // Hook into router changes to sync demo stepper bar
  window.addEventListener('hashchange', () => {
    const pageId = location.hash.replace('#', '') || 'demo-1';
    window.ndvmCurrentDemoStep = getStepFromPage(pageId);
    renderDemoBar();
  });

  window.addEventListener('DOMContentLoaded', () => {
    const pageId = location.hash.replace('#', '') || 'demo-1';
    window.ndvmCurrentDemoStep = getStepFromPage(pageId);
    renderDemoBar();
  });

  window.initDemoStepper = function() {
    const pageId = location.hash.replace('#', '') || 'demo-1';
    window.ndvmCurrentDemoStep = getStepFromPage(pageId);
    renderDemoBar();
  };
})();
