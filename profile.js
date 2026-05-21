'use strict';

/* ── keys ─────────────────────────────────────────── */
const USER_KEY     = 'ruby_user';
const WISHLIST_KEY = 'ruby_wishlist';
const CART_KEY     = 'ruby_cart';

/* ── order workflow (same as app.js) ──────────────── */
const WORKFLOW_STEPS = ['pending','paid','preparing','shipped','delivered'];
const STATUS_TEXT = {
  pending:   'รอดำเนินการ',
  paid:      'ชำระเงินแล้ว',
  preparing: 'กำลังจัดเตรียม',
  shipped:   'จัดส่งแล้ว',
  delivered: 'ได้รับสินค้า',
};
const STATUS_ICON = {
  pending:'⏳', paid:'✅', preparing:'📦', shipped:'🚚', delivered:'🎉'
};

/* ── tier / badge helper ──────────────────────────── */
const TIERS = [
  { name:'Bronze',   min:0,    color:'#CD7F32' },
  { name:'Silver',   min:500,  color:'#9E9E9E' },
  { name:'Gold',     min:1500, color:'#FFB300' },
  { name:'Platinum', min:3000, color:'#7B68EE' },
];
function getTier(pts) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (pts >= TIERS[i].min) return { ...TIERS[i], next: TIERS[i + 1] || null };
  }
  return { ...TIERS[0], next: TIERS[1] };
}

/* ── avatar seeds → emoji ─────────────────────────── */
const AVATAR_MAP = {
  Malee:'🐶', Tom:'🐱', Joy:'🐰', Nid:'🦊', Bom:'🐸', Min:'🐼'
};

/* ── pet type emoji ──────────────────────────────── */
const PET_EMOJI = { dog:'🐶', cat:'🐱', other:'🐾' };

/* ── state ────────────────────────────────────────── */
let currentUser = null;

/* ════════════════════════════════════════════════════
   BOOT — Supabase session → fallback localStorage
   ════════════════════════════════════════════════════ */
