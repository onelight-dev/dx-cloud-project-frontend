/* ========================================
   SPOFFY - 상품 상세 페이지 (product-detail.js)
   ======================================== */

'use strict';

/* ── API 엔드포인트 ── */
const PRODUCT_DETAIL_API = 'http://192.168.0.69/product/api/products';

/* ── 기본 옵션 구조 (option_groups / skus API 연동 전 임시) ─────────────
   API에서 옵션 데이터가 제공되면 이 상수를 제거하고
   buildProduct()의 colors / items 필드를 API 응답으로 교체한다.
─────────────────────────────────────────────────────────────────────── */
const DEFAULT_OPTIONS = {
  colors: [
    { name: '블랙', hex: '#111111' },
    { name: '차콜', hex: '#3d3d3d' },
    { name: '화이트', hex: '#f5f5f0' },
  ],
  items: [
    { name: '구성 상품', image: null, desc: '-', price: 0 },
  ],
  tags: [],
  thumbs: [null, null, null, null],
  reviews: [],
};

/* ── 현재 로드된 상품 (전역 참조) ── */
let currentProduct = null;

/* ── State ── */
let state = {
  productId: null,
  itemOptions: {},
};

/* ── API 응답 → UI 구조 변환 ── */
function buildProduct(data) {
  const originalPrice = parseFloat(data.base_price) || 0;
  const price         = parseFloat(data.discount_price) || originalPrice;
  const discount      = originalPrice > 0
    ? Math.round((originalPrice - price) / originalPrice * 100)
    : 0;

  return {
    id:            data.id,
    brand:         data.category_name || 'SPOFFY',
    name:          data.name          || '',
    desc:          data.description   || '',
    price,
    originalPrice,
    discount,
    image:         data.thumbnail_url || null,
    thumbs:        data.thumbnail_url
                     ? [data.thumbnail_url, null, null, null]
                     : [null, null, null, null],
    colors:        DEFAULT_OPTIONS.colors,
    items:         DEFAULT_OPTIONS.items,
    tags:          DEFAULT_OPTIONS.tags,
    reviews:       DEFAULT_OPTIONS.reviews,
  };
}

