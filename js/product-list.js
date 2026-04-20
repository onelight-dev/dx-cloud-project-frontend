/* ========================================
   SPOFFY - 상품 목록 페이지 (product-list.js)
   ======================================== */

'use strict';

/* ── API 엔드포인트 ── */
const PRODUCT_API_URL = 'http://192.168.0.69/product/api/products';

/* ── 카테고리 매핑 (API category_name → 기존 data-cat 코드) ── */
const CATEGORY_MAP = {
  '이너': 'top',
  '아우터': 'outer',
  '하의': 'bottom',
  '신발': 'shoes',
  '코디 세트': 'set',
  '여성': 'women',
  '남성': 'men',
};

/* ── 상품 데이터 (fetch 완료 후 채워짐) ── */
let ALL_PRODUCTS = [];

/* ── API 응답 → UI 구조 변환 ── */
function mapProduct(item) {
  const originalPrice = parseFloat(item.base_price) || 0;
  const price = parseFloat(item.discount_price) || originalPrice;
  const discount = originalPrice > 0
    ? Math.round((originalPrice - price) / originalPrice * 100)
    : 0;

  return {
    id: item.id,
    name: item.name,
    brand: 'SPOFFY',
    price,
    originalPrice,
    discount,
    image: item.thumbnail_url || null,
    cat: CATEGORY_MAP[item.category_name] || item.category_name || '',
    color: '',      // API 미제공 → 색상 필터 사용 불가
    isNew: false,   // API 미제공 → 신상 정렬 시 순서 유지
  };
}

