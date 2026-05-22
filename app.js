/* ===================================================
   Ruby Pet Shop — app.js
=================================================== */

/* =============================================
   AUTH STATE & MOCK USERS
============================================= */
const MOCK_USERS = {
  user: {
    id: 'u001',
    name: 'คุณมาลี สุขใจ',
    email: 'malee@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Malee&backgroundColor=ffb347',
    role: 'user',
    orders: [
      {
        id: 'ORD-2026-001', date: '18 พ.ค. 2026',
        status: 'delivered', total: 1589,
        products: 'Royal Canin 15kg, ขนม Dentastix',
        workflow: ['pending','paid','preparing','shipped','delivered']
      },
      {
        id: 'ORD-2026-002', date: '20 พ.ค. 2026',
        status: 'shipped', total: 299,
        products: 'Whiskas ปลาแซลมอน 1.2kg',
        workflow: ['pending','paid','preparing','shipped','delivered']
      },
      {
        id: 'ORD-2026-003', date: '20 พ.ค. 2026',
        status: 'preparing', total: 790,
        products: 'Kong Classic M, ของเล่นแมว',
        workflow: ['pending','paid','preparing','shipped','delivered']
      }
    ]
  },
  admin: {
    id: 'a001',
    name: 'แอดมิน Ruby',
    email: 'admin@rubypet.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RubyAdmin&backgroundColor=ff7043',
    role: 'admin',
    orders: []
  }
};

let currentUser = null;

