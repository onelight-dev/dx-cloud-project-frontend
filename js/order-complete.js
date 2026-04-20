/* ========================================
   SPOFFY - 주문 완료 페이지 (order-complete.js)
   ======================================== */

'use strict';

function renderOrderComplete() {
  let order = null;
  try { order = JSON.parse(sessionStorage.getItem('spoffy_order')); } catch {}

  if (!order) {
    // fallback demo data
    order = {
      orderNo: 'SPF-' + Date.now().toString().slice(-8),
      date: new Date().toLocaleDateString('ko-KR'),
      items: [],
      total: 0,
    };
  }

  document.getElementById('order-no').textContent = order.orderNo;
  document.getElementById('order-date').textContent = order.date;
  document.getElementById('order-total').textContent = formatPrice(order.total || 0);

  // ETA: 오늘 + 3 영업일
  const eta = new Date();
  eta.setDate(eta.getDate() + 3);
  document.getElementById('order-eta').textContent =
    eta.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' 예정';

  // Ordered items
  const container = document.getElementById('ordered-items');
  if (container && order.items?.length) {
    container.innerHTML = order.items.map(item => `
      <div class="ordered-item">
        <div class="ordered-item-thumb">
          ${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : ''}
        </div>
        <div>
          <p class="ordered-item-name">${item.name}</p>
          <p class="ordered-item-opt">${item.color} · ${item.size} · ${item.qty}개</p>
          <p class="ordered-item-price">${formatPrice(item.price * item.qty)}</p>
        </div>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderOrderComplete();
});
