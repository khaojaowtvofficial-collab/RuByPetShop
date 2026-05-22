/* =============================================
   checkout.js — Ruby Pet Shop Checkout Logic
   ============================================= */

'use strict';

// ===== CONSTANTS =====
const CART_KEY     = 'ruby_cart';
const SESSION_KEY  = 'ruby_user';
const DELIVERY_FEES = { flash: 50, kerry: 40, free: 0 };
const COUPONS = {
  RUBY10:     { type: 'percent', value: 10,  label: 'ลด 10%' },
  NEWMEMBER:  { type: 'percent', value: 15,  label: 'ลด 15% สำหรับสมาชิกใหม่' },
  FREESHIP:   { type: 'freeship',             label: 'ส่งฟรี' },
};
const FREE_SHIP_THRESHOLD = 500;
const COD_FEE = 20;

// ===== STATE =====
let cart          = [];
let currentStep   = 1;
let shippingData  = {};
let deliveryFee   = 50;        // default Flash
let deliveryName  = 'Flash Express';
let paymentMethod = 'card';
let couponCode    = null;
let couponDiscount = 0;
let qrInterval    = null;
let qrSeconds     = 600;       // 10 minutes

// Points
const POINTS_RATE    = 100;   // 100 pts = ฿10 discount
const POINTS_DIVISOR = 10;    // pts / 10 = baht value
let pointsBalance = 0;
let pointsUsed    = 0;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  prefillUserData();
  renderSummary();
  bindEvents();
  initDeliveryOptions();
  checkFreeShipping();
});

// ===== CART =====
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
  } catch { cart = []; }

  if (cart.length === 0) {
    showEmptyCart();
  }
}

function showEmptyCart() {
  document.querySelector('.checkout-layout').innerHTML = `
    <div class="co-empty-cart">
      <div class="co-empty-cart__icon">🛒</div>
      <h2>ตะกร้าสินค้าว่างเปล่า</h2>
      <p>ยังไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าก่อนนะคะ</p>
      <a href="index.html" class="btn btn-primary btn-lg">🛍️ ช้อปสินค้า</a>
    </div>`;
}

// ===== PREFILL FROM SESSION =====
function prefillUserData() {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!user) return;

    const nameEl = document.getElementById('firstName');
    const emailEl = document.getElementById('email');
    if (!nameEl || !emailEl) return;

    if (user.name) {
      const parts = user.name.split(' ');
      if (parts[0]) nameEl.value = parts[0];
      if (parts[1]) { const ln = document.getElementById('lastName'); if (ln) ln.value = parts.slice(1).join(' '); }
    }
    if (user.email) emailEl.value = user.email;
  } catch { /* ignore */ }
}