/* ── Build user object from Supabase Auth + Profile ─── */
function buildUserFromSupabase(sbUser, profile) {
  // OAuth providers (Google/Facebook) store name & avatar in user_metadata
  const meta      = sbUser.user_metadata || {};
  const fullName  = meta.full_name || meta.name || '';
  const metaParts = fullName.split(' ');

  const firstName = profile.first_name || meta.given_name  || metaParts[0] || '';
  const lastName  = profile.last_name  || meta.family_name || metaParts.slice(1).join(' ') || '';

  // Use Google/Facebook avatar if available, else DiceBear
  const avatar = meta.avatar_url || meta.picture ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.avatar_seed || 'Malee')}&backgroundColor=ffb347`;

  const user = {
    id:          sbUser.id,
    name:        (`${firstName} ${lastName}`).trim() || sbUser.email.split('@')[0],
    firstName,
    lastName,
    email:       sbUser.email,
    avatar,
    avatarSeed:  profile.avatar_seed || 'Malee',
    role:        profile.role   || 'user',
    phone:       profile.phone  || '',
    dob:         profile.dob    || '',
    gender:      profile.gender || '',
    extraPoints: profile.extra_points || 0,
    orders:      [],
    pets:        [],
  };

  // Auto-save profile to Supabase if name came from OAuth (profile was empty)
  if (!profile.first_name && firstName && typeof DB !== 'undefined') {
    DB.upsertProfile(sbUser.id, {
      first_name: firstName,
      last_name:  lastName,
    }).catch(() => {});
  }

  return user;
}

const WORKFLOW_STEPS = [
  { key: 'pending',   label: 'รอชำระ',   icon: '⏳' },
  { key: 'paid',      label: 'ชำระแล้ว', icon: '💳' },
  { key: 'preparing', label: 'จัดเตรียม', icon: '📦' },
  { key: 'shipped',   label: 'จัดส่งแล้ว', icon: '🚚' },
  { key: 'delivered', label: 'ได้รับแล้ว', icon: '✅' },
];

const STATUS_TEXT = {
  pending:   'รอชำระเงิน',
  paid:      'ชำระเงินแล้ว',
  preparing: 'กำลังจัดเตรียม',
  shipped:   'จัดส่งแล้ว',
  delivered: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

/* Auth Selectors */
const loginBtn         = document.getElementById('loginBtn');
const loginOverlay     = document.getElementById('loginOverlay');
const loginModalClose  = document.getElementById('loginModalClose');
const userMenu         = document.getElementById('userMenu');
const userAvatarBtn    = document.getElementById('userAvatarBtn');
const userDropdown     = document.getElementById('userDropdown');
const userAvatar       = document.getElementById('userAvatar');
const userName         = document.getElementById('userName');
const adminLink        = document.getElementById('adminLink');
const logoutBtn        = document.getElementById('logoutBtn');
const myOrdersLink     = document.getElementById('myOrdersLink');
const dropdownHeader   = document.getElementById('dropdownHeader');
const googleLoginBtn   = document.getElementById('googleLoginBtn');
const facebookLoginBtn = document.getElementById('facebookLoginBtn');
const emailLoginForm   = document.getElementById('emailLoginForm');
const togglePwd        = document.getElementById('togglePwd');
const demoBtns         = document.querySelectorAll('.demo-btn');
const ordersOverlay    = document.getElementById('ordersOverlay');
const ordersModalClose = document.getElementById('ordersModalClose');
const ordersList       = document.getElementById('ordersList');

/* Open/close login modal */
function openLoginModal(tab) {
  loginOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (tab) switchModalTab(tab);
}
function closeLoginModal() {
  loginOverlay.classList.remove('open');
  document.body.style.overflow = '';
  resetRegisterForm();
}

loginBtn?.addEventListener('click', () => openLoginModal('login'));
loginModalClose?.addEventListener('click', closeLoginModal);
loginOverlay?.addEventListener('click', e => { if (e.target === loginOverlay) closeLoginModal(); });

/* =============================================
   MODAL TAB SWITCHER
============================================= */
function switchModalTab(tabName) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-panel').forEach(p => p.classList.remove('active'));

  const activeTab   = document.querySelector(`.modal-tab[data-tab="${tabName}"]`);
  const activePanel = document.getElementById(`panel${tabName.charAt(0).toUpperCase()}${tabName.slice(1)}`);
  if (activeTab)   activeTab.classList.add('active');
  if (activePanel) activePanel.classList.add('active');

  // Slide the indicator
  const slider = document.getElementById('modalTabSlider');
  const tabs    = document.querySelectorAll('.modal-tab');
  if (slider && tabs.length) {
    const idx     = Array.from(tabs).findIndex(t => t.dataset.tab === tabName);
    const pct     = (idx / tabs.length) * 100;
    slider.style.left  = `${pct}%`;
    slider.style.width = `${100 / tabs.length}%`;
    // Account for padding (36px on each side)
    slider.style.left  = `calc(${pct}% + ${idx === 0 ? 36 : -36}px)`;
    slider.style.width = `calc(50% - 36px)`;
  }

  // Focus first input
  const panel = document.getElementById(`panel${tabName.charAt(0).toUpperCase()}${tabName.slice(1)}`);
  setTimeout(() => panel?.querySelector('input')?.focus(), 50);
}

// Tab click events
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => switchModalTab(tab.dataset.tab));
});

// Init slider position
setTimeout(() => {
  const slider = document.getElementById('modalTabSlider');
  if (slider) { slider.style.left = '36px'; slider.style.width = 'calc(50% - 36px)'; }
}, 0);

// Cross-links
document.getElementById('goRegister')?.addEventListener('click', e => {
  e.preventDefault(); switchModalTab('register');
});
document.getElementById('goLogin')?.addEventListener('click', e => {
  e.preventDefault(); switchModalTab('login');
});

/* Google / Facebook Mock Login */
function simulateSocialLogin(provider, role = 'user') {
  showToast(`⏳ กำลังเชื่อมต่อ ${provider}...`);
  setTimeout(() => {
    login(MOCK_USERS[role]);
    closeLoginModal();
    showToast(`✅ เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${MOCK_USERS[role].name}!`);
  }, 1200);
}

googleLoginBtn?.addEventListener('click', async () => {
  googleLoginBtn.textContent = '⏳ กำลังเชื่อมต่อ Google...';
  googleLoginBtn.disabled = true;
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
  if (error) {
    showToast('❌ ไม่สามารถเชื่อมต่อ Google ได้ค่ะ');
    googleLoginBtn.textContent = 'G  เข้าสู่ระบบด้วย Google';
    googleLoginBtn.disabled = false;
  }
});

facebookLoginBtn?.addEventListener('click', async () => {
  facebookLoginBtn.innerHTML = '⏳ กำลังเชื่อมต่อ Facebook...';
  facebookLoginBtn.disabled = true;
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
  if (error) {
    showToast('❌ ไม่สามารถเชื่อมต่อ Facebook ได้ค่ะ');
    facebookLoginBtn.innerHTML = 'f  เข้าสู่ระบบด้วย Facebook';
    facebookLoginBtn.disabled = false;
  }
});

/* Email form login — Supabase Auth */
emailLoginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pwd   = document.getElementById('loginPassword').value;
  if (!email || !pwd) { showToast('⚠️ กรุณากรอกอีเมลและรหัสผ่าน'); return; }

  const btn = emailLoginForm.querySelector('button[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ กำลังตรวจสอบ...'; }

  const { data, error } = await DB.signIn(email, pwd);
  if (btn) { btn.disabled = false; btn.textContent = '🔑 เข้าสู่ระบบ'; }

  if (error) {
    const msgMap = {
      'Invalid login credentials':  'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      'Email not confirmed':        'กรุณายืนยันอีเมลจากกล่องจดหมายก่อนค่ะ',
      'Too many requests':          'ลองใหม่อีกครั้งในอีกสักครู่ค่ะ',
    };
    showToast(`❌ ${msgMap[error.message] || error.message}`);
    return;
  }

  const { data: profile } = await DB.getProfile(data.user.id);
  const user = buildUserFromSupabase(data.user, profile || {});
  login(user);
  closeLoginModal();
  showToast(`✅ ยินดีต้อนรับกลับ ${user.name.split(' ')[0]}!`);
});

/* Demo quick login */
demoBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const role = btn.dataset.role;
    login(MOCK_USERS[role]);
    closeLoginModal();
    showToast(`✅ Demo login: ${MOCK_USERS[role].name}`);
  });
});

/* Toggle password visibility — Login */
togglePwd?.addEventListener('click', () => {
  const input = document.getElementById('loginPassword');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  togglePwd.textContent = isText ? '👁' : '🙈';
});

/* Login form — inline validation */
emailLoginForm?.addEventListener('input', e => {
  const el = e.target;
  const errEl = document.getElementById(`err-${el.id}`);
  if (!errEl) return;
  if (el.id === 'loginEmail' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
    errEl.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
    el.classList.add('error'); el.classList.remove('valid');
  } else if (el.value) {
    errEl.textContent = '';
    el.classList.remove('error'); el.classList.add('valid');
  } else {
    errEl.textContent = ''; el.classList.remove('error','valid');
  }
});

/* Forgot password — Supabase reset */
document.getElementById('forgotLink')?.addEventListener('click', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  if (!email) { showToast('⚠️ กรุณากรอกอีเมลในช่องด้านบนก่อนค่ะ'); return; }
  const { error } = await DB.resetPassword(email);
  if (error) { showToast(`❌ ${error.message}`); return; }
  showToast('📧 ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้วค่ะ กรุณาตรวจสอบกล่องจดหมาย');
});

/* =============================================
   REGISTER FORM
============================================= */
const registerForm = document.getElementById('registerForm');

/* Password strength meter */
function calcPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

function updateStrengthUI(score) {
  const segs   = ['pbs1','pbs2','pbs3','pbs4'].map(id => document.getElementById(id));
  const label  = document.getElementById('pwdLabel');
  const colors = ['weak','fair','good','strong'];
  const labels = ['อ่อน','พอใช้','ดี','แข็งแกร่ง'];
  const textColors = ['#e53935','#FF9800','#2196F3','#4CAF82'];

  segs.forEach((seg, i) => {
    if (!seg) return;
    seg.className = 'pwd-bar-seg';
    if (i < score) seg.classList.add(colors[score - 1]);
  });

  if (label) {
    label.textContent  = score > 0 ? labels[score - 1] : '';
    label.style.color  = score > 0 ? textColors[score - 1] : '';
  }
}

document.getElementById('regPassword')?.addEventListener('input', e => {
  const pwd = e.target.value;
  updateStrengthUI(pwd ? calcPasswordStrength(pwd) : 0);

  // Live match check
  const conf    = document.getElementById('regPasswordConfirm');
  const confErr = document.getElementById('err-regPasswordConfirm');
  if (conf?.value && confErr) {
    confErr.textContent = conf.value === pwd ? '' : 'รหัสผ่านไม่ตรงกัน';
    conf.classList.toggle('error', conf.value !== pwd);
  }
});

/* Toggle visibility — register */
function bindTogglePwd(btnId, inputId) {
  document.getElementById(btnId)?.addEventListener('click', () => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    document.getElementById(btnId).textContent = isText ? '👁' : '🙈';
  });
}
bindTogglePwd('toggleRegPwd', 'regPassword');
bindTogglePwd('toggleRegPwdConf', 'regPasswordConfirm');

/* Register validation */
function validateRegister() {
  const fields = [
    { id:'regFirstName', msg:'กรุณากรอกชื่อ' },
    { id:'regLastName',  msg:'กรุณากรอกนามสกุล' },
    { id:'regEmail',     msg:'กรุณากรอกอีเมล' },
    { id:'regPassword',  msg:'กรุณากรอกรหัสผ่าน' },
    { id:'regPasswordConfirm', msg:'กรุณายืนยันรหัสผ่าน' },
  ];
  let valid = true;

  fields.forEach(({ id, msg }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    if (!el) return;
    const val = el.value.trim();

    let errMsg = '';
    if (!val) {
      errMsg = msg;
    } else if (id === 'regEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errMsg = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (id === 'regPassword' && val.length < 8) {
      errMsg = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    } else if (id === 'regPasswordConfirm') {
      const pwd = document.getElementById('regPassword')?.value || '';
      if (val !== pwd) errMsg = 'รหัสผ่านไม่ตรงกัน';
    }

    if (errMsg) {
      el.classList.add('error'); el.classList.remove('valid');
      if (err) err.textContent = errMsg;
      valid = false;
    } else {
      el.classList.remove('error'); el.classList.add('valid');
      if (err) err.textContent = '';
    }
  });

  // Terms checkbox
  const terms    = document.getElementById('regTerms');
  const termsErr = document.getElementById('err-regTerms');
  if (terms && !terms.checked) {
    if (termsErr) termsErr.textContent = 'กรุณายอมรับข้อกำหนดและเงื่อนไข';
    valid = false;
  } else if (termsErr) {
    termsErr.textContent = '';
  }

  return valid;
}

/* Live inline validation on blur */
registerForm?.addEventListener('focusout', e => {
  const el = e.target;
  if (!el.id || !el.id.startsWith('reg')) return;
  const err = document.getElementById(`err-${el.id}`);
  if (!err) return;

  const val = el.value.trim();
  if (!val && el.required !== false) {
    err.textContent = 'กรุณากรอกข้อมูลนี้';
    el.classList.add('error');
  } else if (el.id === 'regEmail' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    err.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
    el.classList.add('error');
  } else if (el.id === 'regPassword' && val && val.length < 8) {
    err.textContent = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    el.classList.add('error');
  } else if (el.id === 'regPasswordConfirm' && val) {
    const pwd = document.getElementById('regPassword')?.value || '';
    if (val !== pwd) { err.textContent = 'รหัสผ่านไม่ตรงกัน'; el.classList.add('error'); }
    else             { err.textContent = ''; el.classList.remove('error'); el.classList.add('valid'); }
  } else if (val) {
    err.textContent = ''; el.classList.remove('error'); el.classList.add('valid');
  }
});

/* Register submit — Supabase Auth */
registerForm?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateRegister()) return;

  const btn       = document.getElementById('registerBtn');
  const firstName = document.getElementById('regFirstName')?.value.trim() || '';
  const lastName  = document.getElementById('regLastName')?.value.trim()  || '';
  const email     = document.getElementById('regEmail')?.value.trim()     || '';
  const password  = document.getElementById('regPassword')?.value         || '';

  if (btn) { btn.textContent = '⏳ กำลังสมัครสมาชิก...'; btn.disabled = true; }

  const { data, error } = await DB.signUp(email, password, { first_name: firstName, last_name: lastName });

  if (error) {
    const msgMap = {
      'User already registered': 'อีเมลนี้มีบัญชีอยู่แล้วค่ะ กรุณาเข้าสู่ระบบ',
      'Password should be at least 6 characters': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรค่ะ',
    };
    showToast(`❌ ${msgMap[error.message] || error.message}`);
    if (btn) { btn.textContent = '🐾 สมัครสมาชิกฟรี'; btn.disabled = false; }
    return;
  }

  // Build user from response (profile will be auto-created by DB trigger)
  const user = buildUserFromSupabase(data.user, {
    first_name: firstName, last_name: lastName, role: 'user', extra_points: 0
  });
  login(user);
  closeLoginModal();
  showToast(`🎉 ยินดีต้อนรับ ${firstName}! กรุณายืนยันอีเมลด้วยนะคะ`);
  if (btn) { btn.textContent = '🐾 สมัครสมาชิกฟรี'; btn.disabled = false; }
});

/* Reset register form on close */
function resetRegisterForm() {
  const form = document.getElementById('registerForm');
  if (form) form.reset();
  document.querySelectorAll('#registerForm .field-err').forEach(el => el.textContent = '');
  document.querySelectorAll('#registerForm input').forEach(el => el.classList.remove('error','valid'));
  updateStrengthUI(0);
}

/* Login / Logout logic */
function login(user) {
  currentUser = user;
  // Persist to localStorage
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* quota */ }

  if (!loginBtn || !userMenu) return;
  loginBtn.style.display = 'none';
  userMenu.style.display = 'flex';
  if (userAvatar) {
    userAvatar.src = user.avatar || '';
    userAvatar.onerror = () => {
      userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF7043&color=fff`;
    };
  }
  if (userName) userName.textContent = user.name.split(' ')[0];
  if (dropdownHeader) {
    dropdownHeader.innerHTML = `
      <strong>${user.name}</strong>
      <small>${user.email}</small>
      <div class="role-badge ${user.role === 'admin' ? 'role-badge--admin' : 'role-badge--user'}">
        ${user.role === 'admin' ? '⚙️ Admin' : '👤 Member'}
      </div>`;
  }
  if (adminLink) adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
}