(async function boot() {
  try {
    /* 1. Try Supabase session */
    const session = typeof DB !== 'undefined' ? await DB.getSession() : null;

    if (session) {
      /* 2. Fetch profile */
      const { data: profile } = await DB.getProfile(session.user.id);
      if (!profile) { _fallbackLocal(); return; }

      const fn = profile.first_name || '';
      const ln = profile.last_name  || '';
      currentUser = {
        id:          session.user.id,
        name:        (`${fn} ${ln}`).trim() || session.user.email.split('@')[0],
        firstName:   fn,
        lastName:    ln,
        email:       session.user.email,
        avatar:      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.avatar_seed || 'Malee')}&backgroundColor=ffb347`,
        avatarSeed:  profile.avatar_seed || 'Malee',
        role:        profile.role   || 'user',
        phone:       profile.phone  || '',
        dob:         profile.dob    || '',
        gender:      profile.gender || '',
        extraPoints: profile.extra_points || 0,
        orders:      [],
        pets:        [],
      };

      /* 3. Fetch orders + pets in parallel */
      const [{ data: orders }, { data: pets }] = await Promise.all([
        DB.getOrders(session.user.id),
        DB.getPets(session.user.id),
      ]);

      currentUser.orders = (orders || []).map(_normalizeOrder);
      currentUser.pets   = (pets   || []).map(p => ({
        id: p.id, name: p.name, type: p.type, breed: p.breed, age: p.age,
      }));

      /* 4. Cache to localStorage */
      saveUser();

    } else {
      _fallbackLocal();
    }
  } catch (err) {
    console.warn('[profile.js] Supabase error, falling back to localStorage', err);
    _fallbackLocal();
  }

  /* 5. Render everything */
  renderHero();
  renderPoints();
  prefillForm();
  renderPets();
  initTabs();
  initAvatarPicker();
  initProfileForm();
  initPetSection();
  renderOrders();
  renderWishlist();
})();

function _fallbackLocal() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) { location.href = 'index.html'; return; }
    currentUser = JSON.parse(raw);
    if (!currentUser || !currentUser.name) { location.href = 'index.html'; return; }
    if (!Array.isArray(currentUser.orders)) currentUser.orders = [];
    if (!Array.isArray(currentUser.pets))   currentUser.pets   = [];
  } catch {
    location.href = 'index.html';
  }
}

/* Normalize Supabase order → app format */
function _normalizeOrder(o) {
  const items = (o.order_items || []).map(it => ({
    name:  it.product_name,
    img:   it.product_img,
    price: it.price,
    qty:   it.qty,
  }));
  return {
    id:             o.id,
    date:           new Date(o.created_at).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' }),
    status:         o.status   || 'pending',
    total:          o.total    || 0,
    paymentMethod:  o.payment_method,
    deliveryName:   o.delivery_name,
    shippingFee:    o.shipping_fee   || 0,
    discount:       o.discount       || 0,
    pointsUsed:     o.points_used    || 0,
    pointsEarned:   o.points_earned  || 0,
    shippingName:   o.shipping_name,
    shippingAddress:o.shipping_address,
    products:       items.map(it => it.name).join(', '),
    items,
    workflow:       ['pending','paid','preparing','shipped','delivered'],
  };
}

/* ════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════ */
function renderHero() {
  const u = currentUser;

  /* avatar */
  const avatarImg = document.getElementById('profileAvatarImg');
  if (avatarImg) {
    if (u.avatar && u.avatar.startsWith('http')) {
      avatarImg.src = u.avatar;
      avatarImg.style.display = 'block';
    } else {
      /* show emoji as data-uri via canvas trick — fall back to placeholder */
      avatarImg.style.display = 'none';
      const wrap = document.getElementById('profileAvatar');
      if (wrap) {
        let emojiEl = wrap.querySelector('.avatar-emoji');
        if (!emojiEl) {
          emojiEl = document.createElement('span');
          emojiEl.className = 'avatar-emoji';
          wrap.insertBefore(emojiEl, avatarImg);
        }
        const seed = u.avatarSeed || 'Malee';
        emojiEl.textContent = AVATAR_MAP[seed] || '🐾';
      }
    }
  }

  /* name / email */
  const nameEl  = document.getElementById('profileHeroName');
  const emailEl = document.getElementById('profileHeroEmail');
  if (nameEl)  nameEl.textContent  = `${u.firstName || u.name || ''} ${u.lastName || ''}`.trim();
  if (emailEl) emailEl.textContent = u.email || '';

  /* badges */
  const badgesEl = document.getElementById('profileHeroBadges');
  if (badgesEl) {
    badgesEl.innerHTML = '';
    if (u.role === 'admin') badgesEl.innerHTML += `<span class="hero-badge" style="background:#7B68EE">👑 Admin</span>`;
    if (u.isNew) badgesEl.innerHTML += `<span class="hero-badge" style="background:#4CAF82">✨ New Member</span>`;
    const pts = calcPoints();
    const tier = getTier(pts);
    badgesEl.innerHTML += `<span class="hero-badge" style="background:${tier.color}">${tier.name}</span>`;
  }
}

/* ════════════════════════════════════════════════════
   POINTS
   ════════════════════════════════════════════════════ */
function calcPoints() {
  if (!currentUser) return 0;
  /* 10 pts per 100 baht from orders */
  const fromOrders = (currentUser.orders || []).reduce((s, o) => {
    return s + Math.floor((o.total || 0) / 100) * 10;
  }, 0);
  return (currentUser.extraPoints || 0) + fromOrders;
}

function renderPoints() {
  const pts    = calcPoints();
  const tier   = getTier(pts);
  const nextPts = tier.next ? tier.next.min : pts;
  const tierMin = tier.min;
  const pct     = tier.next
    ? Math.min(100, Math.round(((pts - tierMin) / (nextPts - tierMin)) * 100))
    : 100;
  const remaining = tier.next ? Math.max(0, nextPts - pts) : 0;

  const ptsEl  = document.getElementById('profilePoints');
  const fillEl = document.getElementById('pointsBarFill');
  const nextEl = document.getElementById('pointsNext');

  if (ptsEl)  ptsEl.textContent  = pts.toLocaleString();
  if (fillEl) fillEl.style.width = pct + '%';
  if (nextEl) nextEl.textContent = tier.next
    ? `อีก ${remaining.toLocaleString()} แต้ม → ${tier.next.name}`
    : 'ระดับสูงสุด 🏆';
}

/* ════════════════════════════════════════════════════
   TABS
   ════════════════════════════════════════════════════ */
function initTabs() {
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
      if (btn.dataset.tab === 'loyalty') renderLoyalty();
    });
  });
}

/* ════════════════════════════════════════════════════
   AVATAR PICKER
   ════════════════════════════════════════════════════ */
function initAvatarPicker() {
  const changeBtn = document.getElementById('avatarChangeBtn');
  const picker    = document.getElementById('avatarPicker');
  if (!changeBtn || !picker) return;

  changeBtn.addEventListener('click', e => {
    e.stopPropagation();
    picker.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!picker.contains(e.target) && e.target !== changeBtn) {
      picker.classList.remove('open');
    }
  });

  picker.querySelectorAll('.av-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const seed = btn.dataset.seed;
      currentUser.avatarSeed = seed;
      delete currentUser.avatar; /* clear http avatar if any */
      saveUser();
      renderHero();
      picker.classList.remove('open');
      showToast(`เปลี่ยนอวตารเป็น ${AVATAR_MAP[seed]} แล้วค่ะ`);
    });
  });
}

/* ════════════════════════════════════════════════════
   PROFILE FORM
   ════════════════════════════════════════════════════ */
function prefillForm() {
  const u = currentUser;
  setVal('pf-firstName', u.firstName || u.name || '');
  setVal('pf-lastName',  u.lastName  || '');
  setVal('pf-email',     u.email     || '');
  setVal('pf-phone',     u.phone     || '');
  setVal('pf-dob',       u.dob       || '');
  setVal('pf-gender',    u.gender    || '');
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    currentUser.firstName = getVal('pf-firstName').trim();
    currentUser.lastName  = getVal('pf-lastName').trim();
    currentUser.name      = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    currentUser.email     = getVal('pf-email').trim();
    currentUser.phone     = getVal('pf-phone').trim();
    currentUser.dob       = getVal('pf-dob');
    currentUser.gender    = getVal('pf-gender');
    saveUser();
    renderHero();

    const badge = document.getElementById('savedBadge');
    if (badge) {
      badge.style.display = 'inline-flex';
      setTimeout(() => { badge.style.display = 'none'; }, 3000);
    }
    showToast('บันทึกข้อมูลเรียบร้อยค่ะ ✅');
  });
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function validateProfileForm() {
  let ok = true;

  const firstName = getVal('pf-firstName').trim();
  const errFirst  = document.getElementById('err-pf-firstName');
  if (!firstName) {
    if (errFirst) errFirst.textContent = 'กรุณากรอกชื่อ';
    document.getElementById('pf-firstName')?.classList.add('error');
    ok = false;
  } else {
    if (errFirst) errFirst.textContent = '';
    document.getElementById('pf-firstName')?.classList.remove('error');
  }

  const email    = getVal('pf-email').trim();
  const errEmail = document.getElementById('err-pf-email');
  const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRx.test(email)) {
    if (errEmail) errEmail.textContent = 'อีเมลไม่ถูกต้อง';
    document.getElementById('pf-email')?.classList.add('error');
    ok = false;
  } else {
    if (errEmail) errEmail.textContent = '';
    document.getElementById('pf-email')?.classList.remove('error');
  }

  return ok;
}

/* ════════════════════════════════════════════════════
   PET SECTION
   ════════════════════════════════════════════════════ */
function renderPets() {
  const list = document.getElementById('petList');
  if (!list) return;
  const pets = currentUser.pets || [];
  if (pets.length === 0) {
    list.innerHTML = '<div class="pet-empty">ยังไม่มีข้อมูลน้องสัตว์เลี้ยงค่ะ</div>';
    return;
  }
  list.innerHTML = pets.map((p, i) => `
    <div class="pet-card" data-idx="${i}">
      <div class="pet-card__icon">${PET_EMOJI[p.type] || '🐾'}</div>
      <div class="pet-card__info">
        <div class="pet-card__name">${escHtml(p.name || 'ไม่ระบุชื่อ')}</div>
        <div class="pet-card__meta">${escHtml(p.breed || '')}${p.age ? ` · ${p.age} ปี` : ''}</div>
      </div>
      <button class="pet-card__del" data-del="${i}" title="ลบ">✕</button>
    </div>
  `).join('');
}

function initPetSection() {
  const addBtn    = document.getElementById('addPetBtn');
  const addForm   = document.getElementById('addPetForm');
  const saveBtn   = document.getElementById('savePetBtn');
  const cancelBtn = document.getElementById('cancelPetBtn');
  const petList   = document.getElementById('petList');

  if (addBtn) addBtn.addEventListener('click', () => {
    if (addForm) addForm.style.display = 'block';
    addBtn.style.display = 'none';
  });

  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    if (addForm) addForm.style.display = 'none';
    if (addBtn)  addBtn.style.display = '';
    clearPetForm();
  });

  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const name  = document.getElementById('petName')?.value.trim();
    const type  = document.getElementById('petType')?.value || 'other';
    const breed = document.getElementById('petBreed')?.value.trim();
    const age   = document.getElementById('petAge')?.value;

    if (!name) { showToast('กรุณากรอกชื่อน้องค่ะ'); return; }

    const petData = { name, type, breed: breed || '', age: age ? parseInt(age) : null };

    if (!currentUser.pets) currentUser.pets = [];

    /* Save to Supabase if available */
    if (currentUser.id && typeof DB !== 'undefined') {
      const { data: saved, error } = await DB.addPet(currentUser.id, petData);
      if (!error && saved) {
        currentUser.pets.push({ id: saved.id, ...petData });
      } else {
        currentUser.pets.push(petData);
      }
    } else {
      currentUser.pets.push(petData);
    }

    saveUser();
    renderPets();

    if (addForm) addForm.style.display = 'none';
    if (addBtn)  addBtn.style.display = '';
    clearPetForm();
    showToast(`เพิ่มน้อง ${name} เรียบร้อยค่ะ 🐾`);
  });

  /* delete via event delegation */
  if (petList) {
    petList.addEventListener('click', async e => {
      const delBtn = e.target.closest('[data-del]');
      if (!delBtn) return;
      const idx = parseInt(delBtn.dataset.del);
      const pet = currentUser.pets[idx];
      currentUser.pets.splice(idx, 1);
      /* Delete from Supabase if pet has a UUID id */
      if (pet?.id && typeof DB !== 'undefined' && pet.id.includes('-')) {
        DB.deletePet(pet.id).catch(() => {});
      }
      saveUser();
      renderPets();
      showToast(`ลบน้อง ${pet?.name || ''} แล้วค่ะ`);
    });
  }
}

/* ════════════════════════════════════════════════════
   SECURITY BUTTONS
   ════════════════════════════════════════════════════ */
document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
  showToast('🔐 ระบบเปลี่ยนรหัสผ่านจะพร้อมใช้งานเร็วๆ นี้ค่ะ');
});
document.getElementById('enable2FABtn')?.addEventListener('click', () => {
  showToast('🛡️ ระบบยืนยันตัวตน 2 ขั้นตอนจะพร้อมใช้งานเร็วๆ นี้ค่ะ');
});

function clearPetForm() {
  ['petName','petBreed','petAge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const typeEl = document.getElementById('petType');
  if (typeEl) typeEl.value = 'dog';
}

/* ════════════════════════════════════════════════════
   ORDERS TAB
   ════════════════════════════════════════════════════ */
function renderOrders() {
  const list  = document.getElementById('profileOrdersList');
  const badge = document.getElementById('orderCountBadge');
  if (!list) return;

  const orders = currentUser.orders || [];
  if (badge) badge.textContent = orders.length ? `${orders.length} รายการ` : '';

  if (orders.length === 0) {
    list.innerHTML = `
      <div class="empty-orders">
        <div style="font-size:48px;margin-bottom:12px">📦</div>
        <div>ยังไม่มีคำสั่งซื้อค่ะ</div>
        <a href="index.html" class="btn btn-primary" style="margin-top:16px">เริ่มช้อปปิ้ง</a>
      </div>`;
    return;
  }

  list.innerHTML = orders.slice().reverse().map(order => {
    const statusIdx = WORKFLOW_STEPS.indexOf(order.status || 'pending');
    const steps = WORKFLOW_STEPS.map((s, i) => `
      <div class="workflow-step ${i < statusIdx ? 'done' : i === statusIdx ? 'active' : ''}">
        <div class="ws-dot">${STATUS_ICON[s]}</div>
        <div class="ws-label">${STATUS_TEXT[s]}</div>
      </div>
    `).join('');

    const items = (order.items || []).map(it => `
      <div class="order-item-row">
        <img src="${it.img || it.image || ''}" alt="${escHtml(it.name || '')}" class="order-item-img" onerror="this.style.display='none'"/>
        <div class="order-item-detail">
          <div class="order-item-name">${escHtml(it.name || '')}</div>
          <div class="order-item-qty">x${it.qty || 1} · ฿${((it.price||0) * (it.qty||1)).toLocaleString()}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-card__head">
          <span class="order-id">${escHtml(order.id || '')}</span>
          <span class="order-date">${order.date ? new Date(order.date).toLocaleDateString('th-TH') : ''}</span>
          <span class="order-status-chip status-${order.status || 'pending'}">${STATUS_TEXT[order.status || 'pending']}</span>
        </div>
        <div class="order-workflow">${steps}</div>
        <div class="order-items-wrap">${items}</div>
        <div class="order-card__foot">
          <span>รวมทั้งหมด</span>
          <span class="order-total">฿${(order.total || 0).toLocaleString()}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="tracking.html?id=${encodeURIComponent(order.id || '')}" class="btn-track-order">📦 ติดตามพัสดุ</a>
            <a href="receipt.html?id=${encodeURIComponent(order.id || '')}" class="btn-track-order" style="border-color:#4CAF82;color:#4CAF82">🧾 ใบเสร็จ</a>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ════════════════════════════════════════════════════
   WISHLIST TAB
   ════════════════════════════════════════════════════ */
function loadWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}
function saveWishlist(wl) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl));
}

