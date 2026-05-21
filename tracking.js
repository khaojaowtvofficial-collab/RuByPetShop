/* =============================================
   tracking.js — Ruby Pet Shop Order Tracking
   ============================================= */

'use strict';

const SESSION_KEY = 'ruby_user';

/* =============================================
   DEMO ORDERS (for testing without account)
============================================= */
const DEMO_ORDERS = {
  'ORD-2026-001': {
    id: 'ORD-2026-001',
    date: '18 พ.ค. 2026',
    status: 'delivered',
    total: 1589,
    products: 'Royal Canin Adult 15kg, ขนม Dentastix',
    carrier: 'flash',
    tracking: 'FLASH123456TH',
    workflow: ['pending','paid','preparing','shipped','delivered'],
    wfDates: ['18 พ.ค.','18 พ.ค.','19 พ.ค.','19 พ.ค.','20 พ.ค.'],
  },
  'ORD-2026-002': {
    id: 'ORD-2026-002',
    date: '20 พ.ค. 2026',
    status: 'shipped',
    total: 299,
    products: 'Whiskas ปลาแซลมอน 1.2kg',
    carrier: 'kerry',
    tracking: 'KERRY789012TH',
    workflow: ['pending','paid','preparing','shipped','delivered'],
    wfDates: ['20 พ.ค.','20 พ.ค.','20 พ.ค.','21 พ.ค.',''],
  },
  'ORD-2026-003': {
    id: 'ORD-2026-003',
    date: '20 พ.ค. 2026',
    status: 'preparing',
    total: 790,
    products: 'Kong Classic M, ของเล่นแมวขนนก',
    carrier: null,
    tracking: null,
    workflow: ['pending','paid','preparing','shipped','delivered'],
    wfDates: ['20 พ.ค.','20 พ.ค.','21 พ.ค.','',''],
  },
};

/* =============================================
   WORKFLOW CONFIG
============================================= */
const WORKFLOW = [
  { key: 'pending',   label: 'รอชำระ',    icon: '⏳' },
  { key: 'paid',      label: 'ชำระแล้ว',  icon: '💳' },
  { key: 'preparing', label: 'จัดเตรียม', icon: '📦' },
  { key: 'shipped',   label: 'จัดส่งแล้ว',icon: '🚚' },
  { key: 'delivered', label: 'ได้รับแล้ว',icon: '✅' },
];

const STATUS_TEXT = {
  pending:   '⏳ รอชำระเงิน',
  paid:      '💳 ชำระแล้ว',
  preparing: '📦 กำลังจัดเตรียม',
  shipped:   '🚚 จัดส่งแล้ว',
  delivered: '✅ ได้รับแล้ว',
  cancelled: '❌ ยกเลิกแล้ว',
};

const CARRIER_INFO = {
  flash: { name: 'Flash Express', icon: '⚡', url: 'https://www.flashexpress.co.th/tracking/' },
  kerry: { name: 'Kerry Express',  icon: '📦', url: 'https://th.kerryexpress.com/en/track/' },
  jt:    { name: 'J&T Express',   icon: '🚀', url: 'https://www.jtexpress.co.th/index/query/gbc.html' },
};

/* =============================================
   LOOKUP ORDER
============================================= */
function findOrder(id) {
  const key = id.trim().toUpperCase();

  // 1. Check localStorage user orders
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (user && Array.isArray(user.orders)) {
      const found = user.orders.find(o => o.id.toUpperCase() === key);
      if (found) return normalizeOrder(found);
    }
  } catch { /* ignore */ }

  // 2. Check demo orders
  if (DEMO_ORDERS[key]) return DEMO_ORDERS[key];

  return null;
}

function normalizeOrder(o) {
  // Ensure demo-compatible shape
  return {
    id:       o.id,
    date:     o.date || '',
    status:   o.status || 'pending',
    total:    o.total || 0,
    products: o.products || '',
    carrier:  o.carrier || guessCarrier(o),
    tracking: o.tracking || null,
    workflow: o.workflow || ['pending','paid','preparing','shipped','delivered'],
    wfDates:  o.wfDates || [],
  };
}

function guessCarrier(o) {
  if (o.tracking) {
    if (o.tracking.startsWith('FLASH')) return 'flash';
    if (o.tracking.startsWith('KERRY')) return 'kerry';
  }
  return 'flash'; // default
}