async function logout() {
  await DB.signOut();
  currentUser = null;
  localStorage.removeItem(USER_KEY);
  if (loginBtn) loginBtn.style.display = '';
  if (userMenu) userMenu.style.display = 'none';
  userDropdown?.classList.remove('open');
  showToast('👋 ออกจากระบบแล้ว');
}

/* ── Listen to ALL auth state changes (incl. OAuth redirect) ── */
_sb.auth.onAuthStateChange(async (event, session) => {
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    try {
      const { data: profile } = await DB.getProfile(session.user.id);
      const user = buildUserFromSupabase(session.user, profile || {});
      login(user);
    } catch { /* ignore */ }
  } else if (event === 'SIGNED_OUT') {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    if (loginBtn) loginBtn.style.display = '';
    if (userMenu) userMenu.style.display = 'none';
  }
});

/* Restore session on page load — Supabase first, localStorage fallback */
(async function restoreSession() {
  try {
    const session = await DB.getSession();
    if (session) {
      const { data: profile } = await DB.getProfile(session.user.id);
      const user = buildUserFromSupabase(session.user, profile || {});
      login(user);
      return;
    }
  } catch { /* Supabase unavailable, fall through */ }

  // Fallback: localStorage cache (offline / network error)
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return;
    const user = JSON.parse(saved);
    if (user && user.email) login(user);
  } catch { /* ignore */ }
})();