// ===== RENDER ORDER SUMMARY =====
function renderSummary() {
  if (cart.length === 0) return;

  const subtotal = calcSubtotal();
  const discount = calcDiscount(subtotal);
  const shipping  = calcShipping(subtotal);
  const codFee    = paymentMethod === 'cod' ? COD_FEE : 0;
  const total     = subtotal - discount + shipping + codFee;
  const points    = Math.floor(total / 10);

  // Item count
  const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const countEl = document.getElementById('summaryItemCount');
  if (countEl) countEl.textContent = `${totalQty} รายการ`;

  // Items list
  const itemsEl = document.getElementById('summaryItems');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="summary-item">
        <div class="summary-item__img">
          ${item.img || item.image ? `<img src="${item.img || item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.parentElement.innerHTML='🐾'"/>` : '🐾'}
          <span class="summary-item__qty">${item.qty || 1}</span>
        </div>
        <div class="summary-item__info">
          <div class="summary-item__name">${item.name || 'สินค้า'}</div>
          ${item.variant ? `<div class="summary-item__variant">${item.variant}</div>` : ''}
        </div>
        <div class="summary-item__price">฿${fmt((item.price || 0) * (item.qty || 1))}</div>
      </div>
    `).join('');
  }

  // Rows
  const rowsEl = document.getElementById('summaryRows');
  if (rowsEl) {
    let html = `
      <div class="summary-row">
        <span class="label">ราคาสินค้า</span>
        <span class="value">฿${fmt(subtotal)}</span>
      </div>`;

    if (discount > 0) {
      html += `
      <div class="summary-row">
        <span class="label">ส่วนลด (${couponCode})</span>
        <span class="value green">-฿${fmt(discount)}</span>
      </div>`;
    }

    const ptsBaht = calcPointsDiscount();
    if (ptsBaht > 0) {
      html += `
      <div class="summary-row">
        <span class="label">🌟 Ruby Points (${pointsUsed} แต้ม)</span>
        <span class="value green">-฿${fmt(ptsBaht)}</span>
      </div>`;
    }

    html += `
      <div class="summary-row">
        <span class="label">ค่าจัดส่ง (${deliveryName})</span>
        <span class="value ${shipping === 0 ? 'green' : ''}">
          ${shipping === 0 ? 'ฟรี!' : '฿' + fmt(shipping)}
        </span>
      </div>`;

    if (codFee > 0) {
      html += `
      <div class="summary-row">
        <span class="label">ค่าบริการ COD</span>
        <span class="value orange">+฿${fmt(codFee)}</span>
      </div>`;
    }

    rowsEl.innerHTML = html;
  }

  // Total
  const totalEl = document.getElementById('summaryTotal');
  if (totalEl) {
    totalEl.innerHTML = `
      <span class="label">ยอดรวมทั้งหมด</span>
      <span class="value">฿${fmt(total)}</span>`;
  }

  // Points
  const pointsEl = document.getElementById('earnPoints');
  if (pointsEl) pointsEl.textContent = points;
}

// ===== CALCULATIONS =====
function calcSubtotal() {
  return cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
}

function calcDiscount(subtotal) {
  if (!couponCode || !COUPONS[couponCode]) return 0;
  const c = COUPONS[couponCode];
  if (c.type === 'percent') return Math.floor(subtotal * c.value / 100);
  return 0;
}

function calcShipping(subtotal) {
  // Free shipping coupon
  if (couponCode && COUPONS[couponCode]?.type === 'freeship') return 0;
  // Free shipping threshold
  if (subtotal >= FREE_SHIP_THRESHOLD && deliveryFee > 0) {
    // Only auto-free if selected delivery is not already forced-free
    const sel = document.querySelector('input[name="delivery"]:checked');
    if (sel && sel.value === 'free') return 0;
  }
  return deliveryFee;
}

function calcPointsDiscount() {
  return Math.floor(pointsUsed / POINTS_DIVISOR);   // 100 pts → ฿10
}

function calcTotal() {
  const sub = calcSubtotal();
  return Math.max(0, sub - calcDiscount(sub) - calcPointsDiscount() + calcShipping(sub) + (paymentMethod === 'cod' ? COD_FEE : 0));
}

// ===== STEP NAVIGATION =====
function goToStep(n) {
  // Update steps
  document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`step-${n}`);
  if (target) { target.classList.add('active'); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  // Update indicator
  [1, 2, 3].forEach(i => {
    const ind = document.getElementById(`step-ind-${i}`);
    if (!ind) return;
    ind.classList.remove('active', 'done');
    if (i < n)  ind.classList.add('done');
    if (i === n) ind.classList.add('active');
  });

  // Update lines
  const l12 = document.getElementById('line-1-2');
  const l23 = document.getElementById('line-2-3');
  if (l12) { l12.classList.remove('active', 'done'); if (n >= 2) l12.classList.add(n > 2 ? 'done' : 'active'); }
  if (l23) { l23.classList.remove('active', 'done'); if (n >= 3) l23.classList.add('active'); }

  currentStep = n;
  renderSummary();
}

// ===== FORM VALIDATION (Step 1) =====
function validateShipping() {
  const fields = ['firstName', 'lastName', 'phone', 'email', 'address', 'province', 'zipcode'];
  let valid = true;

  fields.forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    if (!el) return;

    const val = el.value.trim();
    let msg = '';

    if (!val) {
      msg = 'กรุณากรอกข้อมูลนี้';
    } else if (id === 'phone' && !/^[0-9\-+]{9,12}$/.test(val.replace(/\s/g, ''))) {
      msg = 'เบอร์โทรไม่ถูกต้อง';
    } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'อีเมลไม่ถูกต้อง';
    } else if (id === 'zipcode' && !/^\d{5}$/.test(val)) {
      msg = 'รหัสไปรษณีย์ต้อง 5 หลัก';
    }

    if (msg) {
      el.classList.add('error');
      if (err) err.textContent = msg;
      valid = false;
    } else {
      el.classList.remove('error');
      if (err) err.textContent = '';
    }
  });

  return valid;
}

// ===== COLLECT SHIPPING DATA =====
function collectShippingData() {
  shippingData = {
    firstName : (document.getElementById('firstName')?.value || '').trim(),
    lastName  : (document.getElementById('lastName')?.value || '').trim(),
    phone     : (document.getElementById('phone')?.value || '').trim(),
    email     : (document.getElementById('email')?.value || '').trim(),
    address   : (document.getElementById('address')?.value || '').trim(),
    province  : (document.getElementById('province')?.value || '').trim(),
    zipcode   : (document.getElementById('zipcode')?.value || '').trim(),
    note      : (document.getElementById('note')?.value || '').trim(),
    delivery  : deliveryName,
    deliveryFee,
  };
}

// ===== DELIVERY OPTIONS =====
function initDeliveryOptions() {
  document.querySelectorAll('.delivery-opt input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.delivery-opt').forEach(opt => opt.classList.remove('active'));
      const label = e.target.closest('.delivery-opt');
      if (label) label.classList.add('active');

      const val = e.target.value;
      deliveryFee  = DELIVERY_FEES[val] ?? 50;
      deliveryName = val === 'flash' ? 'Flash Express'
                   : val === 'kerry' ? 'Kerry Express'
                   : 'ส่งฟรี';
      renderSummary();
    });
  });
}

function checkFreeShipping() {
  const sub = calcSubtotal();
  const freeRadio = document.getElementById('freeShipping');
  const freeLabel = document.getElementById('freeShippingLabel');
  const optFree   = document.getElementById('opt-free');

  if (!freeRadio) return;

  if (sub >= FREE_SHIP_THRESHOLD) {
    freeRadio.disabled = false;
    if (freeLabel) freeLabel.textContent = '🎉 คุณมีสิทธิ์ส่งฟรี!';
    if (optFree)   optFree.classList.remove('disabled');
    // Auto-select free shipping
    freeRadio.checked = true;
    if (optFree) optFree.classList.add('active');
    document.querySelector('#opt-flash')?.classList.remove('active');
    document.querySelector('#opt-kerry')?.classList.remove('active');
    deliveryFee  = 0;
    deliveryName = 'ส่งฟรี';
  } else {
    const remaining = FREE_SHIP_THRESHOLD - sub;
    if (freeLabel) freeLabel.textContent = `ซื้อเพิ่ม ฿${fmt(remaining)} เพื่อส่งฟรี`;
    if (optFree) optFree.classList.add('disabled');
  }
}

// ===== SHIPPING SUMMARY (Step 2) =====
function renderShippingSummary() {
  const el = document.getElementById('shippingSummary');
  if (!el || !shippingData.firstName) return;

  const deliveryText = deliveryFee === 0 ? 'ส่งฟรี' : `${deliveryName} (+฿${deliveryFee})`;

  el.innerHTML = `
    <strong>📍 ส่งถึง:</strong> ${shippingData.firstName} ${shippingData.lastName}<br/>
    ${shippingData.address} ${shippingData.province} ${shippingData.zipcode}<br/>
    📞 ${shippingData.phone} &nbsp;|&nbsp; 🚚 ${deliveryText}
  `;
}

// ===== PAYMENT METHODS =====
function initPaymentMethods() {
  const methods = ['card', 'promptpay', 'truewallet', 'cod'];
  const bodies = {
    card       : 'card-form-wrap',
    promptpay  : 'promptpay-wrap',
    truewallet : 'truewallet-wrap',
    cod        : 'cod-wrap',
  };

  methods.forEach(method => {
    const radio = document.querySelector(`input[name="payment"][value="${method}"]`);
    if (!radio) return;

    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      paymentMethod = method;

      // Toggle bodies
      methods.forEach(m => {
        const body = document.getElementById(bodies[m]);
        const card = document.getElementById(`pm-${m}`);
        if (body) body.classList.add('hidden');
        if (card) card.classList.remove('selected');
      });

      const activeBody = document.getElementById(bodies[method]);
      const activeCard = document.getElementById(`pm-${method}`);
      if (activeBody) activeBody.classList.remove('hidden');
      if (activeCard) activeCard.classList.add('selected');

      // Start QR timer on PromptPay
      if (method === 'promptpay') startQrTimer();
      else stopQrTimer();

      renderSummary();
    });
  });

  // Mark first selected
  const firstRadio = document.querySelector('input[name="payment"][value="card"]');
  if (firstRadio) { firstRadio.dispatchEvent(new Event('change')); }
}

// ===== CREDIT CARD FORMATTING =====
function initCardFormatting() {
  const numInput = document.getElementById('cardNumber');
  if (numInput) {
    numInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = val;

      const icon = document.getElementById('cardTypeIcon');
      if (icon) {
        const first = val.charAt(0);
        icon.textContent = first === '4' ? '💳' : first === '5' ? '🔷' : first === '3' ? '🟦' : '💳';
      }
    });
  }

  const expInput = document.getElementById('cardExpiry');
  if (expInput) {
    expInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 2) val = val.slice(0, 2) + ' / ' + val.slice(2);
      e.target.value = val;
    });
  }
}

// ===== QR TIMER =====
function startQrTimer() {
  stopQrTimer();
  qrSeconds = 600;

  const qrBox = document.getElementById('qrBox');
  if (qrBox) {
    setTimeout(() => qrBox.classList.add('loaded'), 800);
  }

  updateQrDisplay();
  qrInterval = setInterval(() => {
    qrSeconds--;
    if (qrSeconds <= 0) {
      stopQrTimer();
      const timerEl = document.getElementById('qrTimer');
      if (timerEl) timerEl.textContent = 'หมดอายุ';
      if (qrBox) {
        qrBox.classList.remove('loaded');
        qrBox.innerHTML = '<div class="qr-loading">QR หมดอายุ — กรุณารีเฟรช</div>';
      }
    } else {
      updateQrDisplay();
    }
  }, 1000);
}

function stopQrTimer() {
  if (qrInterval) { clearInterval(qrInterval); qrInterval = null; }
}

function updateQrDisplay() {
  const el = document.getElementById('qrTimer');
  if (!el) return;
  const m = Math.floor(qrSeconds / 60).toString().padStart(2, '0');
  const s = (qrSeconds % 60).toString().padStart(2, '0');
  el.textContent = `${m}:${s}`;
  if (qrSeconds <= 60) el.style.color = '#e53935';
}

// ===== COUPON =====
function applyCoupon() {
  const input = document.getElementById('couponInput');
  const result = document.getElementById('couponResult');
  if (!input || !result) return;

  const code = input.value.trim().toUpperCase();
  result.className = 'coupon-result';

  if (!code) {
    result.textContent = 'กรุณากรอกรหัสคูปอง';
    result.classList.add('error');
    return;
  }

  if (COUPONS[code]) {
    couponCode = code;
    const c = COUPONS[code];
    if (c.type === 'percent') {
      const sub = calcSubtotal();
      const saved = Math.floor(sub * c.value / 100);
      result.textContent = `✅ ใช้คูปองสำเร็จ! ${c.label} ประหยัด ฿${fmt(saved)}`;
    } else {
      result.textContent = `✅ ใช้คูปองสำเร็จ! ${c.label}`;
    }
    result.classList.add('success');
    renderSummary();
  } else {
    couponCode = null;
    couponDiscount = 0;
    result.textContent = '❌ รหัสคูปองไม่ถูกต้อง หรือหมดอายุแล้ว';
    result.classList.add('error');
    renderSummary();
  }
}

// ===== RENDER CONFIRM STEP =====
function renderConfirmStep() {
  // Confirm sections (2-col grid)
  const sectionsEl = document.getElementById('confirmSections');
  if (sectionsEl && shippingData.firstName) {

    const pmLabel = { card: '💳 บัตรเครดิต/เดบิต', promptpay: '📱 PromptPay QR', truewallet: '💜 True Money Wallet', cod: '💵 เก็บเงินปลายทาง' };
    const sub      = calcSubtotal();
    const discount = calcDiscount(sub);
    const shipping  = calcShipping(sub);
    const codFee    = paymentMethod === 'cod' ? COD_FEE : 0;
    const total     = sub - discount + shipping + codFee;

    sectionsEl.innerHTML = `
      <div class="confirm-block">
        <div class="confirm-block__title">📍 ที่อยู่จัดส่ง</div>
        <div class="confirm-block__content">
          <strong>${shippingData.firstName} ${shippingData.lastName}</strong><br/>
          ${shippingData.address}<br/>
          ${shippingData.province} ${shippingData.zipcode}<br/>
          📞 ${shippingData.phone}
          ${shippingData.note ? `<br/>📝 ${shippingData.note}` : ''}
        </div>
      </div>
      <div class="confirm-block">
        <div class="confirm-block__title">💳 การชำระเงิน</div>
        <div class="confirm-block__content">
          ${pmLabel[paymentMethod] || paymentMethod}<br/>
          🚚 ${shippingData.delivery}<br/>
          ${couponCode ? `🎫 คูปอง: <strong>${couponCode}</strong><br/>` : ''}${pointsUsed > 0 ? `🌟 Ruby Points: <strong>${pointsUsed} แต้ม (-฿${fmt(calcPointsDiscount())})</strong><br/>` : ''}
          <strong style="font-size:15px;color:var(--orange)">ยอดรวม: ฿${fmt(total)}</strong>
        </div>
      </div>
    `;
  }

  // Items
  const itemsEl = document.getElementById('confirmItems');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="confirm-item">
        <div class="confirm-item__img">
          ${item.img || item.image ? `<img src="${item.img || item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.parentElement.innerHTML='🐾'"/>` : '🐾'}
        </div>
        <div class="confirm-item__info">
          <div class="confirm-item__name">${item.name || 'สินค้า'}</div>
          <div class="confirm-item__variant">x${item.qty || 1} ${item.variant || ''}</div>
        </div>
        <div class="confirm-item__price">฿${fmt((item.price || 0) * (item.qty || 1))}</div>
      </div>
    `).join('');
  }
}