function renderWishlist() {
  const grid  = document.getElementById('profileWishlistGrid');
  const badge = document.getElementById('wishlistCountBadge');
  if (!grid) return;

  const wl = loadWishlist();
  if (badge) badge.textContent = wl.length ? `${wl.length} รายการ` : '';

  if (wl.length === 0) {
    grid.innerHTML = `
      <div class="empty-orders" style="grid-column:1/-1">
        <div style="font-size:48px;margin-bottom:12px">❤️</div>
        <div>ยังไม่มีรายการโปรดค่ะ</div>
      </div>`;
    return;
  }

  grid.innerHTML = wl.map((item, i) => `
    <div class="pro-wl-card" data-idx="${i}">
      <div class="pro-wl-card__img-wrap">
        <img src="${escHtml(item.img || '')}" alt="${escHtml(item.name || '')}" loading="lazy"/>
        <button class="pro-wl-remove" data-wl-del="${i}" title="ลบออก">✕</button>
      </div>
      <div class="pro-wl-card__body">
        <div class="pro-wl-card__name">${escHtml(item.name || '')}</div>
        <div class="pro-wl-card__price">฿${(item.price || 0).toLocaleString()}</div>
        <button class="btn btn-primary pro-wl-atc" data-wl-atc="${i}">🛒 ใส่ตะกร้า</button>
      </div>
    </div>
  `).join('');

  /* event delegation */
  grid.addEventListener('click', handleWishlistClick, { once: true });
}