logoutBtn?.addEventListener('click', logout);

/* Toggle user dropdown */
userAvatarBtn?.addEventListener('click', e => {
  e.stopPropagation();
  userDropdown.classList.toggle('open');
});
document.addEventListener('click', () => userDropdown?.classList.remove('open'));
userDropdown?.addEventListener('click', e => e.stopPropagation());

/* My Orders Modal */
myOrdersLink?.addEventListener('click', e => {
  e.preventDefault();
  if (!currentUser) return;
  userDropdown.classList.remove('open');
  renderOrders();
  ordersOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});
ordersModalClose?.addEventListener('click', () => {
  ordersOverlay.classList.remove('open');
  document.body.style.overflow = '';
});
ordersOverlay?.addEventListener('click', e => {
  if (e.target === ordersOverlay) {
    ordersOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
});

function renderOrders() {
  if (!currentUser || !currentUser.orders.length) {
    ordersList.innerHTML = `
      <div style="text-align:center;padding:48px 0;color:var(--muted)">
        <div style="font-size:56px;margin-bottom:12px">📦</div>
        <p style="font-weight:700;font-size:16px">ยังไม่มีคำสั่งซื้อ</p>
        <p style="font-size:14px">เริ่มช้อปสินค้าสำหรับน้องได้เลย!</p>
      </div>`;
    return;
  }
  ordersList.innerHTML = currentUser.orders.map(order => {
    const activeIdx = WORKFLOW_STEPS.findIndex(s => s.key === order.status);
    const steps = WORKFLOW_STEPS.map((step, i) => {
      const cls = i < activeIdx ? 'done' : i === activeIdx ? 'active' : '';
      return `<div class="workflow-step ${cls}">
        <div class="workflow-step__dot">${i < activeIdx ? '✓' : step.icon}</div>
        <div class="workflow-step__label">${step.label}</div>
      </div>`;
    }).join('');
    return `
      <div class="order-item">
        <div class="order-item__header">
          <div>
            <div class="order-item__id">${order.id}</div>
            <div class="order-item__date">📅 ${order.date}</div>
          </div>
          <span class="order-status-badge status--${order.status}">${STATUS_TEXT[order.status]}</span>
          <div class="order-item__total">฿ ${order.total.toLocaleString()}</div>
        </div>
        <div class="order-workflow">${steps}</div>
        <div class="order-item__products">🛍️ ${order.products}</div>
      </div>`;
  }).join('');
}

/* === CART STATE (localStorage-backed) === */
const CART_KEY = 'ruby_cart';
const USER_KEY = 'ruby_user';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let cart = loadCart();

/* === SELECTORS === */
const cartBtn      = document.getElementById('cartBtn');
const mobileCart   = document.getElementById('mobileCart');
const cartClose    = document.getElementById('cartClose');
const cartOverlay  = document.getElementById('cartOverlay');
const cartSidebar  = document.getElementById('cartSidebar');
const cartItems    = document.getElementById('cartItems');
const cartTotal    = document.getElementById('cartTotal');
const cartCount    = document.getElementById('cartCount');
const cartCount2   = document.getElementById('cartCount2');
const searchToggle = document.getElementById('searchToggle');
const searchClose  = document.getElementById('searchClose');
const searchBar    = document.getElementById('searchBar');
const hamburger    = document.getElementById('hamburger');
const navLinks     = document.getElementById('navLinks');
const navbar       = document.getElementById('navbar');
const toast        = document.getElementById('toast');

/* =============================================
   CART FUNCTIONS
============================================= */
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCart() {
  if (!cartItems) return;
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#9E9E9E">
        <div style="font-size:64px;margin-bottom:16px">🛒</div>
        <p style="font-size:16px;font-weight:600">ตะกร้าว่างเลย!</p>
        <p style="font-size:14px">ช้อปสินค้าสุดโปรดสำหรับน้องเลยนะ 🐾</p>
      </div>`;
    if (cartTotal) cartTotal.textContent = '฿ 0';
    updateCartCount();
    return;
  }

  cartItems.innerHTML = cart.map((item, idx) => {
    const imgSrc = item.img || item.image || '';
    const thumb  = imgSrc
      ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"/>`
      : '🐾';
    return `
      <div class="cart-item" data-idx="${idx}">
        <div class="cart-item__thumb" style="width:48px;height:48px;border-radius:10px;background:#f0e8e0;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;overflow:hidden">${thumb}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">฿ ${(item.price * item.qty).toLocaleString()}</div>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-action="del" data-idx="${idx}" aria-label="ลบ">🗑️</button>
      </div>`;
  }).join('');

  // Event delegation — no inline onclick
  cartItems.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      if (action === 'inc') changeQty(idx, 1);
      else if (action === 'dec') changeQty(idx, -1);
      else if (action === 'del') removeItem(idx);
    });
  });

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (cartTotal) cartTotal.textContent = `฿ ${total.toLocaleString()}`;
  updateCartCount();
}

function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) removeItem(idx);
  else { saveCart(); renderCart(); }
}

function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
  showToast('ลบสินค้าออกจากตะกร้าแล้ว');
}

function addToCart(name, price, id, img) {
  const existing = id
    ? cart.find(i => i.id === id)
    : cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: id || `tmp-${Date.now()}`, name, price: parseInt(price), qty: 1, img: img || '' });
  }
  saveCart();
  updateCartCount();
  showToast(`🛒 เพิ่ม "${name}" ลงตะกร้าแล้ว!`);
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  [cartCount, cartCount2].forEach(el => {
    if (el) el.textContent = total;
  });
}

/* =============================================
   TOAST
============================================= */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* =============================================
   ADD TO CART BUTTONS
============================================= */
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const { name, price, id, img } = btn.dataset;
    addToCart(name, price, id, img);
    /* bounce animation */
    const orig = btn.textContent;
    btn.textContent = '✅ เพิ่มแล้ว!';
    btn.style.background = '#4CAF82';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1500);
  });
});