// ===== SEND TO WHATSAPP =====
// ===== RENDER CONFIRM ITEMS (step 2) =====
function renderConfirmItems() {
  const el = document.getElementById('confirmItems');
  if (!el) return;
  el.innerHTML = cart.map(i => `
    <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0">
      <img src="${i.img || i.image || ''}" style="width:52px;height:52px;object-fit:cover;border-radius:10px" onerror="this.style.display='none'"/>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${i.name}</div>
        <div style="font-size:13px;color:#888">x${i.qty || 1}</div>
      </div>
      <div style="font-weight:700;color:#FF7043">฿${((i.price)*(i.qty||1)).toLocaleString()}</div>
    </div>
  `).join('');
}

// ===== SEND TO WHATSAPP =====
function placeOrder() {
  const btn = document.getElementById('confirmOrderBtn');
  if (!btn || btn.disabled) return;

  btn.disabled = true;
  btn.textContent = '⏳ กำลังเปิด WhatsApp...';

  // Build WhatsApp message & redirect
  (() => {
    const orderId  = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
    const total    = calcTotal();

    // Build message
    const itemLines = cart.map(i =>
      `• ${i.name} x${i.qty || 1} — ฿${((i.price) * (i.qty || 1)).toLocaleString()}`
    ).join('\n');

    const addr = [
      shippingData.address,
      shippingData.district,
      shippingData.province,
    ].filter(Boolean).join(' ');

    const msg = [
      `🛍️ คำสั่งซื้อใหม่ — Ruby Pet Shop`,
      `🔖 เลขที่: ${orderId}`,
      ``,
      `📦 รายการสินค้า:`,
      itemLines,
      ``,
      `💰 ยอดสินค้า: ฿${subtotal.toLocaleString()}`,
      deliveryFee > 0 ? `🚚 ค่าจัดส่ง: ฿${deliveryFee.toLocaleString()}` : `🚚 ส่งฟรี`,
      couponDiscount > 0 ? `🎫 ส่วนลดคูปอง: -฿${couponDiscount.toLocaleString()}` : null,
      `💳 ยอดรวม: ฿${total.toLocaleString()}`,
      ``,
      `📍 ที่อยู่จัดส่ง:`,
      `👤 ชื่อ: ${shippingData.name || ''}`,
      `📞 เบอร์: ${shippingData.phone || ''}`,
      addr ? `🏠 ที่อยู่: ${addr}` : null,
      shippingData.note ? `📝 หมายเหตุ: ${shippingData.note}` : null,
      ``,
      `กรุณายืนยันออเดอร์และแจ้งช่องทางชำระเงินด้วยนะคะ 🙏`,
    ].filter(l => l !== null).join('\n');

    // Clear cart
    localStorage.removeItem(CART_KEY);

    // Open WhatsApp
    const waUrl = `https://wa.me/85620789262​45?text=${encodeURIComponent(msg)}`;
    // Note: WhatsApp number = +856 20 78926245 (Laos)
    window.open(waUrl, '_blank');

    // Show success state
    showSuccess(orderId);
  })();
}

