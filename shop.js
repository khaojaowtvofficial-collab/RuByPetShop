/* ===================================================
   Ruby Pet Shop — Shop / Catalog Page JS
=================================================== */

/* =============================================
   PRODUCT DATABASE (same as product.js)
============================================= */
const PRODUCTS_DB = [
  {
    id: 'P001',
    name: 'Royal Canin Adult 15kg อาหารสุนัขพันธุ์ใหญ่',
    brand: 'Royal Canin',
    category: 'dog-food',
    tags: ['dog', 'food'],
    price: 1290,
    originalPrice: 1590,
    badge: 'hot',
    rating: 4.9,
    reviewCount: 248,
    sold: 1240,
    stock: 45,
    img: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&q=80',
    isNew: false,
  },
  {
    id: 'P002',
    name: 'Whiskas อาหารแมวรสปลาแซลมอน 1.2kg',
    brand: 'Whiskas',
    category: 'cat-food',
    tags: ['cat', 'food'],
    price: 299,
    originalPrice: 0,
    badge: 'new',
    rating: 4.8,
    reviewCount: 187,
    sold: 890,
    stock: 88,
    img: 'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=500&q=80',
    isNew: true,
  },
  {
    id: 'P003',
    name: 'Kong Classic ของเล่นยางกรอก ขนาด M',
    brand: 'Kong',
    category: 'dog-toy',
    tags: ['dog', 'toy'],
    price: 490,
    originalPrice: 590,
    badge: 'hot',
    rating: 4.7,
    reviewCount: 92,
    sold: 460,
    stock: 32,
    img: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&q=80',
    isNew: false,
  },
  {
    id: 'P004',
    name: 'ของเล่นไม้ตกปลาแมวพร้อมขนนก',
    brand: 'PetDreamHouse',
    category: 'cat-toy',
    tags: ['cat', 'toy'],
    price: 189,
    originalPrice: 0,
    badge: '',
    rating: 4.9,
    reviewCount: 321,
    sold: 1600,
    stock: 150,
    img: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80',
    isNew: false,
  },
  {
    id: 'P005',
    name: 'Pedigree Dentastix ขนมกัดฟัน 7 ชิ้น',
    brand: 'Pedigree',
    category: 'dog-food',
    tags: ['dog', 'food'],
    price: 149,
    originalPrice: 0,
    badge: 'new',
    rating: 4.5,
    reviewCount: 156,
    sold: 780,
    stock: 200,
    img: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500&q=80',
    isNew: true,
  },
  {
    id: 'P006',
    name: 'Sheba อาหารแมวเปียก แพ็ค 12 ถุง',
    brand: 'Sheba',
    category: 'cat-food',
    tags: ['cat', 'food'],
    price: 259,
    originalPrice: 320,
    badge: 'hot',
    rating: 4.9,
    reviewCount: 409,
    sold: 2000,
    stock: 63,
    img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80',
    isNew: false,
  },
  {
    id: 'P007',
    name: 'Chuckit! Ultra Ball ลูกบอลเทนนิส 2 ลูก',
    brand: 'Chuckit!',
    category: 'dog-toy',
    tags: ['dog', 'toy'],
    price: 350,
    originalPrice: 0,
    badge: '',
    rating: 4.6,
    reviewCount: 74,
    sold: 370,
    stock: 8,
    img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80',
    isNew: false,
  },
  {
    id: 'P008',
    name: 'CatLife บ้านแมวกระดาษลับเล็บพร้อมลูกบอล',
    brand: 'CatLife',
    category: 'cat-toy',
    tags: ['cat', 'toy'],
    price: 599,
    originalPrice: 750,
    badge: 'new',
    rating: 4.9,
    reviewCount: 203,
    sold: 1015,
    stock: 0,
    img: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=500&q=80',
    isNew: true,
  },
];

/* =============================================
   STATE
============================================= */
const state = {
  search:    '',
  cat:       'all',      // all | dog | cat | food | toy
  maxPrice:  2000,
  brands:    [],         // selected brands (empty = all)
  minRating: 0,
  inStock:   false,
  sort:      'popular',
  view:      'grid',     // grid | list
  page:      1,
  perPage:   6,
};