/* =============================================
   CART OPEN/CLOSE EVENTS
============================================= */
[cartBtn, mobileCart].forEach(el => el?.addEventListener('click', openCart));
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

/* Checkout button in cart sidebar */
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  const cart = JSON.parse(localStorage.getItem('ruby_cart') || '[]');
  if (!cart.length) { showToast('⚠️ กรุณาเพิ่มสินค้าก่อนค่ะ'); return; }
  window.location.href = 'checkout.html';
});

/* Promo banner → open Register modal */
document.getElementById('promoRegisterBtn')?.addEventListener('click', e => {
  e.preventDefault();
  openLoginModal('register');
});

/* =============================================
   SEARCH ENGINE — Real-time product search
============================================= */

const SEARCH_CATALOG = [
  { id:'P001', name:'Royal Canin Adult 15kg อาหารสุนัขพันธุ์ใหญ่', brand:'Royal Canin', category:'dog-food', catLabel:'อาหารน้องหมา', price:1290, rating:4.9, sold:1240, emoji:'🐶', tags:['สุนัข','หมา','royal canin','อาหารสุนัข','พันธุ์ใหญ่'] },
  { id:'P002', name:'Whiskas อาหารแมวรสปลาแซลมอน 1.2kg', brand:'Whiskas', category:'cat-food', catLabel:'อาหารน้องแมว', price:299, rating:4.8, sold:980, emoji:'🐱', tags:['แมว','whiskas','ปลาแซลมอน','อาหารแมว'] },
  { id:'P003', name:'Kong Classic ของเล่นยางกรอก ขนาด M', brand:'Kong', category:'dog-toy', catLabel:'ของเล่นน้องหมา', price:490, rating:4.7, sold:620, emoji:'🦴', tags:['kong','ของเล่น','หมา','สุนัข','ยาง'] },
  { id:'P004', name:'ของเล่นไม้ตกปลาแมวพร้อมขนนก', brand:'PetDreamHouse', category:'cat-toy', catLabel:'ของเล่นน้องแมว', price:189, rating:4.9, sold:1450, emoji:'🧶', tags:['ของเล่น','แมว','ขนนก','ไม้ตกปลา'] },
  { id:'P005', name:'Pedigree Dentastix ขนมกัดฟัน 7 ชิ้น', brand:'Pedigree', category:'dog-food', catLabel:'ขนมน้องหมา', price:149, rating:4.5, sold:780, emoji:'🦷', tags:['pedigree','ขนม','กัดฟัน','สุนัข','หมา','dentastix'] },
  { id:'P006', name:'Sheba อาหารแมวเปียก แพ็ค 12 ถุง', brand:'Sheba', category:'cat-food', catLabel:'อาหารน้องแมว', price:259, rating:4.9, sold:2000, emoji:'🐾', tags:['sheba','อาหารเปียก','แมว','แพ็ค'] },
  { id:'P007', name:'Chuckit! Ultra Ball ลูกบอลเทนนิส 2 ลูก', brand:'Chuckit!', category:'dog-toy', catLabel:'ของเล่นน้องหมา', price:350, rating:4.6, sold:370, emoji:'🎾', tags:['chuckit','ลูกบอล','ของเล่น','หมา','สุนัข'] },
  { id:'P008', name:'CatLife บ้านแมวกระดาษลับเล็บพร้อมลูกบอล', brand:'CatLife', category:'cat-toy', catLabel:'ของเล่นน้องแมว', price:599, rating:4.9, sold:1015, emoji:'🏠', tags:['catlife','บ้านแมว','ลับเล็บ','ของเล่น','แมว'] },
];

const RECENT_KEY = 'ruby_recent_search';
const MAX_RECENT  = 6;
let searchFocusIdx = -1;

const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchPanelDef = document.getElementById('searchPanelDefault');
const searchPanelRes = document.getElementById('searchPanelResults');
const searchClear   = document.getElementById('searchClear');

/* open / close */
function openSearch() {
  searchBar.classList.add('open');
  searchResults.classList.add('visible');
  renderDefaultPanel();
  setTimeout(() => searchInput?.focus(), 120);
}
function closeSearch() {
  searchBar.classList.remove('open');
  searchResults.classList.remove('visible');
  if (searchInput) searchInput.value = '';
  if (searchClear) searchClear.style.display = 'none';
  showPanel('default');
  searchFocusIdx = -1;
}

function showPanel(which) {
  if (searchPanelDef) searchPanelDef.style.display = which === 'default' ? '' : 'none';
  if (searchPanelRes) searchPanelRes.style.display = which === 'results' ? '' : 'none';
}

searchToggle?.addEventListener('click', () => {
  if (searchBar.classList.contains('open')) closeSearch();
  else openSearch();
});
document.getElementById('searchClose')?.addEventListener('click', closeSearch);
document.addEventListener('click', e => {
  if (searchBar && !searchBar.contains(e.target) && !searchToggle?.contains(e.target)) closeSearch();
});

/* clear button */
searchClear?.addEventListener('click', () => {
  if (searchInput) { searchInput.value = ''; searchInput.focus(); }
  searchClear.style.display = 'none';
  showPanel('default');
  renderDefaultPanel();
});

/* debounce input */
let searchTimer;
searchInput?.addEventListener('input', () => {
  const q = searchInput.value.trim();
  searchClear.style.display = q ? '' : 'none';
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (q.length === 0) { showPanel('default'); renderDefaultPanel(); return; }
    if (q.length < 1) return;
    const results = performSearch(q);
    renderResultsPanel(results, q);
    showPanel('results');
  }, 200);
});