// ===== SUCCESS OVERLAY =====
function showSuccess(orderId) {
  const overlay = document.getElementById('successOverlay');
  if (!overlay) return;

  // Set order ID
  const idEl = document.getElementById('successOrderId');
  if (idEl) idEl.textContent = orderId;

  // Email note
  const emailNoteEl = document.getElementById('successEmailNote');
  if (emailNoteEl && shippingData.email) {
    emailNoteEl.textContent = `ส่งรายละเอียดคำสั่งซื้อไปที่ ${shippingData.email} แล้ว`;
  }

  // Info grid
  const infoGrid = document.getElementById('successInfoGrid');
  if (infoGrid) {
    const pmLabel = { card: 'บัตรเครดิต/เดบิต', promptpay: 'PromptPay QR', truewallet: 'True Money', cod: 'COD' };
    const total = calcTotal();

    infoGrid.innerHTML = `
      <div class="suc-info-box">
        <div class="suc-info-box__label">ยอดชำระ</div>
        <div class="suc-info-box__value">฿${fmt(total)}</div>
      </div>
      <div class="suc-info-box">
        <div class="suc-info-box__label">วิธีชำระ</div>
        <div class="suc-info-box__value">${pmLabel[paymentMethod] || paymentMethod}</div>
      </div>
      <div class="suc-info-box">
        <div class="suc-info-box__label">จัดส่งโดย</div>
        <div class="suc-info-box__value">${deliveryName}</div>
      </div>
      <div class="suc-info-box">
        <div class="suc-info-box__label">ประมาณการถึง</div>
        <div class="suc-info-box__value">${getEstimatedDate()}</div>
      </div>
    `;
  }

  // Update receipt link with order ID
  const receiptLink = document.getElementById('receiptLink');
  if (receiptLink) {
    receiptLink.href = `receipt.html?id=${encodeURIComponent(orderId)}`;
  }

  overlay.classList.add('visible');
  stopQrTimer();
}

