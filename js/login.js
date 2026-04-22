/* ========================================
   SPOFFY - 로그인 페이지 (login.js)
   ======================================== */

'use strict';

/* ── API 엔드포인트 ── */
const AUTH_BASE = `${CONFIG.BASE_URL}/auth`;

/* ── Password toggle ── */
function initPwToggle() {
  const toggle = document.getElementById('pw-toggle');
  const input  = document.getElementById('login-pw');
  toggle?.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? '🙈' : '👁';
  });
}

/* ── Saved ID restore ── */
function restoreSavedId() {
  const savedId  = localStorage.getItem('spoffy_saved_id');
  const saveIdEl = document.getElementById('save-id');
  if (savedId) {
    const idInput = document.getElementById('login-id');
    if (idInput)  idInput.value  = savedId;
    if (saveIdEl) saveIdEl.checked = true;
  }
}

/* ── Form validation ── */
function validateForm(id, pw) {
  let valid       = true;
  const idError   = document.getElementById('id-error');
  const pwError   = document.getElementById('pw-error');
  const idInput   = document.getElementById('login-id');
  const pwInput   = document.getElementById('login-pw');

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
  const form       = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const id        = document.getElementById('login-id')?.value.trim();
    const pw        = document.getElementById('login-pw')?.value;
    const saveId    = document.getElementById('save-id')?.checked;
    // auto-login 체크박스 UI 유지 (백엔드 정책 연동 대기)

    if (!validateForm(id, pw)) return;

    loginError.classList.add('hidden');

    /* ── 아이디 저장 처리 ── */
    if (saveId) {
      localStorage.setItem('spoffy_saved_id', id);
    } else {
      localStorage.removeItem('spoffy_saved_id');
    }

    /* ── 버튼 로딩 상태 ── */
    const btn      = document.getElementById('login-btn');
    const origText = btn.textContent;
    btn.disabled   = true;
    btn.textContent = '로그인 중...';

    try {
      /* ── 1. 로그인 API 호출 ── */
      const loginRes = await fetch(`${AUTH_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: id, password: pw }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        const msg = loginData?.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
        loginError.textContent = msg;
        loginError.classList.remove('hidden');
        return;
      }

      /* ── 2. 토큰 저장 ── */
      if (loginData.accessToken) {
        localStorage.setItem('spoffy_access_token',  loginData.accessToken);
      }
      if (loginData.refreshToken) {
        localStorage.setItem('spoffy_refresh_token', loginData.refreshToken);
      }

      /* ── 3. 사용자 정보 조회 (/users/me) ── */
      try {
        const meRes = await fetch(`${AUTH_BASE}/users/me`, {
          headers: { 'Authorization': `Bearer ${loginData.accessToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          Auth.setUser(meData);
        }
      } catch {
        /* /users/me 실패해도 토큰은 저장됨 — 로그인 흐름 유지 */
      }

      /* ── 4. 리다이렉트 ── */
      const redirect = sessionStorage.getItem('spoffy_redirect');
      sessionStorage.removeItem('spoffy_redirect');
      window.location.href = redirect || 'index.html';

    } catch (err) {
      /* 네트워크 오류 */
      loginError.textContent = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      loginError.classList.remove('hidden');
    } finally {
      /* 버튼 상태 반드시 복원 */
      btn.disabled    = false;
      btn.textContent = origText;
    }
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
  if (Auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }
  initPwToggle();
  restoreSavedId();
  initLoginForm();
  initSocialLogin();
});