/* ── 상품 목록 fetch ── */
async function fetchProducts() {
  try {
    const res = await fetch(PRODUCT_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const activeItems = (json.data || []).filter(item => item.is_active === true);
    ALL_PRODUCTS = activeItems.map(mapProduct);

    if (!ALL_PRODUCTS.length) {
      showEmptyState('상품이 없습니다.');
      return;
    }

    renderProducts();

  } catch (err) {
    console.error('[product-list] 상품 로드 실패:', err);
    showEmptyState('상품을 불러오지 못했습니다.');
  }
}

/* ── 에러 / 빈 상태 표시 ── */
function showEmptyState(message) {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('product-count');

  if (grid) grid.innerHTML = '';
  if (countEl) countEl.textContent = '총 0개';
  if (emptyState) {
    emptyState.textContent = message;
    emptyState.classList.remove('hidden');
  }
}

/* ── State ── */
let state = {
  cat: 'all',
  price: 'all',
  color: 'all',
  sort: 'popular',
  query: '',
  page: 1,
  perPage: 8,
};

/* ── Filter & sort products ── */
function getFiltered() {
  let list = [...ALL_PRODUCTS];

  // category
  if (state.cat !== 'all') list = list.filter(p => p.cat === state.cat);

  // price
  if (state.price === 'under50') list = list.filter(p => p.price < 50000);
  else if (state.price === '50to100') list = list.filter(p => p.price >= 50000 && p.price < 100000);
  else if (state.price === '100to200') list = list.filter(p => p.price >= 100000 && p.price < 200000);
  else if (state.price === 'over200') list = list.filter(p => p.price >= 200000);

  // color
  if (state.color !== 'all') list = list.filter(p => p.color === state.color);

  // search query
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  // sort
  if (state.sort === 'new') list.sort((a, b) => b.isNew - a.isNew);
  else if (state.sort === 'low') list.sort((a, b) => a.price - b.price);
  else if (state.sort === 'high') list.sort((a, b) => b.price - a.price);
  else if (state.sort === 'discount') list.sort((a, b) => b.discount - a.discount);

  return list;
}

/* ── Render products ── */
function renderProducts() {
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * state.perPage;
  const pageItems = filtered.slice(start, start + state.perPage);

  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('product-count');

  if (countEl) countEl.textContent = `총 ${total}개`;

  if (!pageItems.length) {
    grid.innerHTML = '';
    emptyState?.classList.remove('hidden');
    renderPagination(0, 1);
    return;
  }
  emptyState?.classList.add('hidden');

  grid.innerHTML = pageItems.map((p, i) => {
    const rank = start + i + 1;
    const isWished = Wishlist.isWished(p.id);
    const thumbContent = p.image
      ? `<img class="product-thumb-img" src="${p.image}" alt="${p.name}" loading="lazy"/>`
      : `<div class="product-thumb-placeholder" style="height:100%"></div>`;

    return `
      <article class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <div class="product-thumb">
          ${thumbContent}
          ${rank <= 3 ? `<span class="rank-badge">${rank}</span>` : ''}
          ${p.isNew ? `<span class="new-badge">NEW</span>` : ''}
          <button class="wish-btn ${isWished ? 'is-wish' : ''}"
            onclick="handleWish(event, '${p.id}')" aria-label="찜하기">
            ${isWished ? '♥' : '♡'}
          </button>
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

  renderPagination(total, totalPages);
}

/* ── Pagination ── */
function renderPagination(total, totalPages) {
  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');
  const numbersEl = document.getElementById('page-numbers');
  if (!prevBtn || !nextBtn || !numbersEl) return;

  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= totalPages;

  numbersEl.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(n => `<button class="page-num ${n === state.page ? 'active' : ''}" data-page="${n}">${n}</button>`)
    .join('');

  numbersEl.querySelectorAll('.page-num').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = +btn.dataset.page;
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ── Wishlist toggle ── */
function handleWish(e, id) {
  e.stopPropagation();
  const product = ALL_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const wished = Wishlist.toggle(product);
  const btn = e.currentTarget;
  btn.classList.toggle('is-wish', wished);
  btn.textContent = wished ? '♥' : '♡';
}

/* ── URL param handling ── */
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const q = params.get('q');
  if (cat) state.cat = cat;
  if (q) state.query = q;

  // update title
  const titles = { women: 'Women', men: 'Men', set: '코디 세트', outer: '아우터', top: '상의', bottom: '하의', shoes: '신발', all: '전체 상품' };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = q ? `"${q}" 검색 결과` : (titles[cat] || '전체 상품');

  // sync filter UI
  if (cat) {
    document.querySelectorAll('[data-cat]').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === cat);
    });
  }
}

/* ── Init filters ── */
function initFilters() {
  // Category
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.cat = btn.dataset.cat;
      state.page = 1;
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('active', b.dataset.cat === state.cat));
      renderProducts();
    });
  });

  // Price
  document.querySelectorAll('[data-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.price = btn.dataset.price;
      state.page = 1;
      document.querySelectorAll('[data-price]').forEach(b => b.classList.toggle('active', b.dataset.price === state.price));
      renderProducts();
    });
  });

  // Color
  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.color = btn.dataset.color;
      state.page = 1;
      document.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('active', b.dataset.color === state.color));
      renderProducts();
    });
  });

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', e => {
    state.sort = e.target.value;
    state.page = 1;
    renderProducts();
  });

  // Pagination prev/next
  document.getElementById('page-prev')?.addEventListener('click', () => {
    if (state.page > 1) { state.page--; renderProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  document.getElementById('page-next')?.addEventListener('click', () => {
    const total = getFiltered().length;
    const totalPages = Math.ceil(total / state.perPage);
    if (state.page < totalPages) { state.page++; renderProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
}

/* ── Search ── */
function initSearch() {
  const toggleBtn = document.getElementById('search-toggle-btn');
  const searchWrap = document.getElementById('search-bar-wrap');
  const closeBtn = document.getElementById('search-close');
  const submitBtn = document.getElementById('search-submit');
  const inputEl = document.getElementById('search-input');

  toggleBtn?.addEventListener('click', () => {
    searchWrap?.classList.toggle('hidden');
    if (!searchWrap?.classList.contains('hidden')) inputEl?.focus();
  });
  closeBtn?.addEventListener('click', () => {
    searchWrap?.classList.add('hidden');
    state.query = '';
    if (inputEl) inputEl.value = '';
    renderProducts();
  });

  function doSearch() {
    state.query = inputEl?.value.trim() || '';
    state.page = 1;
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = state.query ? `"${state.query}" 검색 결과` : '전체 상품';
    renderProducts();
  }

  submitBtn?.addEventListener('click', doSearch);
  inputEl?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  readUrlParams();
  initFilters();
  initSearch();
  fetchProducts();
});
