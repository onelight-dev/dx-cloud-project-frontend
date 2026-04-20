/* ========================================
   SPOFFY - 장바구니 페이지 (cart.js)
   ======================================== */

'use strict';

const FREE_SHIP_THRESHOLD = 50000;
const SHIP_FEE = 3000;

/* ── Render cart ── */
function renderCart() {
  const items = Cart.getItems();
  const cartContent = document.getElementById('cart-content');
  const cartEmpty = document.getElementById('cart-empty');

  if (!items.length) {
    cartContent?.classList.add('hidden');
    cartEmpty?.classList.remove('hidden');
    return;
  }
  cartContent?.classList.remove('hidden');
  cartEmpty?.classList.add('hidden');

  renderItems(items);
  renderSummary(items);
}

/* ── Render items ── */
function renderItems(items) {
  const container = document.getElementById('cart-items');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">
      <label class="checkbox-label">
        <input type="checkbox" class="item-check" checked/>
      </label>
      <div class="cart-item-thumb">
        ${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : ''}
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-option">색상: ${item.color} · 사이즈: ${item.size}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-actions">
        <div class="cart-qty">
          <button class="cart-qty-btn" data-action="minus">−</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button class="cart-qty-btn" data-action="plus">+</button>
        </div>
        <button class="cart-remove-btn" aria-label="삭제">✕</button>
      </div>
    </div>
  `).join('');

  // Qty buttons
  container.querySelectorAll('.cart-item').forEach(row => {
    const id = +row.dataset.id;
    const color = row.dataset.color;
    const size = row.dataset.size;

    row.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = Cart.getItems().find(i => i.id === id && i.color === color && i.size === size);
        if (!current) return;
        const newQty = btn.dataset.action === 'plus' ? current.qty + 1 : current.qty - 1;
        if (newQty < 1) {
          if (confirm('상품을 삭제하시겠습니까?')) {
            Cart.removeItem(id, color, size);
            renderCart();
          }
        } else {
          Cart.updateQty(id, color, size, newQty);
          renderCart();
        }
      });
    });

    row.querySelector('.cart-remove-btn')?.addEventListener('click', () => {
      Cart.removeItem(id, color, size);
      renderCart();
      showToast('상품이 삭제되었습니다.');
    });

    row.querySelector('.item-check')?.addEventListener('change', () => renderSummary(Cart.getItems()));
  });
}

/* ── Render summary ── */
function renderSummary(items) {
  const checkedItems = getCheckedItems(items);
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const originalTotal = checkedItems.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0);
  const discount = originalTotal - subtotal;
  const shipping = subtotal > 0 && subtotal < FREE_SHIP_THRESHOLD ? SHIP_FEE : 0;
  const total = subtotal + shipping;

  document.getElementById('sum-products').textContent = formatPrice(originalTotal);
  document.getElementById('sum-discount').textContent = `-${formatPrice(discount)}`;
  document.getElementById('sum-shipping').textContent = shipping === 0 ? '무료' : formatPrice(shipping);
  document.getElementById('sum-total').textContent = formatPrice(total);

  const freeNote = document.getElementById('free-ship-note');
  if (freeNote) {
    if (subtotal > 0 && subtotal < FREE_SHIP_THRESHOLD) {
      const remain = FREE_SHIP_THRESHOLD - subtotal;
      freeNote.textContent = `${formatPrice(remain)} 더 구매 시 무료 배송!`;
    } else if (subtotal >= FREE_SHIP_THRESHOLD) {
      freeNote.textContent = '무료 배송 적용 중입니다.';
    } else {
      freeNote.textContent = '';
    }
  }
}

/* ── Get checked items ── */
function getCheckedItems(items) {
  const checks = document.querySelectorAll('.item-check');
  return items.filter((_, i) => !checks[i] || checks[i].checked);
}

/* ── Select all ── */
function initSelectAll() {
  document.getElementById('select-all')?.addEventListener('change', e => {
    document.querySelectorAll('.item-check').forEach(c => { c.checked = e.target.checked; });
    renderSummary(Cart.getItems());
  });
}

/* ── Delete buttons ── */
function initDeleteBtns() {
  document.getElementById('delete-selected')?.addEventListener('click', () => {
    const items = Cart.getItems();
    const checks = document.querySelectorAll('.item-check');
    items.forEach((item, i) => {
      if (checks[i]?.checked) Cart.removeItem(item.id, item.color, item.size);
    });
    renderCart();
    showToast('선택 상품이 삭제되었습니다.');
  });

  document.getElementById('delete-all')?.addEventListener('click', () => {
    if (confirm('장바구니를 전체 비우시겠습니까?')) {
      Cart.clearAll();
      renderCart();
      showToast('장바구니가 비워졌습니다.');
    }
  });
}

/* ── Order button ── */
function initOrderBtn() {
  document.getElementById('order-btn')?.addEventListener('click', () => {
    const items = Cart.getItems();
    const checked = getCheckedItems(items);
    if (!checked.length) { showToast('주문할 상품을 선택해주세요.'); return; }
    window.location.href = 'checkout.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initSelectAll();
  initDeleteBtns();
  initOrderBtn();
});
