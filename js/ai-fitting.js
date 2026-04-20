/* ========================================
   SPOFFY - AI 피팅 페이지 (ai-fitting.js)
   ======================================== */

'use strict';

let fitsRemaining = 5;
let faceUploaded = false;
let bodyUploaded = false;

/* ── Load connected product ── */
function loadFitProduct() {
  let product = null;
  try { product = JSON.parse(sessionStorage.getItem('spoffy_fit_product')); } catch {}

  const nameEl = document.getElementById('fit-product-name');
  const thumbEl = document.getElementById('fit-product-thumb');
  const colorSel = document.getElementById('fit-color');

  if (product) {
    if (nameEl) nameEl.textContent = product.name;
    if (thumbEl && product.image) {
      thumbEl.innerHTML = `<img src="${product.image}" alt="${product.name}"/>`;
    }
    if (colorSel) {
      colorSel.innerHTML = ['블랙', '차콜', '화이트'].map(c => `<option>${c}</option>`).join('');
    }
  } else {
    if (nameEl) nameEl.textContent = '모노톤 셋업 코디 세트 (기본)';
    if (thumbEl) thumbEl.innerHTML = `<img src="image/모노톤 셋업 코디 세트.png" alt="기본 상품"/>`;
    if (colorSel) colorSel.innerHTML = ['블랙','차콜','화이트'].map(c=>`<option>${c}</option>`).join('');
  }
}

/* ── File upload handlers ── */
function setPreview(previewId, statusId, file, type) {
  const preview = document.getElementById(previewId);
  const status = document.getElementById(statusId);
  if (!preview) return;

  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="${type === 'face' ? '정면' : '전신'} 사진"/>`;
    preview.classList.add('has-img');
    if (status) {
      status.textContent = '업로드 완료 ✓';
      status.className = 'upload-status';
      status.classList.remove('hidden');
    }
    if (type === 'face') faceUploaded = true;
    else bodyUploaded = true;
  };
  reader.readAsDataURL(file);
}

function initUploads() {
  // Face file input
  document.getElementById('face-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) setPreview('preview-face', 'face-status', file, 'face');
  });

  // Body file input
  document.getElementById('body-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) setPreview('preview-body', 'body-status', file, 'body');
  });

  // Sample buttons
  document.getElementById('face-sample-btn')?.addEventListener('click', () => {
    const preview = document.getElementById('preview-face');
    const status = document.getElementById('face-status');
    if (preview) {
      preview.innerHTML = `<img src="image/ai_fit_face.png" alt="샘플 정면 사진"/>`;
      preview.classList.add('has-img');
    }
    if (status) { status.textContent = '샘플 이미지 적용 ✓'; status.className = 'upload-status'; status.classList.remove('hidden'); }
    faceUploaded = true;
    showToast('샘플 정면 사진이 적용되었습니다.');
  });

  document.getElementById('body-sample-btn')?.addEventListener('click', () => {
    const preview = document.getElementById('preview-body');
    const status = document.getElementById('body-status');
    if (preview) {
      preview.innerHTML = `<img src="image/ai_fit_body.png" alt="샘플 전신 사진"/>`;
      preview.classList.add('has-img');
    }
    if (status) { status.textContent = '샘플 이미지 적용 ✓'; status.className = 'upload-status'; status.classList.remove('hidden'); }
    bodyUploaded = true;
    showToast('샘플 전신 사진이 적용되었습니다.');
  });
}

/* ── Generate fitting ── */
function startFitting() {
  if (!faceUploaded) { showToast('정면 사진을 업로드해주세요.'); return; }
  if (!bodyUploaded) { showToast('전신 사진을 업로드해주세요.'); return; }
  if (fitsRemaining <= 0) { showToast('이용 횟수가 모두 소진되었습니다.'); return; }

  // Show loading
  document.getElementById('fit-loading')?.classList.remove('hidden');
  document.getElementById('fit-result')?.classList.add('hidden');
  document.getElementById('fit-placeholder')?.classList.add('hidden');
  document.getElementById('start-fit-btn').disabled = true;

  // Animate loading dots
  let dots = 0;
  const dotEl = document.getElementById('loading-dots');
  const dotTimer = setInterval(() => {
    dots = (dots + 1) % 4;
    if (dotEl) dotEl.textContent = '.'.repeat(dots + 1);
  }, 500);

  // Simulate generation (10s)
  setTimeout(() => {
    clearInterval(dotTimer);
    fitsRemaining--;
    document.getElementById('fit-count').textContent = `${fitsRemaining}회`;
    showResult();
  }, 10000);
}

/* ── Show result ── */
function showResult() {
  document.getElementById('fit-loading')?.classList.add('hidden');
  document.getElementById('fit-result')?.classList.remove('hidden');
  document.getElementById('start-fit-btn').disabled = false;

  const resultShot = document.getElementById('result-shot');
  if (resultShot) {
    resultShot.innerHTML = `<img src="image/ai_fit_result.png" alt="AI 피팅 결과"/>`;
  }
  showToast('AI 피팅이 완료되었습니다!');
}

/* ── Result action buttons ── */
function initResultActions() {
  document.getElementById('fit-cart-btn')?.addEventListener('click', () => {
    let product = null;
    try { product = JSON.parse(sessionStorage.getItem('spoffy_fit_product')); } catch {}
    Cart.addItem({
      id: product?.id || 1,
      name: product?.name || '모노톤 셋업 코디 세트',
      price: 128000,
      originalPrice: 168000,
      color: document.getElementById('fit-color')?.value || '블랙',
      size: document.getElementById('fit-size')?.value || 'M',
      qty: 1,
      image: product?.image || 'image/모노톤 셋업 코디 세트.png',
    });
  });

  document.getElementById('fit-buy-btn')?.addEventListener('click', () => {
    let product = null;
    try { product = JSON.parse(sessionStorage.getItem('spoffy_fit_product')); } catch {}
    Cart.addItem({
      id: product?.id || 1,
      name: product?.name || '모노톤 셋업 코디 세트',
      price: 128000, originalPrice: 168000,
      color: document.getElementById('fit-color')?.value || '블랙',
      size: document.getElementById('fit-size')?.value || 'M',
      qty: 1,
      image: product?.image || null,
    });
    window.location.href = 'checkout.html';
  });

  document.getElementById('fit-save-btn')?.addEventListener('click', () => showToast('이미지가 저장되었습니다.'));
  document.getElementById('fit-share-btn')?.addEventListener('click', () => showToast('공유 링크가 복사되었습니다.'));
  document.getElementById('fit-wish-btn')?.addEventListener('click', () => {
    let product = null;
    try { product = JSON.parse(sessionStorage.getItem('spoffy_fit_product')); } catch {}
    Wishlist.toggle(product || { id: 1, name: '모노톤 셋업 코디 세트' });
  });
  document.getElementById('fit-retry-icon')?.addEventListener('click', startFitting);
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    document.getElementById('fit-result')?.classList.add('hidden');
    document.getElementById('fit-placeholder')?.classList.remove('hidden');
  });
}

/* ── Start button ── */
function initStartBtn() {
  document.getElementById('start-fit-btn')?.addEventListener('click', startFitting);
}

document.addEventListener('DOMContentLoaded', () => {
  loadFitProduct();
  initUploads();
  initStartBtn();
  initResultActions();
});