function getEstimatedDate() {
  const days = deliveryName.includes('Flash') ? 2 : deliveryName.includes('Kerry') ? 3 : 4;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

// ===== UTILITY =====
function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== RUBY POINTS SECTION =====
function loadPointsBalance() {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!user) return 0;
    const fromOrders = (user.orders || []).reduce((s, o) => s + Math.floor((o.total || 0) / 100) * 10, 0);
    return (user.extraPoints || 0) + fromOrders;
  } catch { return 0; }
}

function initPointsSection() {
  pointsBalance = loadPointsBalance();

  const section     = document.getElementById('pointsSection');
  const guestNotice = document.getElementById('pointsGuestNotice');
  const loginLink   = document.getElementById('pointsLoginLink');

  // Check if user is logged in
  let isLoggedIn = false;
  try {
    const u = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    isLoggedIn = !!(u && u.name);
  } catch { }

  if (!isLoggedIn) {
    if (guestNotice) guestNotice.style.display = 'flex';
    loginLink?.addEventListener('click', e => { e.preventDefault(); window.location.href = 'index.html'; });
    return;
  }

  if (section) section.style.display = 'block';

  // Populate balance display
  const ptsNum = document.getElementById('ptsNum');
  const ptsVal = document.getElementById('ptsVal');
  const slider  = document.getElementById('pointsSlider');
  const input   = document.getElementById('pointsInput');
  const sliderMax = document.getElementById('pointsSliderMax');

  if (ptsNum) ptsNum.textContent = pointsBalance.toLocaleString();
  if (ptsVal) ptsVal.textContent = `(มูลค่า ฿${Math.floor(pointsBalance / POINTS_DIVISOR).toLocaleString()})`;

  // Cap usable points to available balance and max 30% of subtotal
  function getMaxUsable() {
    const sub = calcSubtotal();
    const maxByOrder = Math.floor(sub * 0.3 / (1 / POINTS_DIVISOR) / POINTS_RATE) * POINTS_RATE;
    return Math.min(pointsBalance, maxByOrder);
  }

  function updateSliderRange() {
    const max = getMaxUsable();
    if (slider) { slider.max = max; slider.step = POINTS_RATE; }
    if (input)  { input.max  = max; }
    if (sliderMax) sliderMax.textContent = `${max.toLocaleString()} แต้ม`;
  }
  updateSliderRange();

  function applyPoints(pts) {
    const max = getMaxUsable();
    pts = Math.min(Math.max(0, Math.floor(pts / POINTS_RATE) * POINTS_RATE), max);
    pointsUsed = pts;
    if (slider) slider.value = pts;
    if (input)  input.value  = pts || '';
    const preview = document.getElementById('pointsDiscountPreview');
    if (preview) {
      if (pts > 0) {
        preview.textContent = `✅ ใช้ ${pts.toLocaleString()} แต้ม → ลด ฿${Math.floor(pts / POINTS_DIVISOR).toLocaleString()}`;
        preview.classList.add('active');
      } else {
        preview.classList.remove('active');
      }
    }
    renderSummary();
  }

  // Toggle
  const toggle = document.getElementById('usePointsToggle');
  const body   = document.getElementById('pointsRedeemBody');
  toggle?.addEventListener('change', () => {
    if (toggle.checked) {
      if (body) body.style.display = 'flex';
      updateSliderRange();
    } else {
      if (body) body.style.display = 'none';
      applyPoints(0);
    }
  });

  // Slider input
  slider?.addEventListener('input', () => applyPoints(parseInt(slider.value, 10) || 0));

  // Number input
  input?.addEventListener('input', () => {
    const val = parseInt(input.value, 10) || 0;
    applyPoints(val);
    if (slider) slider.value = Math.min(val, parseInt(slider.max, 10));
  });

  // Use all button
  document.getElementById('useAllPtsBtn')?.addEventListener('click', () => {
    applyPoints(getMaxUsable());
  });
}