/* ── 상품 로드 (API) ── */
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) {
    window.location.href = 'product-list.html';
    return;
  }

  state.productId = id;

  try {
    const res  = await fetch(`${PRODUCT_DETAIL_API}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const data = json?.data;

    if (!data) {
      window.location.href = 'product-list.html';
      return;
    }

    currentProduct = buildProduct(data);
    renderProductUI(currentProduct);

  } catch (err) {
    console.error('[product-detail] 상품 로드 실패:', err);
    showToast('상품 정보를 불러오지 못했습니다.');
    setTimeout(() => { window.location.href = 'product-list.html'; }, 1500);
  }
}

/* ── 상품 UI 렌더링 ── */
function renderProductUI(p) {
  // Breadcrumb
  const breadcrumbEl = document.getElementById('breadcrumb-name');
  if (breadcrumbEl) breadcrumbEl.textContent = p.name;
  document.title = `${p.name} - SPOFFY`;

  // 기본 정보
  document.getElementById('detail-brand').textContent    = p.brand;
  document.getElementById('detail-name').textContent     = p.name;
  document.getElementById('detail-desc').textContent     = p.desc;
  document.getElementById('detail-discount').textContent = `${p.discount}%`;
  document.getElementById('detail-price').textContent    = formatPrice(p.price);
  document.getElementById('detail-original').textContent = formatPrice(p.originalPrice);

  // 대표 이미지
  const mainShot = document.getElementById('main-shot');
  if (mainShot) {
    if (p.image) {
      mainShot.innerHTML = `<img src="${p.image}" alt="${p.name}"/>`;
      mainShot.classList.remove('main-shot-placeholder');
    } else {
      mainShot.innerHTML = '';
      mainShot.classList.add('main-shot-placeholder');
    }
  }

  // 썸네일
  const thumbRow = document.getElementById('thumb-row');
  if (thumbRow) {
    thumbRow.innerHTML = p.thumbs.map((t, i) => `
      <div class="thumb-item ${i === 0 ? 'active' : ''}" data-idx="${i}">
        ${t ? `<img src="${t}" alt="썸네일 ${i + 1}"/>` : ''}
      </div>
    `).join('');
    thumbRow.querySelectorAll('.thumb-item').forEach((el, i) => {
      el.addEventListener('click', () => selectThumb(i));
    });
  }

  // 태그
  const tagsEl = document.getElementById('detail-tags');
  if (tagsEl) {
    tagsEl.innerHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
  }

  // 위시리스트 버튼 초기 상태
  const wishBtn = document.getElementById('wish-btn');
  if (wishBtn) {
    const wished = Wishlist.isWished(p.id);
    wishBtn.classList.toggle('is-wish', wished);
    wishBtn.textContent = wished ? '♥' : '♡';
  }

  // 구성 상품 옵션 렌더링
  renderItemOptions(p);
}

/* ── 구성 상품별 옵션 렌더링 (드롭다운 방식) ────────────────────────────
   option_groups / skus API 연동 후에는 이 함수의 colors / SIZES 데이터를
   API 응답으로 교체한다. UI 구조와 이벤트 로직은 그대로 유지.
─────────────────────────────────────────────────────────────────────── */
function renderItemOptions(p) {
  const container = document.getElementById('item-options-list');
  if (!container) return;

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  container.innerHTML = p.items.map((item, i) => `
    <div class="item-opt-card">

      <div class="item-opt-head">
        <div class="item-opt-thumb">
          ${item.image ? `<img src="${item.image}" alt="${item.name}"/>` : ''}
        </div>
        <div class="item-opt-info">
          <p class="item-opt-name">${item.name}</p>
          <p class="item-opt-desc">${item.desc}</p>
          <p class="item-opt-price">${formatPrice(item.price)}</p>
        </div>
      </div>

      <div class="item-opt-controls">

        <div class="option-group">
          <label class="item-opt-label" for="color-select-${i}">색상</label>
          <select
            id="color-select-${i}"
            class="option-select"
            data-option="color"
            data-item="${i}">
            ${p.colors.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="option-group">
          <label class="item-opt-label" for="size-select-${i}">사이즈</label>
          <select
            id="size-select-${i}"
            class="option-select"
            data-option="size"
            data-item="${i}">
            <option value="" disabled selected>사이즈를 선택하세요</option>
            ${SIZES.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>

        <div class="option-group">
          <label class="item-opt-label">수량</label>
          <div class="qty-control">
            <button class="qty-btn" data-item="${i}" data-action="minus" aria-label="수량 감소">−</button>
            <span class="qty-value" id="item-qty-${i}">1</span>
            <button class="qty-btn" data-item="${i}" data-action="plus" aria-label="수량 증가">+</button>
          </div>
        </div>

      </div>
    </div>
  `).join('');

  // state 초기화
  p.items.forEach((_, i) => {
    state.itemOptions[i] = { color: p.colors[0].name, size: null, qty: 1 };
  });

  // 색상 드롭다운
  container.querySelectorAll('select[data-option="color"]').forEach(sel => {
    sel.addEventListener('change', () => {
      state.itemOptions[+sel.dataset.item].color = sel.value;
    });
  });

  // 사이즈 드롭다운
  container.querySelectorAll('select[data-option="size"]').forEach(sel => {
    sel.addEventListener('change', () => {
      state.itemOptions[+sel.dataset.item].size = sel.value;
    });
  });

  // 수량 +/-
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = +btn.dataset.item;
      const action = btn.dataset.action;
      const opts   = state.itemOptions[idx];
      if (action === 'minus' && opts.qty > 1)  opts.qty--;
      if (action === 'plus'  && opts.qty < 99) opts.qty++;
      const qtyEl = document.getElementById(`item-qty-${idx}`);
      if (qtyEl) qtyEl.textContent = opts.qty;
    });
  });
}

/* ── 유효성 검사 ── */
function validateOptions() {
  if (!currentProduct) return false;
  for (let i = 0; i < currentProduct.items.length; i++) {
    if (!state.itemOptions[i]?.size) {
      showToast(`[${currentProduct.items[i].name}] 사이즈를 선택해주세요.`);
      return false;
    }
  }
  return true;
}

/* ── 카트 아이템 빌드 ─────────────────────────────────────────────────
   cart item ID: `${productId}:${itemIndex}`
   UUID 기반 상품 ID에 대응. 기존 p.id * 100 + i 공식 대체.
─────────────────────────────────────────────────────────────────────── */
function buildCartItems() {
  if (!currentProduct) return [];
  return currentProduct.items.map((item, i) => ({
    id:            `${currentProduct.id}:${i}`,
    name:          item.name,
    price:         item.price || currentProduct.price,
    originalPrice: item.price || currentProduct.originalPrice,
    color:         state.itemOptions[i].color,
    size:          state.itemOptions[i].size,
    qty:           state.itemOptions[i].qty,
    image:         item.image || currentProduct.image,
  }));
}

/* ── 액션 버튼 ── */
function initActions() {
  // 장바구니 담기
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    if (!validateOptions()) return;
    buildCartItems().forEach(item => Cart.addItem(item));
  });

  // 바로 구매
  document.getElementById('buy-btn')?.addEventListener('click', () => {
    if (!validateOptions()) return;
    buildCartItems().forEach(item => Cart.addItem(item));
    window.location.href = 'checkout.html';
  });

  // AI 피팅
  document.getElementById('ai-btn')?.addEventListener('click', () => {
    if (!currentProduct) return;
    sessionStorage.setItem('spoffy_fit_product', JSON.stringify({
      id:    currentProduct.id,
      name:  currentProduct.name,
      image: currentProduct.image,
    }));
    window.location.href = 'ai-fitting.html';
  });

  // 위시리스트
  document.getElementById('wish-btn')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const wished = Wishlist.toggle(currentProduct);
    const btn = document.getElementById('wish-btn');
    btn.classList.toggle('is-wish', wished);
    btn.textContent = wished ? '♥' : '♡';
  });
}

/* ── 썸네일 선택 ── */
function selectThumb(idx) {
  document.querySelectorAll('.thumb-item')
    .forEach((t, i) => t.classList.toggle('active', i === idx));
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  initActions();  // 이벤트 리스너 즉시 등록
  loadProduct();  // 비동기 fetch 시작 → 완료 후 renderProductUI 호출
});
