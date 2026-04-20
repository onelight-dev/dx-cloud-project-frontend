/* ========================================
   SPOFFY - 메인 페이지 (index.js)
   ======================================== */

'use strict';

/* ── Mock product data ── */
const BEST_PRODUCTS = [
  {
    id: 1,
    name: '모노톤 셋업 코디 세트',
    brand: 'SPOFFY',
    price: 128000,
    originalPrice: 168000,
    discount: 24,
    image: 'image/모노톤 셋업 코디 세트.png',
    colors: ['#111', '#fff', '#b9b9b5'],
  },
  {
    id: 2,
    name: '소프트 데일리 코디 세트',
    brand: 'SPOFFY',
    price: 96000,
    originalPrice: 128000,
    discount: 25,
    image: 'image/소프트 데일리 코디.png',
    colors: ['#d7cec5', '#5e514d', '#111'],
  },
  {
    id: 3,
    name: '스트리트 캐주얼 코디 세트',
    brand: 'SPOFFY',
    price: 112000,
    originalPrice: 148000,
    discount: 24,
    image: 'image/스트리트 패션.png',
    colors: ['#111', '#4a6fa5'],
  },
  {
    id: 4,
    name: '오버핏 캐주얼 자켓 세트',
    brand: 'SPOFFY',
    price: 145000,
    originalPrice: 185000,
    discount: 22,
    image: null,
    colors: ['#2f2f2f', '#8a7a6a'],
  },
  {
    id: 5,
    name: '린넨 썸머 코디 세트',
    brand: 'SPOFFY',
    price: 88000,
    originalPrice: 110000,
    discount: 20,
    image: null,
    colors: ['#e0d8ce', '#b5a99a'],
  },
];

/* ── Render best products ── */
function renderBestProducts() {
  const grid = document.getElementById('best-products');
  if (!grid) return;

  grid.innerHTML = BEST_PRODUCTS.map((p, i) => {
    const isWished = Wishlist.isWished(p.id);
    const colorSwatches = p.colors
      .map(c => `<span style="background:${c}"></span>`)
      .join('');
    const thumbContent = p.image
      ? `<img class="product-thumb-img" src="${p.image}" alt="${p.name}" loading="lazy"/>`
      : `<div class="product-thumb-placeholder"></div>`;

    return `
      <article class="product-card" onclick="goToProduct(${p.id})">
        <div class="product-thumb">
          ${thumbContent}
          <div class="swatches">${colorSwatches}</div>
          <button class="wish-btn ${isWished ? 'is-wish' : ''}"
            onclick="toggleWish(event, ${p.id})" aria-label="찜하기">
            ${isWished ? '♥' : '♡'}
          </button>
          ${i < 3 ? `<span class="rank-badge">${i + 1}</span>` : ''}
        </div>
        <div class="product-body">
          <p class="product-brand">${p.brand}</p>
          <p class="product-title">${p.name}</p>
          <div class="price-row">
            <span class="discount">${p.discount}%</span>
            <span class="price">${formatPrice(p.price)}</span>
            <span class="original-price">${formatPrice(p.originalPrice)}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ── Navigate to product ── */
function goToProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

/* ── Wishlist toggle ── */
function toggleWish(e, id) {
  e.stopPropagation();
  const product = BEST_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const wished = Wishlist.toggle(product);
  // re-render the button
  const btn = e.currentTarget;
  btn.classList.toggle('is-wish', wished);
  btn.textContent = wished ? '♥' : '♡';
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  renderBestProducts();
});