// ===== BIND ALL EVENTS =====
function bindEvents() {
  // ---- Step 1: Shipping Form Submit ----
  const shippingForm = document.getElementById('shippingForm');
  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateShipping()) return;
      collectShippingData();
      renderShippingSummary();
      renderConfirmItems();
      goToStep(2);
      renderSummary();
    });
  }

  // Clear error on input
  document.querySelectorAll('.co-field input, .co-field select').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errId = `err-${el.id}`;
      const errEl = document.getElementById(errId);
      if (errEl) errEl.textContent = '';
    });
  });

  // ---- Back Buttons ----
  document.querySelectorAll('.co-back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.dataset.goto, 10);
      goToStep(target);
    });
  });

  // ---- Coupon ----
  const applyBtn = document.getElementById('applyCouponBtn');
  if (applyBtn) applyBtn.addEventListener('click', applyCoupon);

  const couponInput = document.getElementById('couponInput');
  if (couponInput) {
    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });
  }

  // Coupon hints (click to fill)
  document.querySelectorAll('.coupon-hint').forEach(hint => {
    hint.addEventListener('click', () => {
      const code = hint.dataset.code;
      const input = document.getElementById('couponInput');
      if (input) { input.value = code; applyCoupon(); }
    });
  });

  // ---- Terms checkbox ----
  const termsCheckbox = document.getElementById('agreeTerms');
  const confirmBtn    = document.getElementById('confirmOrderBtn');
  if (termsCheckbox && confirmBtn) {
    termsCheckbox.addEventListener('change', () => {
      confirmBtn.disabled = !termsCheckbox.checked;
    });
  }

  // ---- Confirm Order ----
  if (confirmBtn) {
    confirmBtn.addEventListener('click', placeOrder);
  }

  // ---- Track Order ----
  const trackBtn = document.getElementById('trackOrderBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      const orderId = document.getElementById('successOrderId')?.textContent || '';
      window.location.href = orderId
        ? `tracking.html?id=${encodeURIComponent(orderId)}`
        : 'tracking.html';
    });
  }


  // ---- Share buttons ----
  document.querySelector('.share-fb')?.addEventListener('click', () => {
    showToast('📘 แชร์ไปยัง Facebook แล้ว!');
  });
  document.querySelector('.share-line')?.addEventListener('click', () => {
    showToast('💬 แชร์ไปยัง LINE แล้ว!');
  });

  // ---- PromptPay discount note ----
  document.querySelector('input[value="promptpay"]')?.addEventListener('change', () => {
    showToast('📱 PromptPay รับส่วนลดเพิ่ม 2% ของยอดสินค้า');
  });
}
