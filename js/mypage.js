/* ========================================
   SPOFFY - 마이페이지 (mypage.js)
   ======================================== */

'use strict';

/* ── Mock orders ── */
const MOCK_ORDERS = [
  {
    no: 'SPF-20250610', date: '2025.06.10', status: 'delivered', statusText: '배송 완료',
    items: [{ name: '모노톤 셋업 코디 세트', opt: '블랙 · M · 1개', price: 128000, image: 'image/모노톤 셋업 코디 세트.png' }],
    total: 128000,
  },
  {
    no: 'SPF-20250528', date: '2025.05.28', status: 'delivered', statusText: '배송 완료',
    items: [{ name: '소프트 데일리 코디 세트', opt: '베이지 · S · 1개', price: 96000, image: 'image/소프트 데일리 코디.png' }],
    total: 96000,
  },
];

/* ── Render user info ── */
function renderUserInfo() {
  const user = Auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('user-name').textContent = user.name || '회원';
  document.getElementById('user-email').textContent = user.email || '';
  document.getElementById('info-name').value = user.name || '';
  document.getElementById('info-email').value = user.email || '';

  // Stats
  document.getElementById('stat-orders').textContent = MOCK_ORDERS.length;
  document.getElementById('stat-wish').textContent = Wishlist.getItems().length;
  document.getElementById('stat-reviews').textContent = 0;
}

/* ── Render orders ── */
function renderOrders() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  // Include session order if exists
  let orders = [...MOCK_ORDERS];
  try {
    const recent = JSON.parse(sessionStorage.getItem('spoffy_order'));
    if (recent) {
      orders.unshift({
        no: recent.orderNo, date: recent.date, status: 'shipping', statusText: '배송 준비 중',
        items: recent.items?.map(i => ({ name: i.name, opt: `${i.color} · ${i.size} · ${i.qty}개`, price: i.price * i.qty, image: i.image })) || [],
        total: recent.total,
      });
    }
  } catch {}

  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>주문 내역이 없습니다</h3><a href="product-list.html" class="btn primary" style="margin-top:16px;">쇼핑하기</a></div>`;
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-card-head">
        <span class="order-card-no">${o.no}</span>
        <span class="order-card-date">${o.date}</span>
        <span class="order-card-status ${o.status}">${o.statusText}</span>
      </div>
      <div class="order-card-items">
        ${o.items.map(item => `
          <div class="order-item-row">
            <div class="order-item-thumb">${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : ''}</div>
            <div>
              <p class="order-item-name">${item.name}</p>
              <p class="order-item-opt">${item.opt}</p>
            </div>
            <span class="order-item-price">${formatPrice(item.price)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-card-footer">
        <span class="order-total">총 ${formatPrice(o.total)}</span>
        <div class="order-card-actions">
          <button class="btn sm" onclick="showToast('배송 조회는 데모에서 지원되지 않습니다.')">배송 조회</button>
          ${o.status === 'delivered' ? `<button class="btn sm" onclick="showToast('리뷰 작성 기능은 준비 중입니다.')">리뷰 작성</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Tab switching ── */
function initTabs() {
  document.querySelectorAll('.mypage-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.mypage-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mypage-section').forEach(s => s.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
    });
  });

  // Hash routing
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    document.querySelector(`[data-tab="${hash}"]`)?.click();
  }
}

/* ── Save info ── */
function initSaveInfo() {
  document.getElementById('save-info-btn')?.addEventListener('click', () => {
    const user = Auth.getUser() || {};
    user.name = document.getElementById('info-name')?.value.trim();
    user.tel = document.getElementById('info-tel')?.value.trim();
    Auth.setUser(user);
    document.getElementById('user-name').textContent = user.name;
    showToast('정보가 저장되었습니다.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserInfo();
  renderOrders();
  initTabs();
  initSaveInfo();
});