/* =============================================
   RENDER RESULT
============================================= */
function renderResult(order) {
  // Show result area
  document.getElementById('trkResult').style.display   = '';
  document.getElementById('trkNotFound').style.display = 'none';
  document.getElementById('trkLoading').style.display  = 'none';

  // Header
  document.getElementById('resOrderId').textContent = order.id;
  document.getElementById('resOrderMeta').textContent = `วันที่สั่งซื้อ: ${order.date} · ยอดรวม: ฿${Number(order.total).toLocaleString()}`;

  const chip = document.getElementById('resStatusChip');
  chip.textContent = STATUS_TEXT[order.status] || order.status;
  chip.className   = `trk-status-chip ${order.status}`;

  // Timeline
  renderTimeline(order);

  // Carrier
  renderCarrier(order);

  // Items
  renderItems(order);

  // Share button
  document.getElementById('trkShareBtn').onclick = () => {
    const text = `ดูสถานะออเดอร์ ${order.id} จาก Ruby Pet Shop 🐾`;
    if (navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => showToast('🔗 คัดลอกลิงก์แล้ว!'));
    }
  };

  // Receipt button — add dynamically if not exists
  const actionsEl = document.querySelector('.trk-actions');
  if (actionsEl && !document.getElementById('trkReceiptBtn')) {
    const rcptBtn = document.createElement('a');
    rcptBtn.id = 'trkReceiptBtn';
    rcptBtn.href = `receipt.html?id=${encodeURIComponent(order.id)}`;
    rcptBtn.className = 'btn btn-outline btn-lg';
    rcptBtn.textContent = '🧾 ดูใบเสร็จ';
    actionsEl.insertBefore(rcptBtn, actionsEl.children[1]);
  } else if (document.getElementById('trkReceiptBtn')) {
    document.getElementById('trkReceiptBtn').href = `receipt.html?id=${encodeURIComponent(order.id)}`;
  }
}

function renderTimeline(order) {
  const container = document.getElementById('resTimeline');
  const currentIdx = WORKFLOW.findIndex(s => s.key === order.status);

  let html = '';
  WORKFLOW.forEach((step, i) => {
    const isDone   = i < currentIdx;
    const isActive = i === currentIdx;
    const cls      = isDone ? 'done' : isActive ? 'active' : '';
    const date     = order.wfDates?.[i] || '';

    html += `<div class="trk-step ${cls}">
      <div class="trk-step__dot">${isDone ? '✓' : step.icon}</div>
      <div class="trk-step__label">${step.label}</div>
      ${date ? `<div class="trk-step__date">${date}</div>` : ''}
    </div>`;

    if (i < WORKFLOW.length - 1) {
      const lineCls = isDone ? 'done' : isActive ? 'active' : '';
      html += `<div class="trk-step-line ${lineCls}"></div>`;
    }
  });

  container.innerHTML = html;
}

function renderCarrier(order) {
  const card = document.getElementById('resCarrierCard');
  if (!order.tracking || !order.carrier) { card.style.display = 'none'; return; }

  const c = CARRIER_INFO[order.carrier] || { name: order.carrier, icon: '🚚', url: '#' };
  card.style.display = '';
  document.getElementById('resCarrier').innerHTML = `
    <div class="trk-carrier__logo">${c.icon}</div>
    <div class="trk-carrier__info">
      <div class="trk-carrier__name">${c.name}</div>
      <div class="trk-carrier__tracking">เลขพัสดุ: <strong>${order.tracking}</strong></div>
    </div>
    <a href="${c.url}${order.tracking}" target="_blank" rel="noopener" class="trk-carrier__track-btn">
      🔍 ติดตามบนเว็บ
    </a>`;
}

function renderItems(order) {
  const items = (order.products || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const icons = ['🐾','🦴','🐱','🐶','🎾','🍖','🧶','🏠'];
  const itemsHtml = items.map((name, i) => `
    <div class="trk-item-row">
      <div class="trk-item-row__icon">${icons[i % icons.length]}</div>
      <div class="trk-item-row__name">${name}</div>
    </div>`).join('');

  document.getElementById('resItems').innerHTML = itemsHtml || '<p style="color:var(--muted);font-size:14px">ไม่มีข้อมูลสินค้า</p>';
  document.getElementById('resTotal').innerHTML = `
    <span>ยอดรวมทั้งหมด</span>
    <span class="trk-total-row__val">฿${Number(order.total).toLocaleString()}</span>`;
}

/* =============================================
   SEARCH LOGIC
============================================= */
function doSearch(id) {
  if (!id.trim()) { showToast('⚠️ กรุณากรอกหมายเลขคำสั่งซื้อ'); return; }

  // Show loading
  document.getElementById('trkResult').style.display   = 'none';
  document.getElementById('trkNotFound').style.display = 'none';
  document.getElementById('trkLoading').style.display  = '';

  // Simulate API latency
  setTimeout(() => {
    document.getElementById('trkLoading').style.display = 'none';
    const order = findOrder(id);
    if (order) {
      renderResult(order);
      document.getElementById('trkResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      document.getElementById('trkNotFound').style.display  = '';
      document.getElementById('trkNotFoundId').textContent  = id.trim().toUpperCase();
      document.getElementById('trkNotFound').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 900);
}

/* =============================================
   INIT
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const input     = document.getElementById('trkInput');
  const searchBtn = document.getElementById('trkSearchBtn');

  // Search button
  searchBtn?.addEventListener('click', () => doSearch(input?.value || ''));

  // Enter key
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(input.value);
  });

  // Demo buttons
  document.querySelectorAll('.trk-demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) input.value = btn.dataset.id;
      doSearch(btn.dataset.id);
    });
  });

  // Auto-search from URL param ?id=XXX
  const urlId = new URLSearchParams(window.location.search).get('id');
  if (urlId) {
    if (input) input.value = urlId;
    doSearch(urlId);
  }
});

/* =============================================
   TOAST
============================================= */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