/* keyboard nav */
searchInput?.addEventListener('keydown', e => {
  const items = searchResults?.querySelectorAll('.search-result-item') || [];
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchFocusIdx = Math.min(searchFocusIdx + 1, items.length - 1);
    updateKeyboardFocus(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchFocusIdx = Math.max(searchFocusIdx - 1, 0);
    updateKeyboardFocus(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const focused = searchResults?.querySelector('.search-result-item.keyboard-focused');
    if (focused) { focused.click(); return; }
    const q = searchInput.value.trim();
    if (q) { saveRecentSearch(q); }
  } else if (e.key === 'Escape') {
    closeSearch();
  }
});

function updateKeyboardFocus(items) {
  items.forEach((el, i) => {
    el.classList.toggle('keyboard-focused', i === searchFocusIdx);
    if (i === searchFocusIdx) el.scrollIntoView({ block: 'nearest' });
  });
}

/* search logic */
function performSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return SEARCH_CATALOG
    .map(p => {
      let score = 0;
      const searchFields = [p.name, p.brand, p.catLabel, ...(p.tags || [])].join(' ').toLowerCase();
      // Exact name match gets highest score
      if (p.name.toLowerCase().includes(q)) score += 10;
      if (p.brand.toLowerCase().includes(q)) score += 6;
      if (p.catLabel.toLowerCase().includes(q)) score += 4;
      if ((p.tags || []).some(t => t.includes(q))) score += 3;
      // Partial word matching
      q.split(/\s+/).forEach(word => {
        if (word.length < 2) return;
        if (searchFields.includes(word)) score += 2;
      });
      return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score || b.sold - a.sold)
    .slice(0, 6);
}

/* render default panel (recent + trending) */
function renderDefaultPanel() {
  const recentList = document.getElementById('searchRecentList');
  const recents = getRecentSearches();
  if (recentList) {
    if (recents.length === 0) {
      recentList.innerHTML = '<span class="search-no-history">ยังไม่มีประวัติการค้นหา</span>';
    } else {
      recentList.innerHTML = recents.map(q => `
        <span class="search-recent-item" data-query="${q}">
          🕐 ${q}
          <span class="del-recent" data-del="${q}" title="ลบ">✕</span>
        </span>`).join('');
    }
    // bind clicks
    recentList.querySelectorAll('.search-recent-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('del-recent')) {
          deleteRecentSearch(e.target.dataset.del);
          renderDefaultPanel();
          return;
        }
        const q = el.dataset.query;
        if (searchInput) searchInput.value = q;
        if (searchClear) searchClear.style.display = '';
        const res = performSearch(q);
        renderResultsPanel(res, q);
        showPanel('results');
      });
    });
  }

  // bind clear history
  document.getElementById('clearHistory')?.addEventListener('click', () => {
    localStorage.removeItem(RECENT_KEY);
    renderDefaultPanel();
  });

  // bind trending tags
  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const q = tag.dataset.query;
      if (searchInput) searchInput.value = q;
      if (searchClear) searchClear.style.display = '';
      const res = performSearch(q);
      renderResultsPanel(res, q);
      showPanel('results');
    });
  });

  // bind category chips
  document.querySelectorAll('.search-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      const res = SEARCH_CATALOG.filter(p => p.category === cat);
      const label = chip.textContent.trim();
      if (searchInput) searchInput.value = label.replace(/^[^\s]+\s/, '');
      if (searchClear) searchClear.style.display = '';
      renderResultsPanel(res, '', `หมวด: ${label}`);
      showPanel('results');
    });
  });
}

