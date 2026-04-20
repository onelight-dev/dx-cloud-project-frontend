/* ========================================
   SPOFFY - 로그인 페이지 (login.js)
   ======================================== */

'use strict';

/* ── Password toggle ── */
function initPwToggle() {
  const toggle = document.getElementById('pw-toggle');
  const input = document.getElementById('login-pw');
  toggle?.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? '🙈' : '👁';
  });
}

/* ── Saved ID restore ── */
function restoreSavedId() {
  const savedId = localStorage.getItem('spoffy_saved_id');
  const saveIdEl = document.getElementById('save-id');
  if (savedId) {
    const idInput = document.getElementById('login-id');
    if (idInput) idInput.value = savedId;
    if (saveIdEl) saveIdEl.checked = true;
  }
}

/* ── Form validation ── */
function validateForm(id, pw) {
  let valid = true;
  const idError = document.getElementById('id-error');
  const pwError = document.getElementById('pw-error');
  const idInput = document.getElementById('login-id');
  const pwInput = document.getElementById('login-pw');

  idError.classList.add('hidden');
  pwError.classList.add('hidden');
  idInput.classList.remove('error');
  pwInput.classList.remove('error');

  if (!id) {
    idError.textContent = '아이디(이메일)를 입력해주세요.';
    idError.classList.remove('hidden');
    idInput.classList.add('error');
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(id)) {
    idError.textContent = '올바른 이메일 형식을 입력해주세요.';
    idError.classList.remove('hidden');
    idInput.classList.add('error');
    valid = false;
  }

  if (!pw) {
    pwError.textContent = '비밀번호를 입력해주세요.';
    pwError.classList.remove('hidden');
    pwInput.classList.add('error');
    valid = false;
  }

  return valid;
}

/* ── Login submit ── */
function initLoginForm() {
  const form = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  form?.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('login-id')?.value.trim();
    const pw = document.getElementById('login-pw')?.value;
    const saveId = document.getElementById('save-id')?.checked;
    const autoLogin = document.getElementById('auto-login')?.checked;

    if (!validateForm(id, pw)) return;

    loginError.classList.add('hidden');

    // Demo: 어떤 이메일/패스워드든 로그인 허용
    if (saveId) {
      localStorage.setItem('spoffy_saved_id', id);
    } else {
      localStorage.removeItem('spoffy_saved_id');
    }

    // Simulate login
    const btn = document.getElementById('login-btn');
    btn.textContent = '로그인 중...';
    btn.disabled = true;

    setTimeout(() => {
      Auth.setUser({ email: id, name: id.split('@')[0], autoLogin });
      showToast('로그인되었습니다.');

      // Redirect to pending page or home
      const redirect = sessionStorage.getItem('spoffy_redirect');
      sessionStorage.removeItem('spoffy_redirect');
      setTimeout(() => {
        window.location.href = redirect || 'index.html';
      }, 600);
    }, 800);
  });
}

/* ── Google login (demo) ── */
function initSocialLogin() {
  document.getElementById('google-btn')?.addEventListener('click', () => {
    showToast('Google 로그인은 데모에서 지원되지 않습니다.');
  });
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }
  initPwToggle();
  restoreSavedId();
  initLoginForm();
  initSocialLogin();
});