function handleWishlistClick(e) {
  const delBtn = e.target.closest('[data-wl-del]');
  const atcBtn = e.target.closest('[data-wl-atc]');
  const wl     = loadWishlist();

  if (delBtn) {
    const idx  = parseInt(delBtn.dataset.wlDel);
    const item = wl[idx];
    wl.splice(idx, 1);
    saveWishlist(wl);
    renderWishlist();
    showToast(`ลบ ${item?.name || ''} ออกจากรายการโปรดแล้วค่ะ`);
    return;
  }

  if (atcBtn) {
    const idx  = parseInt(atcBtn.dataset.wlAtc);
    const item = wl[idx];
    if (!item) return;
    addToCartFromProfile(item);
    showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้วค่ะ 🛒`);
  }
}

function addToCartFromProfile(item) {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const existing = cart.find(c => c.id && c.id === item.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: item.id || `wl-${Date.now()}`, name: item.name, price: item.price, qty: 1, img: item.img || '' });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('addToCartFromProfile', err);
  }
}

/* ════════════════════════════════════════════════════
   LOYALTY / TIER SYSTEM
   ════════════════════════════════════════════════════ */
const TIER_ICONS    = { Bronze:'🥉', Silver:'🥈', Gold:'🥇', Platinum:'💎' };
const TIER_GRADIENTS = {
  Bronze:   'linear-gradient(135deg,#a0522d 0%,#CD7F32 100%)',
  Silver:   'linear-gradient(135deg,#757575 0%,#BDBDBD 100%)',
  Gold:     'linear-gradient(135deg,#F9A825 0%,#FFD54F 100%)',
  Platinum: 'linear-gradient(135deg,#5C35C5 0%,#9B59B6 100%)',
};

const TIER_BENEFITS = [
  { label:'แต้มต่อ ฿100',      Bronze:'10 แต้ม', Silver:'12 แต้ม', Gold:'15 แต้ม', Platinum:'20 แต้ม' },
  { label:'ส่วนลดพิเศษ',      Bronze:'—',       Silver:'5%',      Gold:'10%',     Platinum:'15%' },
  { label:'ฟรีค่าส่ง',        Bronze:'—',       Silver:'✓',       Gold:'✓',       Platinum:'✓' },
  { label:'Early Access',     Bronze:'—',       Silver:'—',       Gold:'✓',       Platinum:'✓' },
  { label:'ของขวัญวันเกิด',   Bronze:'—',       Silver:'—',       Gold:'✓',       Platinum:'✓' },
  { label:'Personal Advisor', Bronze:'—',       Silver:'—',       Gold:'—',       Platinum:'✓' },
];

function renderLoyalty() {
  const pts     = calcPoints();
  const tier    = getTier(pts);
  const nextPts = tier.next ? tier.next.min : pts;
  const tierMin = tier.min;
  const pct     = tier.next ? Math.min(100, Math.round(((pts - tierMin) / (nextPts - tierMin)) * 100)) : 100;
  const orders  = currentUser.orders || [];
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  /* ── Hero card ── */
  const heroEl = document.getElementById('loyaltyHero');
  if (heroEl) {
    heroEl.style.background = TIER_GRADIENTS[tier.name];
    heroEl.innerHTML = `
      <div class="loyalty-hero__badge">${TIER_ICONS[tier.name]}</div>
      <div class="loyalty-hero__info">
        <div class="loyalty-hero__tier-name">${tier.name} Member</div>
        <div class="loyalty-hero__pts">คุณมี <strong>${pts.toLocaleString()}</strong> Ruby Points</div>
        <div class="loyalty-hero__bar-wrap">
          <div class="loyalty-hero__bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="loyalty-hero__next">
          ${tier.next
            ? `อีก ${Math.max(0, nextPts - pts).toLocaleString()} แต้ม → ${tier.next.name} 🚀`
            : '🏆 คุณถึงระดับสูงสุดแล้วค่ะ!'}
        </div>
      </div>
      <div class="loyalty-hero__stats">
        <div class="loyalty-stat">
          <div class="loyalty-stat__val">${orders.length}</div>
          <div class="loyalty-stat__lbl">คำสั่งซื้อ</div>
        </div>
        <div class="loyalty-stat">
          <div class="loyalty-stat__val">฿${totalSpent.toLocaleString()}</div>
          <div class="loyalty-stat__lbl">ยอดซื้อรวม</div>
        </div>
        <div class="loyalty-stat">
          <div class="loyalty-stat__val">${pts.toLocaleString()}</div>
          <div class="loyalty-stat__lbl">แต้มสะสม</div>
        </div>
      </div>`;
  }

  /* ── Tier Ladder ── */
  const ladderEl = document.getElementById('tierLadder');
  if (ladderEl) {
    ladderEl.innerHTML = TIERS.map(t => {
      const reached  = pts >= t.min;
      const isCurrent = tier.name === t.name;
      return `
        <div class="tier-rung ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}">
          <div class="tier-rung__dot" style="${reached || isCurrent ? `background:${t.color};color:white` : ''}">
            ${TIER_ICONS[t.name]}
          </div>
          <div class="tier-rung__name">${t.name}</div>
          <div class="tier-rung__pts">${t.min.toLocaleString()} แต้ม</div>
        </div>`;
    }).join('');
  }

  /* ── Benefits table ── */
  const benefitsEl = document.getElementById('tierBenefits');
  if (benefitsEl) {
    const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const headers = tierNames.map(t => {
      const isCurrent = tier.name === t;
      return `<th class="${isCurrent ? 'tier-col-current' : ''}">
        <div class="tier-col-header">
          <span class="emoji">${TIER_ICONS[t]}</span>
          <span>${t}</span>
        </div>
      </th>`;
    }).join('');

    const rows = TIER_BENEFITS.map(b => {
      const cells = tierNames.map(t => {
        const isCurrent = tier.name === t;
        const val = b[t];
        const isCheck = val === '✓';
        const isCross = val === '—';
        return `<td class="${isCurrent ? 'tier-col-current' : ''}">
          ${isCheck ? '<span class="benefit-check">✓</span>'
          : isCross ? '<span class="benefit-cross">—</span>'
          : `<strong>${val}</strong>`}
        </td>`;
      }).join('');
      return `<tr><td>${b.label}</td>${cells}</tr>`;
    }).join('');

    benefitsEl.innerHTML = `
      <table class="tier-benefits-table">
        <thead><tr><th>สิทธิ์</th>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /* ── Points History ── */
  const histEl  = document.getElementById('pointsHistoryList');
  const histBadge = document.getElementById('pointsHistoryBadge');
  if (!histEl) return;

  /* Build history from orders */
  const history = [];
  orders.forEach(o => {
    const earned = Math.floor((o.total || 0) / 100) * 10;
    if (earned > 0) {
      history.push({
        type: 'earn',
        desc: `สั่งซื้อ ${o.id || 'คำสั่งซื้อ'} — ฿${(o.total||0).toLocaleString()}`,
        pts: earned,
        date: o.date ? new Date(o.date).toLocaleDateString('th-TH') : 'ไม่ทราบ',
      });
    }
    if (o.pointsUsed > 0) {
      history.push({
        type: 'use',
        desc: `แลก Ruby Points — ${o.id || ''}`,
        pts: o.pointsUsed,
        date: o.date ? new Date(o.date).toLocaleDateString('th-TH') : 'ไม่ทราบ',
      });
    }
  });
  /* Extra / bonus points */
  if (currentUser.extraPoints > 0) {
    history.unshift({ type:'earn', desc:'โบนัสพิเศษจาก Ruby Pet Shop 🎁', pts: currentUser.extraPoints, date:'—' });
  }

  if (histBadge) histBadge.textContent = history.length ? `${history.length} รายการ` : '';

  if (history.length === 0) {
    histEl.innerHTML = `<div class="points-empty"><div class="icon">🌟</div>ยังไม่มีประวัติแต้มค่ะ<br>เริ่มช้อปเพื่อสะสมแต้ม!</div>`;
    return;
  }

  histEl.innerHTML = history.slice().reverse().map(h => `
    <div class="ph-item">
      <div class="ph-icon ph-icon--${h.type}">${h.type === 'earn' ? '⬆️' : '⬇️'}</div>
      <div class="ph-info">
        <div class="ph-desc">${escHtml(h.desc)}</div>
        <div class="ph-date">${h.date}</div>
      </div>
      <div class="ph-pts ph-pts--${h.type}">${h.type === 'earn' ? '+' : '-'}${h.pts.toLocaleString()} แต้ม</div>
    </div>`).join('');
}

/* ════════════════════════════════════════════════════
   PERSISTENCE
   ════════════════════════════════════════════════════ */
function saveUser() {
  try { localStorage.setItem(USER_KEY, JSON.stringify(currentUser)); } catch { }
  /* Async sync to Supabase (fire-and-forget) */
  if (currentUser?.id && typeof DB !== 'undefined') {
    DB.upsertProfile(currentUser.id, {
      first_name:   currentUser.firstName || '',
      last_name:    currentUser.lastName  || '',
      phone:        currentUser.phone     || '',
      dob:          currentUser.dob       || null,
      gender:       currentUser.gender    || '',
      avatar_seed:  currentUser.avatarSeed || 'Malee',
      extra_points: currentUser.extraPoints || 0,
    }).catch(err => console.warn('[saveUser] Supabase sync error', err));
  }
}

/* ════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ════════════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════════════ */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
