/* ========================================
   SPOFFY - 회원가입 페이지 (signup.js)
   ======================================== */

'use strict';

let idChecked = false;

/* ── 아이디 중복 확인 ── */
function initIdCheck() {
  document.getElementById('check-id-btn')?.addEventListener('click', () => {
    const id = document.getElementById('su-id')?.value.trim();
    const msgEl = document.getElementById('su-id-msg');
    const okEl = document.getElementById('su-id-ok');
    msgEl.classList.add('hidden');
    okEl.classList.add('hidden');
    idChecked = false;

    if (!id) {
      msgEl.textContent = '이메일을 먼저 입력해주세요.';
      msgEl.classList.remove('hidden');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(id)) {
      msgEl.textContent = '올바른 이메일 형식을 입력해주세요.';
      msgEl.classList.remove('hidden');
      return;
    }
    // Demo: 항상 사용 가능
    idChecked = true;
    okEl.classList.remove('hidden');
    showToast('사용 가능한 이메일입니다.');
  });
}

/* ── 전체 동의 ── */
function initAllAgree() {
  const allChk = document.getElementById('agree-all');
  const items = document.querySelectorAll('.term-item');

  allChk?.addEventListener('change', () => {
    items.forEach(c => { c.checked = allChk.checked; });
  });
  items.forEach(c => {
    c.addEventListener('change', () => {
      allChk.checked = [...items].every(i => i.checked);
    });
  });
}

/* ── 주소 검색 (데모) ── */
function initAddrSearch() {
  document.getElementById('addr-search-btn')?.addEventListener('click', () => {
    showToast('주소 검색은 실제 환경에서 카카오 API를 연동합니다.');
    document.getElementById('su-postcode').value = '06236';
    document.getElementById('su-addr').value = '서울특별시 강남구 테헤란로 152';
  });
}

/* ── Validation ── */
function validateSignup() {
  let valid = true;

  const show = (id, msg) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
    valid = false;
  };
  const hide = id => document.getElementById(id)?.classList.add('hidden');

  ['su-id-msg','su-pw-msg','su-pw2-msg','su-name-msg','su-tel-msg','terms-msg'].forEach(hide);

  const id = document.getElementById('su-id')?.value.trim();
  const pw = document.getElementById('su-pw')?.value;
  const pw2 = document.getElementById('su-pw2')?.value;
  const name = document.getElementById('su-name')?.value.trim();
  const tel = document.getElementById('su-tel')?.value.trim();
  const required = [...document.querySelectorAll('.term-item[data-required]')];

  if (!id || !/\S+@\S+\.\S+/.test(id)) show('su-id-msg', '올바른 이메일을 입력해주세요.');
  else if (!idChecked) show('su-id-msg', '이메일 중복 확인을 해주세요.');

  if (!pw || pw.length < 8) show('su-pw-msg', '비밀번호는 8자 이상이어야 합니다.');
  if (pw !== pw2) show('su-pw2-msg', '비밀번호가 일치하지 않습니다.');

  if (!name) show('su-name-msg', '이름을 입력해주세요.');
  if (!tel || !/^01[0-9]-?\d{3,4}-?\d{4}$/.test(tel)) show('su-tel-msg', '올바른 전화번호를 입력해주세요.');

  if (!required.every(c => c.checked)) show('terms-msg', '필수 약관에 동의해주세요.');

  return valid;
}

/* ── Form submit ── */
function initSignupForm() {
  document.getElementById('signup-form')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateSignup()) return;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '처리 중...';
    btn.disabled = true;

    setTimeout(() => {
      const id = document.getElementById('su-id')?.value.trim();
      const name = document.getElementById('su-name')?.value.trim();
      Auth.setUser({ email: id, name });
      showToast('회원가입이 완료되었습니다!');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIdCheck();
  initAllAgree();
  initAddrSearch();
  initSignupForm();
});