const BRANDS = [...new Set(PRODUCTS_DB.map(p => p.brand))].sort();

/* =============================================
   CART (localStorage)
============================================= */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ruby_cart') || '[]'); } catch { cart = []; }

function saveCart() { localStorage.setItem('ruby_cart', JSON.stringify(cart)); }

function addToCart(productId) {
  const p = PRODUCTS_DB.find(x => x.id === productId);
  if (!p || p.stock === 0) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty = Math.min(existing.qty + 1, p.stock);
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, img: p.img });
  saveCart();
  updateCartCount();
  renderCartDrawer();
  showToast(`🛒 เพิ่ม "${p.name}" ลงตะกร้าแล้ว!`);
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart(); updateCartCount(); renderCartDrawer();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  const p = PRODUCTS_DB.find(x => x.id === productId);
  item.qty = Math.min(Math.max(1, item.qty + delta), p?.stock || 99);
  saveCart(); updateCartCount(); renderCartDrawer();
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}

/* =============================================
   WISHLIST (localStorage)
============================================= */
let wishlist = [];
try { wishlist = JSON.parse(localStorage.getItem('ruby_wishlist') || '[]'); } catch { wishlist = []; }
function saveWishlist() { localStorage.setItem('ruby_wishlist', JSON.stringify(wishlist)); }
function toggleWishlist(productId) {
  const idx = wishlist.findIndex(i => i.id === productId);
  const p = PRODUCTS_DB.find(x => x.id === productId);
  if (!p) return;
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast(`💔 ลบออกจากรายการโปรดแล้ว`);
  } else {
    wishlist.push({ id: p.id, name: p.name, price: p.price, img: p.img });
    showToast(`❤️ เพิ่ม "${p.name}" ในรายการโปรดแล้ว!`);
  }
  saveWishlist();
  renderGrid(); // re-render to update heart icon
}
function isWishlisted(id) { return wishlist.some(i => i.id === id); }

/* =============================================
   FILTER + SORT LOGIC
============================================= */
function getFiltered() {
  let list = [...PRODUCTS_DB];

  // Search
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.includes(q)
    );
  }

  // Category
  if (state.cat !== 'all') {
    list = list.filter(p => p.tags.includes(state.cat));
  }

  // Price
  list = list.filter(p => p.price <= state.maxPrice);

  // Brands
  if (state.brands.length > 0) {
    list = list.filter(p => state.brands.includes(p.brand));
  }

  // Rating
  if (state.minRating > 0) {
    list = list.filter(p => p.rating >= state.minRating);
  }

  // In stock
  if (state.inStock) {
    list = list.filter(p => p.stock > 0);
  }

  // Sort
  switch (state.sort) {
    case 'popular':    list.sort((a,b) => b.sold - a.sold); break;
    case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
    case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'newest':     list.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    case 'name':       list.sort((a,b) => a.name.localeCompare(b.name, 'th')); break;
  }

  return list;
}

function getPage(list) {
  const start = (state.page - 1) * state.perPage;
  return list.slice(start, start + state.perPage);
}

