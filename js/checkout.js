/* ========================================
   SPOFFY - 결제 페이지 (checkout.js)
   ======================================== */

'use strict';

const SHIP_FEE = 3000;
const FREE_SHIP = 50000;

/* ── Render order items ── */
function renderOrderItems() {
  const items = Cart.getItems();
  const container = document.getElementById('order-items');
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;">장바구니가 비어있습니다.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="order-item">
      <div class="order-item-thumb">
        ${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : ''}
      </div>
      <div>
        <p class="order-item-name">${item.name}</p>
        <p class="order-item-option">${item.color} · ${item.size} · ${item.qty}개</p>
        <p class="order-item-price">${formatPrice(item.price * item.qty)}</p>
      </div>
    </div>
  `).join('');

  // Summary
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const originalTotal = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0);
  const discount = originalTotal - subtotal;
  const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  document.getElementById('co-sum-products').textContent = formatPrice(originalTotal);
  document.getElementById('co-sum-discount').textContent = `-${formatPrice(discount)}`;
  document.getElementById('co-sum-shipping').textContent = shipping === 0 ? '무료' : formatPrice(shipping);
  document.getElementById('co-sum-total').textContent = formatPrice(total);
}

/* ── Load saved user info ── */
function initSavedInfo() {
  const user = Auth.getUser();
  const bar = document.getElementById('saved-info-bar');
  if (user && bar) {
    bar.classList.remove('hidden');
    document.getElementById('load-info-btn')?.addEventListener('click', () => {
      if (user.name) document.getElementById('co-name').value = user.name;
      if (user.tel) document.getElementById('co-tel').value = user.tel;
      if (user.postcode) document.getElementById('co-postcode').value = user.postcode;
      if (user.addr) document.getElementById('co-addr').value = user.addr;
      showToast('저장된 배송 정보를 불러왔습니다.');
    });
  }
}

/* ── Address search (demo) ── */
function initAddrSearch() {
  document.getElementById('co-addr-btn')?.addEventListener('click', () => {
    showToast('주소 검색은 실제 환경에서 카카오 API를 연동합니다.');
    document.getElementById('co-postcode').value = '06236';
    document.getElementById('co-addr').value = '서울특별시 강남구 테헤란로 152';
  });
}

/* ── All-agree ── */
function initAgree() {
  const allChk = document.getElementById('agree-all-pay');
  const terms = document.querySelectorAll('.pay-term');
  allChk?.addEventListener('change', () => {
    terms.forEach(t => { t.checked = allChk.checked; });
  });
  terms.forEach(t => {
    t.addEventListener('change', () => {
      allChk.checked = [...terms].every(t => t.checked);
    });
  });
}

/* ── Validation ── */
function validateCheckout() {
  const name = document.getElementById('co-name')?.value.trim();
  const tel = document.getElementById('co-tel')?.value.trim();
  const addr = document.getElementById('co-addr')?.value.trim();
  const terms = [...document.querySelectorAll('.pay-term')];

  if (!name) { showToast('수령인 이름을 입력해주세요.'); return false; }
  if (!tel) { showToast('전화번호를 입력해주세요.'); return false; }
  if (!addr) { showToast('배송 주소를 입력해주세요.'); return false; }
  if (!terms.every(t => t.checked)) { showToast('필수 약관에 동의해주세요.'); return false; }
  return true;
}

/* ── Pay button ── */
function initPayBtn() {
  document.getElementById('pay-btn')?.addEventListener('click', () => {
    if (!Cart.getItems().length) { showToast('장바구니가 비어있습니다.'); return; }
    if (!validateCheckout()) return;

    const btn = document.getElementById('pay-btn');
    btn.textContent = '결제 처리 중...';
    btn.disabled = true;

    setTimeout(() => {
      // Generate order number
      const orderNo = 'SPF-' + Date.now().toString().slice(-8);
      sessionStorage.setItem('spoffy_order', JSON.stringify({
        orderNo,
        date: new Date().toLocaleDateString('ko-KR'),
        items: Cart.getItems(),
        total: Cart.getTotal(),
      }));
      Cart.clearAll();
      window.location.href = 'order-complete.html';
    }, 1200);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderOrderItems();
  initSavedInfo();
  initAddrSearch();
  initAgree();
  initPayBtn();
});
