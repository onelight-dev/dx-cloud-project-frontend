/* ========================================
   SPOFFY - 위시리스트 페이지 (wishlist.js)
   ======================================== */

'use strict';

function renderWishlist() {
  const items = Wishlist.getItems();
  const grid = document.getElementById('wish-grid');
  const emptyEl = document.getElementById('wish-empty');
  const countEl = document.getElementById('wish-count');

  if (countEl) countEl.textContent = `총 ${items.length}개`;

  if (!items.length) {
    grid?.classList.add('hidden');
    emptyEl?.classList.remove('hidden');
    return;
  }

  grid?.classList.remove('hidden');
  emptyEl?.classList.add('hidden');

  grid.innerHTML = items.map(p => {
    const thumbContent = p.image
      ? `<img class="product-thumb-img" src="${p.image}" alt="${p.name}" loading="lazy"/>`
      : `<div class="product-thumb-placeholder" style="height:100%"></div>`;

    return `
      <article class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <div class="product-thumb">
          ${thumbContent}
          <button class="wish-btn is-wish"
            onclick="removeWish(event, ${p.id})" aria-label="찜 해제">♥</button>
          <button class="quick-cart" onclick="addToCart(event, ${p.id})">장바구니 담기</button>
        </div>
        <div class="product-body">
          <p class="product-brand">${p.brand || 'SPOFFY'}</p>
          <p class="product-title">${p.name}</p>
          <div class="price-row">
            ${p.discount ? `<span class="discount">${p.discount}%</span>` : ''}
            <span class="price">${formatPrice(p.price || 0)}</span>
            ${p.originalPrice ? `<span class="original-price">${formatPrice(p.originalPrice)}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function removeWish(e, id) {
  e.stopPropagation();
  Wishlist.remove(id);
  showToast('찜 목록에서 제거했습니다.');
  renderWishlist();
}

function addToCart(e, id) {
  e.stopPropagation();
  const item = Wishlist.getItems().find(i => i.id === id);
  if (!item) return;
  Cart.addItem({
    id: item.id, name: item.name,
    price: item.price || 0,
    originalPrice: item.originalPrice,
    color: '블랙', size: 'M', qty: 1,
    image: item.image || null,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderWishlist();
});