/* =============================================
   RENDER GRID
============================================= */
function renderGrid() {
  const grid    = document.getElementById('shopGrid');
  const empty   = document.getElementById('shopEmpty');
  const countEl = document.getElementById('shopResultCount');
  if (!grid) return;

  const filtered = getFiltered();
  const page     = getPage(filtered);
  const total    = filtered.length;

  // Result count
  if (countEl) countEl.textContent = `พบสินค้า ${total} รายการ`;

  // Empty state
  if (total === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    renderPagination(0);
    return;
  }
  empty.style.display = 'none';

  // Toggle list/grid class
  grid.className = `shop-grid${state.view === 'list' ? ' list-view' : ''}`;

  grid.innerHTML = page.map(p => {
    const discPct = p.originalPrice > 0
      ? `-${Math.round((1 - p.price / p.originalPrice) * 100)}%`
      : '';
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    const wl = isWishlisted(p.id);
    const outOfStock = p.stock === 0;
    const badgeHtml = p.badge === 'hot'  ? '<span class="badge badge--hot">🔥 ขายดี</span>'
                    : p.badge === 'new'  ? '<span class="badge badge--new">🌟 ใหม่</span>'
                    : p.badge === 'sale' ? '<span class="badge badge--sale">💥 ลด</span>'
                    : '';

    if (state.view === 'list') {
      return `
      <div class="shop-card" data-id="${p.id}">
        <div class="shop-card__img-wrap">
          <img src="${p.img}" alt="${p.name}" class="shop-card__img" loading="lazy"/>
          <div class="shop-card__badge">${badgeHtml}</div>
        </div>
        <div class="shop-card__body">
          <div class="shop-card__info">
            <div class="shop-card__brand">${p.brand}</div>
            <div class="shop-card__name">${p.name}</div>
            <div class="shop-card__rating">
              <span class="shop-card__stars">${stars}</span>
              <span class="shop-card__rating-num">${p.rating}</span>
              <span class="shop-card__rating-count">(${p.reviewCount.toLocaleString()})</span>
            </div>
          </div>
          <div class="shop-card__price-row">
            <span class="shop-card__price">฿${p.price.toLocaleString()}</span>
            ${p.originalPrice > 0 ? `<span class="shop-card__original">฿${p.originalPrice.toLocaleString()}</span><span class="shop-card__discount">${discPct}</span>` : ''}
          </div>
          <div class="shop-card__actions">
            <button class="shop-action-btn wl-btn ${wl ? 'wishlisted' : ''}" data-id="${p.id}" title="รายการโปรด">${wl ? '❤️' : '🤍'}</button>
          </div>
          <button class="shop-card__atc" data-id="${p.id}" ${outOfStock ? 'disabled' : ''}>${outOfStock ? 'หมดสต็อก' : '🛒 หยิบใส่ตะกร้า'}</button>
        </div>
      </div>`;
    }

    return `
    <div class="shop-card" data-id="${p.id}">
      <div class="shop-card__img-wrap">
        <img src="${p.img}" alt="${p.name}" class="shop-card__img" loading="lazy"/>
        <div class="shop-card__badge">${badgeHtml}</div>
        <div class="shop-card__actions">
          <button class="shop-action-btn wl-btn ${wl ? 'wishlisted' : ''}" data-id="${p.id}" title="รายการโปรด">${wl ? '❤️' : '🤍'}</button>
          <button class="shop-action-btn" data-id="${p.id}" data-action="detail" title="ดูรายละเอียด">👁</button>
        </div>
        ${outOfStock ? '<div class="shop-card__out-overlay">หมดสต็อก</div>' : ''}
      </div>
      <div class="shop-card__body">
        <div class="shop-card__brand">${p.brand}</div>
        <div class="shop-card__name">${p.name}</div>
        <div class="shop-card__rating">
          <span class="shop-card__stars">${stars}</span>
          <span class="shop-card__rating-num">${p.rating}</span>
          <span class="shop-card__rating-count">(${p.reviewCount.toLocaleString()})</span>
        </div>
        <div class="shop-card__price-row">
          <span class="shop-card__price">฿${p.price.toLocaleString()}</span>
          ${p.originalPrice > 0 ? `<span class="shop-card__original">฿${p.originalPrice.toLocaleString()}</span><span class="shop-card__discount">${discPct}</span>` : ''}
        </div>
        <button class="shop-card__atc" data-id="${p.id}" ${outOfStock ? 'disabled' : ''}>${outOfStock ? 'หมดสต็อก' : '🛒 หยิบใส่ตะกร้า'}</button>
      </div>
    </div>`;
  }).join('');

  renderPagination(total);
}

