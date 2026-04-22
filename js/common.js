/* ========================================
   SPOFFY - Common JavaScript
   Cart state, Toast, Auth, Header init
   ======================================== */

'use strict';

/* ── Cart Store ── */
const Cart = (() => {
  const KEY = 'spoffy_cart';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    _updateCartBadge();
  }

  function addItem(item) {
    const items = getItems();
    // item: { id, name, price, originalPrice, color, size, qty, image }
    const existing = items.find(
      i => i.id === item.id && i.color === item.color && i.size === item.size
    );
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      items.push({ ...item, qty: item.qty || 1 });
    }
    saveItems(items);
    showToast('장바구니에 담았습니다.');
  }

  function removeItem(id, color, size) {
    const items = getItems().filter(
      i => !(i.id === id && i.color === color && i.size === size)
    );
    saveItems(items);
  }

  function updateQty(id, color, size, qty) {
    const items = getItems();
    const item = items.find(i => i.id === id && i.color === color && i.size === size);
    if (item) {
      if (qty < 1) {
        removeItem(id, color, size);
        return;
      }
      item.qty = qty;
      saveItems(items);
    }
  }

  function clearAll() {
    saveItems([]);
  }

  function getCount() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function _updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    });
  }

  return { getItems, addItem, removeItem, updateQty, clearAll, getCount, getTotal };
})();

/* ── Auth Store ── */
const Auth = (() => {
  const KEY = 'spoffy_user';

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(KEY, JSON.stringify(user));
    _updateHeaderAuth();
  }

  function logout() {
    localStorage.removeItem(KEY);
    _updateHeaderAuth();
    showToast('로그아웃되었습니다.');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function requireLogin(redirectUrl) {
    if (!isLoggedIn()) {
      sessionStorage.setItem('spoffy_redirect', redirectUrl || window.location.href);
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function _updateHeaderAuth() {
    const loginBtn = document.getElementById('header-login-btn');
    const logoutBtn = document.getElementById('header-logout-btn');
    const user = getUser();
    if (loginBtn) loginBtn.classList.toggle('hidden', !!user);
    if (logoutBtn) logoutBtn.classList.toggle('hidden', !user);
  }

  return { getUser, setUser, logout, isLoggedIn, requireLogin };
})();

/* ── Toast ── */
function showToast(message, duration = 2400) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ── Wishlist Store ── */
const Wishlist = (() => {
  const KEY = 'spoffy_wish';

  function getItems() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function toggle(item) {
    const items = getItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      localStorage.setItem(KEY, JSON.stringify(items));
      showToast('찜 목록에서 제거했습니다.');
      return false;
    } else {
      items.push(item);
      localStorage.setItem(KEY, JSON.stringify(items));
      showToast('찜 목록에 추가했습니다.');
      return true;
    }
  }

  function isWished(id) {
    return getItems().some(i => i.id === id);
  }

  function remove(id) {
    const items = getItems().filter(i => i.id !== id);
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  return { getItems, toggle, isWished, remove };
})();

/* ── Number formatting ── */
function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

/* ── Header init ── */
function initHeader() {
  // Cart badge
  const badges = document.querySelectorAll('.cart-badge');
  const count = Cart.getCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  });

  // Auth state
  const loginBtn = document.getElementById('header-login-btn');
  const logoutBtn = document.getElementById('header-logout-btn');
  const user = Auth.getUser();
  if (loginBtn) loginBtn.classList.toggle('hidden', !!user);
  if (logoutBtn) logoutBtn.classList.toggle('hidden', !user);

  // Logout action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // Active category highlight
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.categories a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(currentPage)) {
      a.classList.add('active');
    }
  });
}

/* ── Accordion ── */
function initAccordions() {
  document.querySelectorAll('.acc-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc-item');
      item.classList.toggle('open');
    });
  });
}