/* render live results */
function renderResultsPanel(results, query, labelOverride) {
  const header = document.getElementById('searchResultHeader');
  const list   = document.getElementById('searchResultList');
  const footer = document.getElementById('searchResultFooter');
  searchFocusIdx = -1;

  if (header) {
    header.textContent = labelOverride
      ? labelOverride
      : results.length > 0
        ? `พบ ${results.length} รายการสำหรับ "${query}"`
        : '';
  }

  if (list) {
    if (results.length === 0) {
      list.innerHTML = `
        <div class="search-no-result">
          <div class="search-no-result__icon">🔍</div>
          <p>ไม่พบสินค้าสำหรับ <strong>"${query}"</strong></p>
          <p style="font-size:12px;margin-top:4px">ลองค้นหาด้วยคำอื่น หรือเลือกจากหมวดหมู่</p>
        </div>`;
    } else {
      list.innerHTML = results.map((p, idx) => `
        <a href="product.html?id=${p.id}" class="search-result-item" data-idx="${idx}">
          <div class="search-result-item__img">${p.emoji}</div>
          <div class="search-result-item__info">
            <div class="search-result-item__name">${highlightText(p.name, query)}</div>
            <div class="search-result-item__meta">
              <span class="search-result-item__cat">${p.catLabel}</span>
              <span class="search-result-item__rating">⭐ ${p.rating}</span>
              <span>ขายแล้ว ${p.sold.toLocaleString()}</span>
            </div>
          </div>
          <div class="search-result-item__price">฿${p.price.toLocaleString()}</div>
        </a>`).join('');

      // save to recent on click
      list.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          if (query) saveRecentSearch(query);
        });
      });
    }
  }

  if (footer) {
    footer.innerHTML = results.length > 0
      ? `<button class="search-view-all-btn" id="viewAllBtn">ดูสินค้าทั้งหมด ${results.length} รายการ →</button>`
      : '';
    document.getElementById('viewAllBtn')?.addEventListener('click', () => {
      if (query) saveRecentSearch(query);
      closeSearch();
      // scroll to bestsellers section as fallback
      document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* highlight matched text */
function highlightText(text, query) {
  if (!query || query.length < 1) return text;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="hl">$1</mark>');
  } catch { return text; }
}

/* recent searches helpers */
function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecentSearch(q) {
  if (!q || q.trim().length < 2) return;
  let recents = getRecentSearches().filter(r => r !== q);
  recents.unshift(q);
  recents = recents.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
}
function deleteRecentSearch(q) {
  const recents = getRecentSearches().filter(r => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
}

/* =============================================
   HAMBURGER MENU
============================================= */
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

/* =============================================
   NAVBAR SCROLL EFFECT
============================================= */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* =============================================
   PRODUCT FILTER
============================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    productCards.forEach(card => {
      const cat = card.dataset.category || '';
      if (filter === 'all' || cat.includes(filter)) {
        card.style.display = '';
        card.style.animation = 'fadeInUp .35s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* =============================================
   WISHLIST SYSTEM
============================================= */
const WISHLIST_KEY = 'ruby_wishlist';

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

let wishlist = loadWishlist();

function isWishlisted(pid) { return wishlist.some(i => i.id === pid); }

function toggleWishlist(pid, name, price, img) {
  if (isWishlisted(pid)) {
    wishlist = wishlist.filter(i => i.id !== pid);
    saveWishlist(wishlist);
    updateWishlistCount();
    showToast('ลบออกจากรายการโปรดแล้ว');
    return false;
  } else {
    wishlist.push({ id: pid, name, price: parseInt(price), img: img || '' });
    saveWishlist(wishlist);
    updateWishlistCount();
    showToast('❤️ เพิ่มในรายการโปรดแล้ว!');
    return true;
  }
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlistCount');
  if (!badge) return;
  const count = wishlist.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

function syncWishlistButtons() {
  document.querySelectorAll('.btn-wishlist[data-pid]').forEach(btn => {
    const pid = btn.dataset.pid;
    if (isWishlisted(pid)) {
      btn.textContent = '♥';
      btn.classList.add('wishlisted');
    } else {
      btn.textContent = '♡';
      btn.classList.remove('wishlisted');
    }
  });
}

/* Wishlist sidebar open/close */
const wishlistSidebar  = document.getElementById('wishlistSidebar');
const wishlistOverlay  = document.getElementById('wishlistOverlay');
const wishlistClose    = document.getElementById('wishlistClose');
const wishlistNavBtn   = document.getElementById('wishlistNavBtn');
const wishlistLink     = document.getElementById('wishlistLink');

function openWishlist() {
  wishlistSidebar?.classList.add('open');
  wishlistOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderWishlist();
}
function closeWishlist() {
  wishlistSidebar?.classList.remove('open');
  wishlistOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

wishlistNavBtn?.addEventListener('click', openWishlist);
wishlistLink?.addEventListener('click', e => { e.preventDefault(); closeCart(); openWishlist(); });
wishlistClose?.addEventListener('click', closeWishlist);
wishlistOverlay?.addEventListener('click', closeWishlist);

/* Render wishlist sidebar */
function renderWishlist() {
  const itemsEl  = document.getElementById('wishlistItems');
  const footerEl = document.getElementById('wishlistFooter');
  if (!itemsEl) return;

  if (wishlist.length === 0) {
    itemsEl.innerHTML = `
      <div class="wishlist-empty">
        <div class="wishlist-empty__icon">🤍</div>
        <p style="font-weight:700;font-size:16px">รายการโปรดว่างเลย!</p>
        <p>กดหัวใจ ♡ บนสินค้าที่ชอบเพื่อบันทึกไว้</p>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (footerEl) footerEl.style.display = '';

  itemsEl.innerHTML = wishlist.map((item, idx) => {
    const thumb = item.img
      ? `<img src="${item.img}" alt="${item.name}" onerror="this.parentElement.innerHTML='🐾'"/>`
      : '🐾';
    return `
      <div class="wishlist-item" data-idx="${idx}">
        <div class="wishlist-item__img">${thumb}</div>
        <div class="wishlist-item__info">
          <div class="wishlist-item__name">${item.name}</div>
          <div class="wishlist-item__price">฿${item.price.toLocaleString()}</div>
          <div class="wishlist-item__actions">
            <button class="wishlist-atc-btn" data-action="atc" data-idx="${idx}">🛒 ใส่ตะกร้า</button>
            <button class="wishlist-remove-btn" data-action="remove" data-idx="${idx}" title="ลบ">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');

  itemsEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      const item   = wishlist[idx];
      if (!item) return;

      if (action === 'atc') {
        addToCart(item.name, item.price, item.id, item.img);
        btn.textContent = '✅ เพิ่มแล้ว!';
        setTimeout(() => { btn.textContent = '🛒 ใส่ตะกร้า'; }, 1500);
      } else if (action === 'remove') {
        wishlist = wishlist.filter(i => i.id !== item.id);
        saveWishlist(wishlist);
        updateWishlistCount();
        syncWishlistButtons();
        renderWishlist();
        showToast('ลบออกจากรายการโปรดแล้ว');
      }
    });
  });
}

/* Add all to cart */
document.getElementById('wishlistAddAllBtn')?.addEventListener('click', () => {
  if (wishlist.length === 0) return;
  wishlist.forEach(item => addToCart(item.name, item.price, item.id, item.img));
  showToast(`🛒 เพิ่ม ${wishlist.length} รายการลงตะกร้าแล้ว!`);
});

/* Heart buttons on product cards */
document.querySelectorAll('.btn-wishlist[data-pid]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const { pid, name, price, img } = btn.dataset;
    const added = toggleWishlist(pid, name, price, img);
    btn.textContent = added ? '♥' : '♡';
    btn.classList.toggle('wishlisted', added);

    /* pop animation */
    btn.style.transform = 'scale(1.35)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
});

/* Init wishlist state on load */
updateWishlistCount();
syncWishlistButtons();

/* =============================================
   SCROLL REVEAL ANIMATION
============================================= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

const animTargets = document.querySelectorAll(
  '.product-card, .cat-card, .review-card, .blog-card, .trust-item'
);
animTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

/* =============================================
   MOBILE NAV ACTIVE STATE
============================================= */
const mobileNavItems = document.querySelectorAll('.mobile-nav__item');
mobileNavItems.forEach(item => {
  item.addEventListener('click', () => {
    mobileNavItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

/* Init */
updateCartCount();

/* =============================================
   RECENTLY VIEWED — Homepage
============================================= */
(function renderRecentlyViewedHome() {
  const section = document.getElementById('recentlyViewedHome');
  const strip   = document.getElementById('rvHomeStrip');
  if (!section || !strip) return;

  try {
    const list = JSON.parse(localStorage.getItem('ruby_recent_viewed') || '[]');
    if (list.length === 0) return;

    function escH(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    strip.innerHTML = list.map(item => `
      <a href="product.html?id=${item.id}" class="rv-card">
        <div class="rv-card__img">
          <img src="${escH(item.img)}" alt="${escH(item.name)}" loading="lazy"/>
        </div>
        <div class="rv-card__body">
          <div class="rv-card__name">${escH(item.name)}</div>
          <div class="rv-card__price">฿ ${(item.price||0).toLocaleString()}</div>
          ${item.rating ? `<div class="rv-card__stars">${'★'.repeat(Math.round(item.rating))}</div>` : ''}
        </div>
      </a>`).join('');

    section.style.display = '';
  } catch { }
})();

/* =============================================
   FLASH SALE COUNTDOWN
============================================= */
(function initFlashSale() {
  const FLASH_KEY = 'ruby_flash_end';

  /* Set end time: midnight tonight (23:59:59), persist across reloads */
  function getEndTime() {
    try {
      const saved = parseInt(localStorage.getItem(FLASH_KEY) || '0');
      if (saved > Date.now()) return saved;
    } catch { }
    /* create new: tonight at 23:59:59 */
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    /* if already past midnight, push to next day */
    if (end.getTime() <= Date.now()) end.setDate(end.getDate() + 1);
    try { localStorage.setItem(FLASH_KEY, String(end.getTime())); } catch { }
    return end.getTime();
  }

  const endTime = getEndTime();
  const section = document.getElementById('flashSale');
  const elH = document.getElementById('fsHours');
  const elM = document.getElementById('fsMinutes');
  const elS = document.getElementById('fsSeconds');
  if (!elH || !elM || !elS) return;

  let prevSec = -1;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      elH.textContent = '00';
      elM.textContent = '00';
      elS.textContent = '00';
      section?.classList.add('flash-sale--expired');
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    elH.textContent = pad(h);
    elM.textContent = pad(m);
    elS.textContent = pad(s);

    /* pulse animation on second change */
    if (s !== prevSec) {
      [elH, elM, elS].forEach(el => {
        el.classList.add('tick');
        setTimeout(() => el.classList.remove('tick'), 300);
      });
      prevSec = s;
    }
  }

  tick();
  setInterval(tick, 1000);
})();

/* =============================================
   QUICK VIEW MODAL
============================================= */
(function initQuickView() {
  const overlay  = document.getElementById('qvOverlay');
  const closeBtn = document.getElementById('qvClose');
  if (!overlay) return;

  let qvQty     = 1;
  let qvProduct = null;

  function openQV(card) {
    qvProduct = {
      id:       card.dataset.qvId,
      name:     card.dataset.qvName,
      brand:    card.dataset.qvBrand,
      price:    parseFloat(card.dataset.qvPrice),
      original: parseFloat(card.dataset.qvOriginal) || 0,
      img:      card.dataset.qvImg,
      rating:   parseFloat(card.dataset.qvRating) || 0,
      count:    card.dataset.qvCount || '0',
      desc:     card.dataset.qvDesc || '',
    };
    qvQty = 1;

    // Populate
    document.getElementById('qvImg').src         = qvProduct.img;
    document.getElementById('qvImg').alt         = qvProduct.name;
    document.getElementById('qvBrand').textContent = qvProduct.brand;
    document.getElementById('qvName').textContent  = qvProduct.name;
    document.getElementById('qvDesc').textContent  = qvProduct.desc;
    document.getElementById('qvStars').textContent =
      '★'.repeat(Math.round(qvProduct.rating)) + '☆'.repeat(5 - Math.round(qvProduct.rating));
    document.getElementById('qvRatingVal').textContent   = qvProduct.rating.toFixed(1);
    document.getElementById('qvRatingCount').textContent = `(${qvProduct.count} รีวิว)`;
    document.getElementById('qvPrice').textContent       = `฿ ${qvProduct.price.toLocaleString()}`;
    document.getElementById('qvQty').textContent         = '1';
    document.getElementById('qvFullLink').href           = `product.html?id=${qvProduct.id}`;

    // Original price & sale badge
    const origEl = document.getElementById('qvOriginal');
    const saleEl = document.getElementById('qvSaleBadge');
    if (qvProduct.original > qvProduct.price) {
      origEl.textContent  = `฿ ${qvProduct.original.toLocaleString()}`;
      origEl.style.display = '';
      const pct = Math.round((1 - qvProduct.price / qvProduct.original) * 100);
      saleEl.textContent  = `-${pct}%`;
      saleEl.style.display = '';
    } else {
      origEl.style.display = saleEl.style.display = 'none';
    }

    // Badge
    const badgeWrap = document.getElementById('qvBadges');
    const srcBadge  = card.querySelector('.badge');
    badgeWrap.innerHTML = srcBadge
      ? `<span class="badge ${srcBadge.className.replace('badge','').trim()}">${srcBadge.textContent}</span>`
      : '';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeQV() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    qvProduct = null;
  }

  // Qty controls
  document.getElementById('qvMinus')?.addEventListener('click', () => {
    if (qvQty > 1) { qvQty--; document.getElementById('qvQty').textContent = qvQty; }
  });
  document.getElementById('qvPlus')?.addEventListener('click', () => {
    qvQty++; document.getElementById('qvQty').textContent = qvQty;
  });

  // Add to cart
  document.getElementById('qvAddCart')?.addEventListener('click', () => {
    if (!qvProduct) return;
    // Re-use existing addToCart flow via cart key
    const CART_KEY = 'ruby_cart';
    try {
      let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      const idx = cart.findIndex(i => i.id === qvProduct.id);
      if (idx > -1) {
        cart[idx].qty = (cart[idx].qty || 1) + qvQty;
      } else {
        cart.push({ id: qvProduct.id, name: qvProduct.name, price: qvProduct.price, qty: qvQty, img: qvProduct.img });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartCount();
      showToast(`🛒 เพิ่ม ${qvProduct.name} ×${qvQty} แล้วค่ะ`);
      closeQV();
    } catch { showToast('⚠️ เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'); }
  });

  // Close handlers
  closeBtn?.addEventListener('click', closeQV);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeQV(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeQV(); });

  // Delegate quick-view button clicks from product grid
  document.getElementById('productsGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('.btn-quickview');
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest('.product-card');
    if (card) openQV(card);
  });
})();

/* =============================================
   NEWSLETTER FORM
============================================= */
(function initNewsletter() {
  const emailInput = document.getElementById('newsletterEmail');
  const btn        = document.getElementById('newsletterBtn');
  if (!btn || !emailInput) return;

  btn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ กรุณากรอกอีเมลที่ถูกต้อง');
      emailInput.focus();
      return;
    }
    emailInput.value = '';
    showToast('🎉 ขอบคุณค่ะ! เราจะส่งโปรโมชั่นดีๆ ให้คุณเร็วๆ นี้');
  });

  emailInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
})();

/* =============================================
   FOOTER / CATEGORY CARD FILTER LINKS
============================================= */
(function initCategoryLinks() {
  document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', e => {
      const filter = link.dataset.filter;
      if (!filter) return;
      // Use href="#bestsellers" for scroll — just trigger the filter button
      setTimeout(() => {
        const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (btn) btn.click();
        document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });
  });
})();

/* =============================================
   HASH SEARCH — handle #search:keyword from 404.html
============================================= */
(function initHashSearch() {
  const hash = window.location.hash;
  if (!hash.startsWith('#search:')) return;
  const query = decodeURIComponent(hash.replace('#search:', '').trim());
  if (!query) return;

  // Clear hash from URL without reloading
  history.replaceState(null, '', window.location.pathname + window.location.search);

  // Wait for DOM to be ready then trigger search
  const tryOpenSearch = () => {
    const input = document.getElementById('searchInput');
    if (!input) { setTimeout(tryOpenSearch, 150); return; }
    openSearch();
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // Scroll to search bar
    document.getElementById('searchBar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  setTimeout(tryOpenSearch, 300);
})();

/* === CSS animation keyframes via JS === */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