/* =============================================
   PAGINATION
============================================= */
function renderPagination(total) {
  const el = document.getElementById('shopPagination');
  if (!el) return;
  const totalPages = Math.ceil(total / state.perPage);
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn prev-next" ${state.page <= 1 ? 'disabled' : ''} data-pg="${state.page - 1}">← ก่อนหน้า</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - state.page) > 1) {
      if (i === 3 || i === totalPages - 2) html += `<span style="padding:0 4px;color:var(--text-m)">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-pg="${i}">${i}</button>`;
  }
  html += `<button class="page-btn prev-next" ${state.page >= totalPages ? 'disabled' : ''} data-pg="${state.page + 1}">ถัดไป →</button>`;
  el.innerHTML = html;
}

/* =============================================
   ACTIVE FILTER CHIPS
============================================= */
const CAT_LABELS = { all:'ทั้งหมด', dog:'น้องหมา', cat:'น้องแมว', food:'อาหาร', toy:'ของเล่น' };

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  const chips = [];

  if (state.search)           chips.push({ label: `🔍 "${state.search}"`,          key: 'search' });
  if (state.cat !== 'all')    chips.push({ label: `📂 ${CAT_LABELS[state.cat]}`,    key: 'cat' });
  if (state.maxPrice < 2000)  chips.push({ label: `💰 ≤ ฿${state.maxPrice.toLocaleString()}`, key: 'price' });
  if (state.minRating > 0)    chips.push({ label: `⭐ ${state.minRating}+`,          key: 'rating' });
  if (state.inStock)          chips.push({ label: `✅ พร้อมส่ง`,                     key: 'instock' });
  state.brands.forEach(b =>   chips.push({ label: `🏷 ${b}`,                        key: `brand:${b}` }));

  el.innerHTML = chips.map(c =>
    `<div class="active-filter-chip">
      ${c.label}
      <button class="active-filter-chip__remove" data-key="${c.key}">✕</button>
    </div>`).join('');
}

/* =============================================
   RENDER CATEGORY COUNTS
============================================= */
function renderCounts() {
  const all = PRODUCTS_DB.length;
  const dog  = PRODUCTS_DB.filter(p => p.tags.includes('dog')).length;
  const cat  = PRODUCTS_DB.filter(p => p.tags.includes('cat')).length;
  const food = PRODUCTS_DB.filter(p => p.tags.includes('food')).length;
  const toy  = PRODUCTS_DB.filter(p => p.tags.includes('toy')).length;
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
  set('cat-count-all', all);
  set('cat-count-dog', dog);
  set('cat-count-cat', cat);
  set('cat-count-food', food);
  set('cat-count-toy', toy);
}

/* =============================================
   RENDER BRAND CHECKBOXES
============================================= */
function renderBrandChecks() {
  const el = document.getElementById('brandChecks');
  if (!el) return;
  el.innerHTML = BRANDS.map(b => `
    <label class="filter-check-row">
      <input type="checkbox" class="brand-check" value="${b}" ${state.brands.includes(b) ? 'checked' : ''}/>
      <span>${b}</span>
    </label>`).join('');
  el.querySelectorAll('.brand-check').forEach(cb => {
    cb.addEventListener('change', () => {
      state.brands = [...el.querySelectorAll('.brand-check:checked')].map(c => c.value);
      state.page = 1;
      refresh();
    });
  });
}

