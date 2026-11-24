/* NDVM - Main Application Controller & Router */

function getContentEl() {
  return document.getElementById('content');
}

function getToggleEl() {
  return document.getElementById('menu-toggle');
}

function getDrawerEl() {
  return document.getElementById('menu-drawer');
}

function getOverlayEl() {
  return document.getElementById('menu-overlay');
}

function openMenu(open) {
  state.menuOpen = open;
  const toggle = getToggleEl();
  const drawer = getDrawerEl();
  const overlay = getOverlayEl();
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('active', open);
  }
  if (drawer) {
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.classList.toggle('open', open);
  }
  if (overlay) overlay.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

function pageHtml(page) {
  switch (page) {
    case 'demo-1': return typeof demoPurposePage === 'function' ? demoPurposePage() : homePage();
    case 'demo-2': return mapPage();
    case 'demo-3': return mapPage();
    case 'demo-4': return mapPage();
    case 'demo-5': return typeof safetyPage === 'function' ? safetyPage() : '';
    case 'demo-6': return typeof demoRelayPage === 'function' ? demoRelayPage() : (typeof safetyPage === 'function' ? safetyPage() : '');
    case 'demo-7': return typeof demoRoadmapPage === 'function' ? demoRoadmapPage() : aboutPage();
    case 'home': return typeof demoPurposePage === 'function' ? demoPurposePage() : homePage();
    case 'disaster': return mapPage();
    case 'map': return mapPage();
    case 'rainfall': return rainfallPage();
    case 'shelter': return shelterPage();
    case 'guide': return typeof guidePage === 'function' ? guidePage() : shelterPage();
    case 'action': return typeof safetyPage === 'function' ? safetyPage() : '';
    case 'stats': return statsPage();
    case 'about': return typeof demoRoadmapPage === 'function' ? demoRoadmapPage() : aboutPage();
    case 'help': return typeof helpPage === 'function' ? helpPage() : homePage();
    default: return typeof demoPurposePage === 'function' ? demoPurposePage() : homePage();
  }
}

function normalizePageId(page) {
  if (!page) return 'demo-1';
  if (page === 'disaster') return 'demo-2';
  if (page === 'map') return 'demo-2';
  if (page === 'home') return 'demo-1';
  if (page === 'action') return 'demo-5';
  return page;
}

function navigate(page) {
  page = normalizePageId(page);
  if (!PAGES.some(x => x.id === page)) page = 'demo-1';
  openMenu(false);
  if (location.hash !== '#' + page) {
    location.hash = page;
  } else {
    showPage(page);
  }
}

function showPage(page) {
  page = normalizePageId(page);
  state.page = page;
  const content = getContentEl();
  if (content) {
    content.innerHTML = pageHtml(page);
  }

  const drawerNav = document.getElementById('drawer-nav');
  if (drawerNav) {
    drawerNav.innerHTML = PAGES.map(item => `
      <button type="button" class="nav-item ${page === item.id ? 'active' : ''}" data-page="${item.id}" ${page === item.id ? 'aria-current="page"' : ''}>
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  openMenu(false);
  if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);

  // Sync demo stepper if available
  if (typeof window.initDemoStepper === 'function') {
    window.initDemoStepper();
  }

  // Trigger page-specific lifecycle hooks
  if (page === 'map' || page === 'demo-2' || page === 'demo-3' || page === 'demo-4') {
    setTimeout(() => { if (typeof initNdvmMap === 'function') initNdvmMap(); }, 0);
  }
  if (page === 'rainfall') setTimeout(() => { if (typeof window.ndvmInitRainfall === 'function') window.ndvmInitRainfall(); }, 0);
  if (page === 'stats') setTimeout(() => { if (typeof initNdvmStats === 'function') initNdvmStats(); }, 0);
  if (page === 'shelter') setTimeout(() => { if (typeof loadShelterStatus === 'function') loadShelterStatus(); }, 0);
  if (page === 'action' || page === 'demo-5') {
    if (typeof initSafetyPage === 'function') setTimeout(() => initSafetyPage(), 0);
  }
}

// Global UI Event Listeners
document.addEventListener('click', event => {
  if (event.target.closest('#menu-toggle')) {
    openMenu(!state.menuOpen);
    return;
  }
  if (event.target.closest('#menu-close') || event.target.closest('#menu-overlay')) {
    openMenu(false);
    return;
  }

  const button = event.target.closest('button, a');
  if (!button) return;

  if (button.hasAttribute('data-page')) {
    event.preventDefault();
    navigate(button.getAttribute('data-page'));
    return;
  }

  if (button.hasAttribute('data-disaster')) {
    const d = button.getAttribute('data-disaster');
    if (state.page === 'map' && typeof window.switchIntegratedDisaster === 'function') {
      window.switchIntegratedDisaster(d);
    } else {
      state.disaster = d;
      state.mapDisaster = d;
      navigate('map');
    }
    return;
  }

  if (button.hasAttribute('data-guide')) {
    state.guideIndex = Number(button.getAttribute('data-guide'));
    showPage(state.page === 'shelter' ? 'shelter' : 'guide');
    return;
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.menuOpen) openMenu(false);
});

window.addEventListener('hashchange', () => {
  const pageId = normalizePageId(location.hash.slice(1));
  showPage(PAGES.some(p => p.id === pageId) ? pageId : 'demo-1');
});

// Robust Application Bootstrapping
function bootNdvm() {
  const initialPage = normalizePageId(location.hash.slice(1));
  showPage(PAGES.some(p => p.id === initialPage) ? initialPage : 'demo-1');
  if (typeof window.initNdvmAlertsSystem === 'function') {
    window.initNdvmAlertsSystem();
  }
  if (typeof window.initDemoStepper === 'function') {
    window.initDemoStepper();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNdvm);
} else {
  bootNdvm();
}