/* ── Shared header/footer HTML ── */
function getHeaderHTML(activePage = '') {
  return `
  <header class="top-line">
    <div class="wrap topbar">
      <a href="index.html" class="brand" aria-label="SPOFFY 홈">
        <span class="brand-text">Spoffy</span>
      </a>
      <div class="header-actions">
        <button class="icon-action" aria-label="검색" onclick="window.location.href='product-list.html'">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
        </button>
        <a href="mypage.html" class="icon-action" aria-label="마이페이지">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M2 21c0-5.523 4.477-10 10-10s10 4.477 10 10"/></svg>
        </a>
        <a href="cart.html" class="icon-action" aria-label="장바구니" style="position:relative;">
          <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span class="cart-badge hidden">0</span>
        </a>
        <button id="header-login-btn" class="header-text-btn" onclick="window.location.href='login.html'">로그인</button>
        <button id="header-logout-btn" class="header-text-btn hidden">로그아웃</button>
      </div>
    </div>
    <nav class="category-row" aria-label="카테고리">
      <div class="wrap">
        <ul class="categories">
          <li><a href="index.html" ${activePage==='best'?'class="active"':''}>Best</a></li>
          <li><a href="product-list.html?cat=women" ${activePage==='women'?'class="active"':''}>Women</a></li>
          <li><a href="product-list.html?cat=men" ${activePage==='men'?'class="active"':''}>Men</a></li>
          <li><a href="product-list.html?cat=set" ${activePage==='set'?'class="active"':''}>Set</a></li>
          <li><a href="product-list.html?cat=review" ${activePage==='review'?'class="active"':''}>Review</a></li>
          <li><a href="product-list.html?cat=coordi" ${activePage==='coordi'?'class="active"':''}>Coordi</a></li>
          <li><a href="product-list.html?cat=lookbook" ${activePage==='lookbook'?'class="active"':''}>Lookbook</a></li>
        </ul>
      </div>
    </nav>
  </header>`;
}

function getFooterHTML() {
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-inner">
        <div>
          <div class="footer-brand-text">Spoffy</div>
          <p class="footer-desc">패션 코디 세트 쇼핑몰<br>AI 피팅으로 나만의 스타일을 찾아보세요.</p>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <a href="product-list.html">상품 목록</a>
          <a href="ai-fitting.html">AI 피팅</a>
          <a href="mypage.html">마이페이지</a>
          <a href="wishlist.html">위시리스트</a>
        </div>
        <div class="footer-col">
          <h4>고객센터</h4>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">1:1 문의</a>
          <p style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.35)">평일 10:00 – 18:00<br>070-0000-0000</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">© 2025 SPOFFY Inc. All rights reserved.</p>
        <div class="footer-sns">
          <a href="#">Instagram</a>
          <a href="#">Kakao</a>
          <a href="#">Blog</a>
        </div>
      </div>
      <p class="footer-info">SPOFFY Inc. | 대표: 홍길동 | 사업자등록번호: 000-00-00000 | 통신판매업신고: 2025-서울-00000</p>
    </div>
  </footer>
  <div id="toast-container"></div>`;
}

/* ── Layout loader (header.html / footer.html 주입) ── */
async function loadLayout() {
  const headerEl = document.getElementById('header');
  const footerEl = document.getElementById('footer');

  try {
    if (headerEl) {
      const res = await fetch('./header.html');
      headerEl.innerHTML = await res.text();
    }
    if (footerEl) {
      const res = await fetch('./footer.html');
      footerEl.innerHTML = await res.text();
    }
  } catch (err) {
    console.error('[layout] 레이아웃 로드 실패:', err);
  }

  initHeader(); // 헤더 DOM 주입 완료 후 실행

  /* ── 검색 토글 버튼 연결 ─────────────────────────────────────────────
     #search-toggle-btn 은 header.html 안에 있어 DOMContentLoaded 시점에
     product-list.js의 initSearch()가 실행될 때 아직 DOM에 없음.
     loadLayout 완료 후 여기서 직접 연결한다.
     - product-list 페이지: #search-bar-wrap 존재 → 검색바 토글
     - 그 외 페이지: #search-bar-wrap 없음 → product-list로 이동
  ─────────────────────────────────────────────────────────────────── */
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchBarWrap   = document.getElementById('search-bar-wrap');

  if (searchToggleBtn) {
    if (searchBarWrap) {
      searchToggleBtn.addEventListener('click', () => {
        searchBarWrap.classList.toggle('hidden');
        if (!searchBarWrap.classList.contains('hidden')) {
          document.getElementById('search-input')?.focus();
        }
      });
    } else {
      searchToggleBtn.addEventListener('click', () => {
        window.location.href = 'product-list.html';
      });
    }
  }
}

/* ── DOMContentLoaded bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('header') || document.getElementById('footer')) {
    loadLayout(); // 공유 layout div 있는 페이지 → 비동기 주입 후 initHeader 호출
  } else {
    initHeader(); // inline header 페이지 (login, signup, checkout 등) → 즉시 실행
  }
  initAccordions();
});