/* =============================================
   RENDER CART DRAWER
============================================= */
function renderCartDrawer() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body || !footer) return;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty-msg"><div class="icon">🛒</div>ยังไม่มีสินค้าในตะกร้าค่ะ</div>`;
    footer.innerHTML = '';
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item__img"/>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">฿${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item__qty">
          <button class="cq-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="cq-num">${item.qty}</span>
          <button class="cq-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-id="${item.id}">🗑</button>
    </div>`).join('');

  footer.innerHTML = `
    <div class="cart-total-row">
      <span class="cart-total-label">รวมทั้งหมด</span>
      <span class="cart-total-val">฿${total.toLocaleString()}</span>
    </div>
    <button class="cart-checkout-btn" id="cartCheckoutBtn">🛍️ สั่งซื้อสินค้า</button>`;

  footer.querySelector('#cartCheckoutBtn')?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
}

/* =============================================
   FULL REFRESH
============================================= */
function refresh() {
  renderGrid();
  renderActiveFilters();
  updateBreadcrumb();
}

function updateBreadcrumb() {
  const el = document.getElementById('shopBreadcrumb');
  if (!el) return;
  if (state.cat !== 'all') el.textContent = `ร้านค้า > ${CAT_LABELS[state.cat]}`;
  else if (state.search)   el.textContent = `ร้านค้า > ค้นหา: "${state.search}"`;
  else                     el.textContent = 'ร้านค้า';
}

/* =============================================
   EVENT LISTENERS
============================================= */
function initEvents() {

  /* Search */
  const searchInput = document.getElementById('shopSearchInput');
  const searchClear = document.getElementById('shopSearchClear');
  let searchTimer;
  searchInput?.addEventListener('input', e => {
    state.search = e.target.value.trim();
    state.page = 1;
    searchClear.style.display = state.search ? 'block' : 'none';
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refresh, 280);
  });
  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    searchClear.style.display = 'none';
    state.page = 1;
    refresh();
  });

  /* Category pills */
  document.querySelectorAll('.filter-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.cat = btn.dataset.cat;
      state.page = 1;
      refresh();
    });
  });

  /* Price slider */
  const slider = document.getElementById('priceSlider');
  const priceMaxEl = document.getElementById('priceMax');
  slider?.addEventListener('input', e => {
    state.maxPrice = parseInt(e.target.value);
    if (priceMaxEl) priceMaxEl.textContent = state.maxPrice.toLocaleString();
    state.page = 1;
    refresh();
  });

  /* Rating filter */
  document.querySelectorAll('.filter-rating').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-rating').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.minRating = parseFloat(btn.dataset.min);
      state.page = 1;
      refresh();
    });
  });

  /* In-stock checkbox */
  document.getElementById('inStockOnly')?.addEventListener('change', e => {
    state.inStock = e.target.checked;
    state.page = 1;
    refresh();
  });

  /* Sort */
  document.getElementById('shopSort')?.addEventListener('change', e => {
    state.sort = e.target.value;
    state.page = 1;
    refresh();
  });

  /* View toggle */
  document.getElementById('viewGrid')?.addEventListener('click', () => {
    state.view = 'grid';
    document.getElementById('viewGrid').classList.add('active');
    document.getElementById('viewList').classList.remove('active');
    refresh();
  });
  document.getElementById('viewList')?.addEventListener('click', () => {
    state.view = 'list';
    document.getElementById('viewList').classList.add('active');
    document.getElementById('viewGrid').classList.remove('active');
    refresh();
  });

  /* Reset filters */
  const resetAll = () => {
    state.search = ''; state.cat = 'all'; state.maxPrice = 2000;
    state.brands = []; state.minRating = 0; state.inStock = false;
    state.page = 1;
    document.querySelectorAll('.filter-cat').forEach((b,i) => b.classList.toggle('active', i===0));
    document.querySelectorAll('.filter-rating').forEach((b,i) => b.classList.toggle('active', i===0));
    const sl = document.getElementById('priceSlider');
    if (sl) sl.value = 2000;
    if (priceMaxEl) priceMaxEl.textContent = '2,000';
    const si = document.getElementById('shopSearchInput');
    if (si) si.value = '';
    if (searchClear) searchClear.style.display = 'none';
    const is = document.getElementById('inStockOnly');
    if (is) is.checked = false;
    renderBrandChecks();
    refresh();
  };
  document.getElementById('resetFilters')?.addEventListener('click', resetAll);
  document.getElementById('emptyReset')?.addEventListener('click', resetAll);

  /* Remove active filter chip */
  document.getElementById('activeFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.active-filter-chip__remove');
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === 'search')  { state.search = ''; document.getElementById('shopSearchInput').value = ''; document.getElementById('shopSearchClear').style.display='none'; }
    if (key === 'cat')     { state.cat = 'all'; document.querySelectorAll('.filter-cat').forEach((b,i)=>b.classList.toggle('active',i===0)); }
    if (key === 'price')   { state.maxPrice = 2000; const sl=document.getElementById('priceSlider'); if(sl) sl.value=2000; if(priceMaxEl) priceMaxEl.textContent='2,000'; }
    if (key === 'rating')  { state.minRating = 0; document.querySelectorAll('.filter-rating').forEach((b,i)=>b.classList.toggle('active',i===0)); }
    if (key === 'instock') { state.inStock = false; const is=document.getElementById('inStockOnly'); if(is) is.checked=false; }
    if (key.startsWith('brand:')) {
      const brand = key.replace('brand:', '');
      state.brands = state.brands.filter(b => b !== brand);
      renderBrandChecks();
    }
    state.page = 1;
    refresh();
  });

  /* Grid delegation — Add to cart / wishlist / detail */
  document.getElementById('shopGrid')?.addEventListener('click', e => {
    const atcBtn = e.target.closest('.shop-card__atc');
    if (atcBtn) {
      e.stopPropagation();
      addToCart(atcBtn.dataset.id);
      return;
    }
    const wlBtn = e.target.closest('.wl-btn');
    if (wlBtn) {
      e.stopPropagation();
      toggleWishlist(wlBtn.dataset.id);
      return;
    }
    const detailBtn = e.target.closest('[data-action="detail"]');
    if (detailBtn) {
      e.stopPropagation();
      window.location.href = `product.html?id=${detailBtn.dataset.id}`;
      return;
    }
    const card = e.target.closest('.shop-card');
    if (card && card.dataset.id) {
      window.location.href = `product.html?id=${card.dataset.id}`;
    }
  });

  /* Pagination */
  document.getElementById('shopPagination')?.addEventListener('click', e => {
    const btn = e.target.closest('.page-btn:not(:disabled)');
    if (!btn || !btn.dataset.pg) return;
    state.page = parseInt(btn.dataset.pg);
    refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Cart button */
  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartClose   = document.getElementById('cartClose');

  const openCart  = () => { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; renderCartDrawer(); };
  const closeCart = () => { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };
  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  /* Cart drawer item events (delegated) */
  document.getElementById('cartBody')?.addEventListener('click', e => {
    const rm = e.target.closest('.cart-item__remove');
    if (rm) { removeFromCart(rm.dataset.id); return; }
    const cq = e.target.closest('.cq-btn');
    if (cq) { changeQty(cq.dataset.id, parseInt(cq.dataset.delta)); }
  });

  /* Filter sidebar mobile toggle */
  const sidebar = document.getElementById('shopSidebar');
  const filterToggle = document.getElementById('filterToggleBtn');
  let sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'shop-sidebar-overlay';
  document.body.appendChild(sidebarOverlay);

  const openSidebar  = () => { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeSidebar = () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); document.body.style.overflow = ''; };
  filterToggle?.addEventListener('click', openSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
}

/* =============================================
   TOAST
============================================= */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* =============================================
   URL PARAMS (deep-link support)
============================================= */
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get('cat');
  const search = params.get('search') || params.get('q');
  const sort   = params.get('sort');

  if (cat && ['dog','cat','food','toy','all'].includes(cat)) {
    state.cat = cat;
    document.querySelectorAll('.filter-cat').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
  }
  if (search) {
    state.search = search;
    const si = document.getElementById('shopSearchInput');
    if (si) si.value = search;
    const sc = document.getElementById('shopSearchClear');
    if (sc) sc.style.display = 'block';
  }
  if (sort && ['popular','rating','price-asc','price-desc','newest','name'].includes(sort)) {
    state.sort = sort;
    const sortEl = document.getElementById('shopSort');
    if (sortEl) sortEl.value = sort;
  }
}

/* =============================================
   INIT
============================================= */
(function init() {
  renderCounts();
  renderBrandChecks();
  readUrlParams();
  updateCartCount();
  refresh();
  initEvents();
})();
