/* ===================================================
   Ruby Pet Shop — Admin Dashboard JS
=================================================== */

/* =============================================
   ADMIN AUTH GUARD — Secret URL Key
   Access: admin.html?key=RubyAdmin2026
============================================= */
(function adminAuthGuard() {
  const ADMIN_KEY = 'RubyAdmin2026';
  const params    = new URLSearchParams(window.location.search);
  const key       = params.get('key');

  if (key === ADMIN_KEY) {
    // Save key in sessionStorage so page refreshes still work
    sessionStorage.setItem('ruby_admin_key', ADMIN_KEY);
    return; // ✅ Access granted
  }

  // Also allow if key already saved in sessionStorage (page refresh)
  if (sessionStorage.getItem('ruby_admin_key') === ADMIN_KEY) {
    return; // ✅ Already authenticated this session
  }

  // ❌ Access denied
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:100vh;font-family:'Sarabun',sans-serif;background:#FFF8F0;gap:16px;text-align:center;padding:24px">
      <div style="font-size:64px">🔒</div>
      <h2 style="color:#FF7043;margin:0">หน้านี้สำหรับ Admin เท่านั้น</h2>
      <p style="color:#666;margin:0">ต้องใช้ลิงก์พิเศษเพื่อเข้าถึง Dashboard</p>
      <a href="index.html" style="background:#FF7043;color:#fff;padding:12px 28px;
         border-radius:12px;text-decoration:none;font-weight:700;margin-top:8px">← กลับหน้าร้าน</a>
    </div>`;
})();

/* =============================================
   MOCK DATA
============================================= */
const ORDERS = [
  { id:'ORD-001', customer:'คุณมาลี สุขใจ',    email:'malee@email.com',     products:'Royal Canin 15kg, Dentastix',         total:1589, date:'20 พ.ค. 2026', status:'delivered',  tracking:'FLASH123456' },
  { id:'ORD-002', customer:'คุณต้น วิชัย',     email:'ton@email.com',       products:'Whiskas แซลมอน 1.2kg',                total:299,  date:'20 พ.ค. 2026', status:'shipped',    tracking:'KERRY789012' },
  { id:'ORD-003', customer:'คุณนิด รักษา',     email:'nid@email.com',       products:'Kong Classic M, ของเล่นแมว',          total:790,  date:'20 พ.ค. 2026', status:'preparing',  tracking:'-' },
  { id:'ORD-004', customer:'คุณก้อย ใจดี',     email:'koi@email.com',       products:'Sheba แพ็ค 12',                       total:259,  date:'19 พ.ค. 2026', status:'paid',       tracking:'-' },
  { id:'ORD-005', customer:'คุณบิ๊ก มณี',      email:'big@email.com',       products:'Pedigree Dentastix 7ชิ้น',            total:149,  date:'19 พ.ค. 2026', status:'pending',    tracking:'-' },
  { id:'ORD-006', customer:'คุณเจน ลักษณา',    email:'jane@email.com',      products:'CatLife บ้านแมวลับเล็บ',              total:599,  date:'18 พ.ค. 2026', status:'delivered',  tracking:'JT345678' },
  { id:'ORD-007', customer:'คุณมิ้น พิมพ์ใจ',  email:'min@email.com',       products:'Chuckit Ultra Ball 2ลูก',             total:350,  date:'18 พ.ค. 2026', status:'delivered',  tracking:'FLASH999111' },
  { id:'ORD-008', customer:'คุณอั้ม ศักดิ์ดา', email:'am@email.com',        products:'Royal Canin 15kg',                    total:1290, date:'17 พ.ค. 2026', status:'cancelled',  tracking:'-' },
  { id:'ORD-009', customer:'คุณโบ๊ท นิรันดร์', email:'boat@email.com',      products:'Whiskas ปลาแซลมอน, Sheba แพ็ค 12',   total:558,  date:'17 พ.ค. 2026', status:'preparing',  tracking:'-' },
  { id:'ORD-010', customer:'คุณฝ้าย ประทุม',   email:'fai@email.com',       products:'Kong Classic M',                      total:490,  date:'16 พ.ค. 2026', status:'shipped',    tracking:'FLASH554433' },
  { id:'ORD-011', customer:'คุณแตง วิไล',      email:'tang@email.com',      products:'ไม้ตกปลาแมวขนนก',                    total:189,  date:'15 พ.ค. 2026', status:'delivered',  tracking:'KERRY221100' },
  { id:'ORD-012', customer:'คุณซัน สกุลดี',    email:'sun@email.com',       products:'Pedigree Dentastix + Chuckit Ball',   total:499,  date:'15 พ.ค. 2026', status:'paid',       tracking:'-' },
];

const PRODUCTS = [
  { id:'P001', name:'Royal Canin Adult 15kg',         brand:'Royal Canin', category:'dog-food', price:1290, sale:1590, stock:45,  sold:248, badge:'hot',  status:'active', img:'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=60&q=80' },
  { id:'P002', name:'Whiskas ปลาแซลมอน 1.2kg',        brand:'Whiskas',     category:'cat-food', price:299,  sale:0,    stock:88,  sold:187, badge:'new',  status:'active', img:'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=60&q=80' },
  { id:'P003', name:'Kong Classic M',                  brand:'Kong',        category:'dog-toy',  price:490,  sale:590,  stock:32,  sold:92,  badge:'hot',  status:'active', img:'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=60&q=80' },
  { id:'P004', name:'ไม้ตกปลาแมวพร้อมขนนก',           brand:'PetDreamHouse',category:'cat-toy', price:189,  sale:0,    stock:150, sold:321, badge:'',     status:'active', img:'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=60&q=80' },
  { id:'P005', name:'Pedigree Dentastix 7 ชิ้น',       brand:'Pedigree',    category:'dog-food', price:149,  sale:0,    stock:200, sold:156, badge:'new',  status:'active', img:'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=60&q=80' },
  { id:'P006', name:'Sheba อาหารเปียก แพ็ค 12',        brand:'Sheba',       category:'cat-food', price:259,  sale:320,  stock:63,  sold:409, badge:'hot',  status:'active', img:'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=60&q=80' },
  { id:'P007', name:'Chuckit! Ultra Ball 2 ลูก',        brand:'Chuckit',     category:'dog-toy',  price:350,  sale:0,    stock:8,   sold:74,  badge:'',     status:'active', img:'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=60&q=80' },
  { id:'P008', name:'CatLife บ้านแมวลับเล็บ',           brand:'CatLife',     category:'cat-toy',  price:599,  sale:750,  stock:0,   sold:203, badge:'new',  status:'inactive',img:'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=60&q=80'},
];

const USERS = [
  { id:'U001', name:'คุณมาลี สุขใจ',   email:'malee@email.com',  role:'user',  joinDate:'12 ม.ค. 2026', orders:3, total:2678, status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Malee&backgroundColor=ffb347' },
  { id:'U002', name:'คุณต้น วิชัย',    email:'ton@email.com',    role:'user',  joinDate:'5 ก.พ. 2026',  orders:1, total:299,  status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Ton&backgroundColor=84d9d2' },
  { id:'U003', name:'คุณนิด รักษา',    email:'nid@email.com',    role:'user',  joinDate:'18 ก.พ. 2026', orders:2, total:1580, status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Nid&backgroundColor=f4a261' },
  { id:'U004', name:'คุณก้อย ใจดี',    email:'koi@email.com',    role:'user',  joinDate:'1 มี.ค. 2026', orders:4, total:3280, status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Koi&backgroundColor=e76f51' },
  { id:'U005', name:'แอดมิน Ruby',     email:'admin@rubypet.com',role:'admin', joinDate:'1 ม.ค. 2026',  orders:0, total:0,    status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=RubyAdmin&backgroundColor=ff7043' },
  { id:'U006', name:'คุณบิ๊ก มณี',     email:'big@email.com',    role:'user',  joinDate:'10 มี.ค. 2026',orders:1, total:149,  status:'inactive', avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Big&backgroundColor=2a9d8f' },
  { id:'U007', name:'คุณเจน ลักษณา',   email:'jane@email.com',   role:'user',  joinDate:'15 เม.ย. 2026',orders:2, total:1048, status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Jane&backgroundColor=e9c46a' },
  { id:'U008', name:'คุณมิ้น พิมพ์ใจ', email:'min@email.com',    role:'user',  joinDate:'2 พ.ค. 2026',  orders:1, total:350,  status:'active',   avatar:'https://api.dicebear.com/7.x/adventurer/svg?seed=Min&backgroundColor=f72585' },
];

const STATUS_LABELS = { pending:'รอชำระเงิน', paid:'ชำระแล้ว', preparing:'กำลังเตรียม', shipped:'จัดส่งแล้ว', delivered:'สำเร็จ', cancelled:'ยกเลิก' };
const WORKFLOW_KEYS  = ['pending','paid','preparing','shipped','delivered'];
const WORKFLOW_ICONS = { pending:'⏳', paid:'💳', preparing:'📦', shipped:'🚚', delivered:'✅' };

/* =============================================
   NAVIGATION
============================================= */
const sidebarLinks = document.querySelectorAll('.sidebar__link[data-page]');
const pages        = document.querySelectorAll('.page');
const breadcrumb   = document.getElementById('breadcrumb');
const sidebar      = document.getElementById('sidebar');
const sidebarToggle= document.getElementById('sidebarToggle');

const PAGE_TITLES = {
  dashboard:  '📊 Dashboard',
  stores:     '🏪 ร้านค้า',
  orders:     '📦 ออเดอร์',
  products:   '🛍️ สินค้า',
  categories: '📂 หมวดหมู่',
  users:      '👥 ลูกค้า',
  analytics:  '📈 Analytics',
  settings:   '⚙️ ตั้งค่า',
};

function goToPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  sidebarLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');
  const link = document.querySelector(`.sidebar__link[data-page="${pageId}"]`);
  if (link) link.classList.add('active');
  breadcrumb.textContent = PAGE_TITLES[pageId] || pageId;

  // Init pages lazily
  if (pageId === 'orders')    initOrdersPage();
  if (pageId === 'products')  initProductsPage();
  if (pageId === 'users')     initUsersPage();
  if (pageId === 'analytics') initAnalyticsPage();
}

sidebarLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goToPage(link.dataset.page);
    if (window.innerWidth <= 900) sidebar.classList.remove('open');
  });
});

// "ดูทั้งหมด" link in dashboard
document.querySelectorAll('.link-sm[data-goto]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); goToPage(el.dataset.goto); });
});

sidebarToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', e => {
  if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target))
    sidebar.classList.remove('open');
});

/* =============================================
   DASHBOARD PAGE
============================================= */
function initDashboard() {
  renderSalesChart();
  renderDonut();
  renderRecentOrders();
  renderTopProducts();
}

/* Bar Chart */
const SALES_DATA = [
  { day:'14 พ.ค.', amount:32000 },
  { day:'15 พ.ค.', amount:41500 },
  { day:'16 พ.ค.', amount:28000 },
  { day:'17 พ.ค.', amount:55000 },
  { day:'18 พ.ค.', amount:38000 },
  { day:'19 พ.ค.', amount:47200 },
  { day:'20 พ.ค.', amount:48250 },
];
function renderSalesChart() {
  const el = document.getElementById('salesChart');
  if (!el) return;
  const max = Math.max(...SALES_DATA.map(d => d.amount));
  const colors = ['#FFB347','#FF7043','#FF9800','#FF7043','#FFB347','#FF7043','#FF5722'];
  el.innerHTML = SALES_DATA.map((d,i) => {
    const pct = (d.amount / max * 100).toFixed(1);
    const k   = (d.amount/1000).toFixed(1);
    return `<div class="bar-wrap">
      <div class="bar-fill" style="height:${pct}%;background:${colors[i]};min-height:8px" data-tip="฿${k}k"></div>
      <div class="bar-label">${d.day.replace('พ.ค.','พ.')}</div>
    </div>`;
  }).join('');
}

/* Monthly chart */
const MONTHLY_DATA = [
  {m:'ม.ค.', v:280000},{m:'ก.พ.', v:320000},{m:'มี.ค.', v:295000},
  {m:'เม.ย.', v:410000},{m:'พ.ค.', v:488000},{m:'มิ.ย.', v:0},
  {m:'ก.ค.', v:0},{m:'ส.ค.', v:0},{m:'ก.ย.', v:0},
  {m:'ต.ค.', v:0},{m:'พ.ย.', v:0},{m:'ธ.ค.', v:0},
];

/* Donut Chart */
const DONUT_DATA = [
  { label:'สำเร็จ',     count:18, color:'#4CAF82' },
  { label:'กำลังส่ง',  count:7,  color:'#9C27B0' },
  { label:'กำลังเตรียม',count:5,  color:'#2196F3' },
  { label:'รอชำระ',    count:4,  color:'#FF9800' },
  { label:'ยกเลิก',    count:4,  color:'#EF4444' },
];
function renderDonut() {
  const svg    = document.getElementById('donutSvg');
  const legend = document.getElementById('donutLegend');
  if (!svg || !legend) return;
  const total = DONUT_DATA.reduce((s,d)=>s+d.count,0);
  const r = 48, cx = 60, cy = 60, circ = 2*Math.PI*r;
  let offset = 0;
  let circles = '';
  DONUT_DATA.forEach(d => {
    const pct = d.count / total;
    const dash = pct * circ;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="18"
      stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`;
    offset += dash;
  });
  svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F0F0F0" stroke-width="18"/>` + circles;
  legend.innerHTML = DONUT_DATA.map(d =>
    `<div class="donut-legend-item">
      <div class="donut-legend-dot" style="background:${d.color}"></div>
      <span class="donut-legend-label">${d.label}</span>
      <span class="donut-legend-val">${d.count}</span>
    </div>`).join('');
}

function renderRecentOrders() {
  const tb = document.getElementById('recentOrdersTable');
  if (!tb) return;
  tb.innerHTML = ORDERS.slice(0,5).map(o =>
    `<tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${o.products}</td>
      <td><strong style="color:var(--orange)">฿${o.total.toLocaleString()}</strong></td>
      <td><span class="status-badge sb-${o.status}">${STATUS_LABELS[o.status]}</span></td>
    </tr>`).join('');
}

function renderTopProducts() {
  const el = document.getElementById('topProducts');
  if (!el) return;
  const sorted = [...PRODUCTS].sort((a,b) => b.sold - a.sold).slice(0,5);
  const maxSold = sorted[0].sold;
  el.innerHTML = sorted.map((p, i) => `
    <div class="top-product-item">
      <div class="top-product-rank ${i===0?'rank-1':''}">${i+1}</div>
      <div class="top-product-info">
        <strong>${p.name}</strong>
        <small>ขายแล้ว ${p.sold} ชิ้น</small>
      </div>
      <div class="top-product-bar-wrap">
        <div class="top-product-bar" style="width:${(p.sold/maxSold*100).toFixed(0)}%"></div>
      </div>
      <div class="top-product-val">฿${(p.price*p.sold/1000).toFixed(0)}k</div>
    </div>`).join('');
}

/* =============================================
   ORDERS PAGE
============================================= */
let ordersData = [...ORDERS];

function initOrdersPage() {
  renderPipeline();
  renderOrdersTable(ordersData);
  setupOrderFilters();
}

function renderPipeline() {
  WORKFLOW_KEYS.concat(['cancelled']).forEach(status => {
    const container = document.getElementById(`pipeline-${status}`);
    const counter   = document.getElementById(`count-${status}`);
    if (!container) return;
    const items = ordersData.filter(o => o.status === status);
    if (counter) counter.textContent = items.length;
    container.innerHTML = items.length
      ? items.map(o => `
          <div class="pipeline-card-item" onclick="openOrderDetail('${o.id}')">
            <strong>${o.id}</strong>
            <div class="p-customer">👤 ${o.customer}</div>
            <div class="p-total">฿${o.total.toLocaleString()}</div>
          </div>`).join('')
      : `<div style="padding:16px;text-align:center;color:#9E9E9E;font-size:12px">ไม่มีออเดอร์</div>`;
  });
}

function renderOrdersTable(data) {
  const tb = document.getElementById('ordersTableBody');
  if (!tb) return;
  tb.innerHTML = data.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}<br><small style="color:#9E9E9E">${o.email}</small></td>
      <td style="max-width:180px;font-size:12px">${o.products}</td>
      <td><strong style="color:var(--orange);font-family:'Nunito',sans-serif">฿${o.total.toLocaleString()}</strong></td>
      <td style="color:#6B7280">${o.date}</td>
      <td><span class="status-badge sb-${o.status}">${STATUS_LABELS[o.status]}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn--view" onclick="openOrderDetail('${o.id}')" title="ดูรายละเอียด">👁</button>
          <button class="action-btn action-btn--edit" onclick="openOrderDetail('${o.id}')" title="อัปเดตสถานะ">✏️</button>
        </div>
      </td>
    </tr>`).join('');
}

function setupOrderFilters() {
  const filter = document.getElementById('orderStatusFilter');
  filter?.addEventListener('change', () => {
    const val = filter.value;
    renderOrdersTable(val === 'all' ? ordersData : ordersData.filter(o => o.status === val));
  });
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    showAdminToast('📥 กำลัง Export CSV...');
    setTimeout(() => showAdminToast('✅ Export สำเร็จ!'), 1000);
  });
}

/* Order Detail Modal */
function openOrderDetail(id) {
  const order = ordersData.find(o => o.id === id);
  if (!order) return;
  const overlay = document.getElementById('orderDetailOverlay');
  const body    = document.getElementById('orderDetailBody');
  const title   = document.getElementById('orderDetailTitle');
  title.textContent = `ออเดอร์ ${order.id}`;

  const activeIdx = WORKFLOW_KEYS.indexOf(order.status);
  const steps = WORKFLOW_KEYS.map((key, i) => {
    const cls = i < activeIdx ? 'done' : i === activeIdx ? 'active' : '';
    return `<div class="odf-step ${cls}">
      <div class="odf-dot">${i < activeIdx ? '✓' : WORKFLOW_ICONS[key]}</div>
      <div class="odf-label">${STATUS_LABELS[key]}</div>
    </div>`;
  }).join('');

  body.innerHTML = `
    <div class="order-detail-section">
      <h4>สถานะปัจจุบัน</h4>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span class="status-badge sb-${order.status}" style="font-size:13px;padding:6px 14px">${STATUS_LABELS[order.status]}</span>
        <select class="order-status-select" id="statusSelect-${order.id}">
          ${Object.entries(STATUS_LABELS).map(([k,v])=>`<option value="${k}" ${order.status===k?'selected':''}>${v}</option>`).join('')}
        </select>
        <button class="btn-admin-primary" onclick="updateOrderStatus('${order.id}')">💾 บันทึก</button>
      </div>
    </div>
    <div class="order-detail-section">
      <h4>Order Workflow</h4>
      <div class="order-detail-workflow">${steps}</div>
    </div>
    <div class="order-detail-section">
      <h4>ข้อมูลออเดอร์</h4>
      <div class="order-detail-info">
        <div class="od-info-item"><label>ออเดอร์ #</label><span>${order.id}</span></div>
        <div class="od-info-item"><label>วันที่สั่งซื้อ</label><span>${order.date}</span></div>
        <div class="od-info-item"><label>ลูกค้า</label><span>${order.customer}</span></div>
        <div class="od-info-item"><label>อีเมล</label><span>${order.email}</span></div>
        <div class="od-info-item"><label>สินค้า</label><span>${order.products}</span></div>
        <div class="od-info-item"><label>Tracking</label><span>${order.tracking}</span></div>
        <div class="od-info-item"><label>ยอดรวม</label><span style="color:var(--orange);font-weight:900;font-size:18px">฿${order.total.toLocaleString()}</span></div>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateOrderStatus(id) {
  const order  = ordersData.find(o => o.id === id);
  const select = document.getElementById(`statusSelect-${id}`);
  if (!order || !select) return;
  order.status = select.value;
  showAdminToast(`✅ อัปเดตสถานะ ${id} → ${STATUS_LABELS[order.status]}`);
  closeOrderDetail();
  renderPipeline();
  renderOrdersTable(ordersData);
  renderRecentOrders();
}

function closeOrderDetail() {
  document.getElementById('orderDetailOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('orderDetailClose')?.addEventListener('click', closeOrderDetail);
document.getElementById('orderDetailOverlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('orderDetailOverlay')) closeOrderDetail();
});
window.openOrderDetail = openOrderDetail;
window.updateOrderStatus = updateOrderStatus;

/* =============================================
   PRODUCTS PAGE
============================================= */
let productsData = [...PRODUCTS];

function initProductsPage() {
  renderProductStats();
  renderProductsTable(productsData);
  setupProductFilters();
  setupProductForm();
}

function renderProductStats() {
  const el = document.getElementById('productStats');
  if (!el) return;
  const active   = productsData.filter(p => p.status === 'active').length;
  const outstock = productsData.filter(p => p.stock === 0).length;
  el.innerHTML = `${productsData.length} สินค้า | ${active} ใช้งาน | ${outstock} หมด stock`;
}

const CAT_LABELS = { 'dog-food':'🐶 อาหารหมา', 'dog-toy':'🐶 ของเล่นหมา', 'cat-food':'🐱 อาหารแมว', 'cat-toy':'🐱 ของเล่นแมว' };

function renderProductsTable(data) {
  const tb = document.getElementById('productsTableBody');
  if (!tb) return;
  tb.innerHTML = data.map(p => {
    const stockStatus = p.stock === 0 ? 'outstock' : p.stock < 15 ? 'low' : 'instock';
    const stockLabel  = p.stock === 0 ? 'หมด' : p.stock < 15 ? `⚠️ ${p.stock}` : p.stock;
    return `<tr>
      <td>
        <div class="product-row">
          <img src="${p.img}" alt="${p.name}" class="product-row-img"/>
          <div>
            <strong style="font-size:13px">${p.name}</strong>
            <div style="font-size:11px;color:#9E9E9E">${p.brand}</div>
          </div>
        </div>
      </td>
      <td>${CAT_LABELS[p.category] || p.category}</td>
      <td>
        <strong style="color:var(--orange)">฿${p.price.toLocaleString()}</strong>
        ${p.sale ? `<br><small style="color:#9E9E9E;text-decoration:line-through">฿${p.sale.toLocaleString()}</small>` : ''}
      </td>
      <td><span class="status-badge sb-${stockStatus}">${stockLabel}</span></td>
      <td style="font-family:'Nunito',sans-serif;font-weight:700">${p.sold}</td>
      <td><span class="status-badge sb-${p.status === 'active' ? 'active' : 'inactive'}">${p.status === 'active' ? 'ใช้งาน' : 'ปิด'}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn--edit" onclick="openEditProduct('${p.id}')" title="แก้ไข">✏️</button>
          <button class="action-btn action-btn--del"  onclick="deleteProduct('${p.id}')" title="ลบ">🗑️</button>
        </div>
      </td>
    </tr>`;}).join('');
}

function setupProductFilters() {
  document.getElementById('productSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderProductsTable(productsData.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)));
  });
  document.getElementById('productCatFilter')?.addEventListener('change', e => {
    const val = e.target.value;
    renderProductsTable(val === 'all' ? productsData : productsData.filter(p => p.category.includes(val)));
  });
}

let editingProductId = null;
function openProductForm(id = null) {
  editingProductId = id;
  const overlay = document.getElementById('productFormOverlay');
  const title   = document.getElementById('productFormTitle');
  title.textContent = id ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่';
  if (id) {
    const p = productsData.find(x => x.id === id);
    if (p) {
      document.getElementById('pName').value      = p.name;
      document.getElementById('pBrand').value     = p.brand;
      document.getElementById('pCategory').value  = p.category;
      document.getElementById('pPrice').value     = p.price;
      document.getElementById('pSalePrice').value = p.sale;
      document.getElementById('pStock').value     = p.stock;
      document.getElementById('pImage').value     = p.img;
      document.getElementById('pBadge').value     = p.badge;
    }
  } else {
    document.getElementById('productForm').reset();
  }
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeProductForm() {
  document.getElementById('productFormOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setupProductForm() {
  document.getElementById('addProductBtn')?.addEventListener('click', () => openProductForm());
  document.getElementById('productFormClose')?.addEventListener('click', closeProductForm);
  document.getElementById('productFormCancel')?.addEventListener('click', closeProductForm);
  document.getElementById('productFormOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('productFormOverlay')) closeProductForm();
  });
  document.getElementById('productForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('pName').value.trim();
    const price = parseInt(document.getElementById('pPrice').value);
    if (!name || !price) { showAdminToast('⚠️ กรุณากรอกชื่อสินค้าและราคา'); return; }
    if (editingProductId) {
      const p = productsData.find(x => x.id === editingProductId);
      if (p) {
        p.name     = name;
        p.brand    = document.getElementById('pBrand').value;
        p.category = document.getElementById('pCategory').value;
        p.price    = price;
        p.sale     = parseInt(document.getElementById('pSalePrice').value) || 0;
        p.stock    = parseInt(document.getElementById('pStock').value) || 0;
        p.img      = document.getElementById('pImage').value || p.img;
        p.badge    = document.getElementById('pBadge').value;
      }
      showAdminToast(`✅ แก้ไขสินค้า "${name}" สำเร็จ`);
    } else {
      const newProduct = {
        id: `P${String(productsData.length+1).padStart(3,'0')}`,
        name, brand: document.getElementById('pBrand').value,
        category: document.getElementById('pCategory').value,
        price, sale: parseInt(document.getElementById('pSalePrice').value)||0,
        stock: parseInt(document.getElementById('pStock').value)||0,
        img:   document.getElementById('pImage').value || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=60&q=80',
        badge: document.getElementById('pBadge').value,
        sold: 0, status:'active'
      };
      productsData.push(newProduct);
      showAdminToast(`✅ เพิ่มสินค้า "${name}" สำเร็จ`);
    }
    closeProductForm();
    renderProductsTable(productsData);
    renderProductStats();
    renderTopProducts();
  });
}

function openEditProduct(id) { openProductForm(id); }
function deleteProduct(id) {
  const p = productsData.find(x => x.id === id);
  if (!p) return;
  if (confirm(`ต้องการลบ "${p.name}" ใช่ไหม?`)) {
    productsData = productsData.filter(x => x.id !== id);
    renderProductsTable(productsData);
    renderProductStats();
    showAdminToast(`🗑️ ลบ "${p.name}" แล้ว`);
  }
}
window.openEditProduct = openEditProduct;
window.deleteProduct   = deleteProduct;

/* =============================================
   USERS PAGE
============================================= */
let usersData = [...USERS];

function initUsersPage() {
  renderUserStats();
  renderUsersTable(usersData);
  setupUserFilters();
}

function renderUserStats() {
  const el = document.getElementById('userStatsGrid');
  if (!el) return;
  const total   = usersData.length;
  const admins  = usersData.filter(u => u.role === 'admin').length;
  const active  = usersData.filter(u => u.status === 'active').length;
  const newThisMonth = 5;
  el.innerHTML = `
    <div class="user-stat-card"><div class="user-stat-card__icon">👥</div><div><div class="user-stat-card__val">${total}</div><div class="user-stat-card__lbl">สมาชิกทั้งหมด</div></div></div>
    <div class="user-stat-card"><div class="user-stat-card__icon">✅</div><div><div class="user-stat-card__val">${active}</div><div class="user-stat-card__lbl">Active</div></div></div>
    <div class="user-stat-card"><div class="user-stat-card__icon">⚙️</div><div><div class="user-stat-card__val">${admins}</div><div class="user-stat-card__lbl">Admin</div></div></div>
    <div class="user-stat-card"><div class="user-stat-card__icon">🆕</div><div><div class="user-stat-card__val">${newThisMonth}</div><div class="user-stat-card__lbl">ใหม่เดือนนี้</div></div></div>`;
}

function renderUsersTable(data) {
  const tb = document.getElementById('usersTableBody');
  if (!tb) return;
  tb.innerHTML = data.map(u => `
    <tr>
      <td>
        <div class="user-row">
          <img src="${u.avatar}" alt="${u.name}" class="user-row-avatar"/>
          <div>
            <div class="user-row-name">${u.name}</div>
            <div style="font-size:11px;color:#9E9E9E">${u.id}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12px;color:#6B7280">${u.email}</td>
      <td><span class="status-badge sb-${u.role}">${u.role === 'admin' ? '⚙️ Admin' : '👤 User'}</span></td>
      <td style="font-size:12px;color:#6B7280">${u.joinDate}</td>
      <td style="font-family:'Nunito',sans-serif;font-weight:700">${u.orders}</td>
      <td style="color:var(--orange);font-family:'Nunito',sans-serif;font-weight:700">฿${u.total.toLocaleString()}</td>
      <td><span class="status-badge sb-${u.status === 'active' ? 'active' : 'inactive'}">${u.status === 'active' ? 'ใช้งาน' : 'ระงับ'}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn--edit" onclick="toggleUserStatus('${u.id}')" title="เปลี่ยนสถานะ">⚡</button>
          <button class="action-btn action-btn--view" onclick="toggleUserRole('${u.id}')" title="เปลี่ยน Role">🔄</button>
        </div>
      </td>
    </tr>`).join('');
}

function setupUserFilters() {
  document.getElementById('userSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderUsersTable(usersData.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  });
  document.getElementById('userRoleFilter')?.addEventListener('change', e => {
    const val = e.target.value;
    renderUsersTable(val === 'all' ? usersData : usersData.filter(u => u.role === val));
  });
}

function toggleUserStatus(id) {
  const u = usersData.find(x => x.id === id);
  if (!u) return;
  u.status = u.status === 'active' ? 'inactive' : 'active';
  renderUsersTable(usersData);
  showAdminToast(`⚡ ${u.name} → ${u.status === 'active' ? 'เปิด' : 'ระงับ'}ใช้งาน`);
}
function toggleUserRole(id) {
  const u = usersData.find(x => x.id === id);
  if (!u) return;
  u.role = u.role === 'admin' ? 'user' : 'admin';
  renderUsersTable(usersData);
  showAdminToast(`🔄 ${u.name} → ${u.role === 'admin' ? 'Admin' : 'User'}`);
}
window.toggleUserStatus = toggleUserStatus;
window.toggleUserRole   = toggleUserRole;

/* =============================================
   ANALYTICS PAGE
============================================= */
function initAnalyticsPage() {
  renderAnalyticsKpi();
  renderMonthlyChart();
  renderChannels();
  renderTopSales();
}

function renderAnalyticsKpi() {
  const el = document.getElementById('analyticsKpi');
  if (!el) return;
  el.innerHTML = `
    <div class="analytics-kpi-card"><div class="icon">💰</div><div class="val">฿1,813,000</div><div class="lbl">ยอดขายรวม 2026</div></div>
    <div class="analytics-kpi-card"><div class="icon">📦</div><div class="val">847</div><div class="lbl">ออเดอร์ทั้งหมด</div></div>
    <div class="analytics-kpi-card"><div class="icon">🛍️</div><div class="val">฿2,141</div><div class="lbl">ยอดเฉลี่ยต่อออเดอร์</div></div>
    <div class="analytics-kpi-card"><div class="icon">👥</div><div class="val">12,480</div><div class="lbl">ลูกค้าทั้งหมด</div></div>`;
}

function renderMonthlyChart() {
  const el = document.getElementById('monthlyChart');
  if (!el) return;
  const data = MONTHLY_DATA.filter(d => d.v > 0);
  const max  = Math.max(...data.map(d => d.v));
  const clrs = ['#FFB347','#FF7043','#FF9800','#FF7043','#FF5722','#E64A19'];
  el.innerHTML = MONTHLY_DATA.map((d,i) => {
    if (!d.v) return `<div class="bar-wrap"><div class="bar-fill" style="height:4px;background:#E5E7EB;min-height:4px"></div><div class="bar-label">${d.m}</div></div>`;
    const pct = (d.v / max * 100).toFixed(1);
    const k   = (d.v/1000).toFixed(0);
    return `<div class="bar-wrap">
      <div class="bar-fill" style="height:${pct}%;background:${clrs[i%6]};min-height:8px" data-tip="฿${k}k"></div>
      <div class="bar-label">${d.m}</div>
    </div>`;
  }).join('');
}

function renderChannels() {
  const el = document.getElementById('channelList');
  if (!el) return;
  const channels = [
    { name:'🌐 Website',  pct:55, color:'var(--orange)' },
    { name:'📱 Line OA',  pct:25, color:'#06C755' },
    { name:'📘 Facebook', pct:12, color:'#1877F2' },
    { name:'📸 Instagram',pct:8,  color:'#E1306C' },
  ];
  el.innerHTML = channels.map(c => `
    <div class="channel-item">
      <div class="channel-item__top"><span>${c.name}</span><strong>${c.pct}%</strong></div>
      <div class="channel-item__bar-bg">
        <div class="channel-item__bar" style="width:${c.pct}%;background:${c.color}"></div>
      </div>
    </div>`).join('');
}

function renderTopSales() {
  const el = document.getElementById('topSalesTable');
  if (!el) return;
  const sorted = [...PRODUCTS].sort((a,b) => b.sold - a.sold);
  el.innerHTML = sorted.map((p,i) => {
    const revenue = (p.price * p.sold).toLocaleString();
    const growth  = ['+24%','+18%','+31%','+9%','+15%','+22%','+7%','-3%'][i] || '+5%';
    const gColor  = growth.startsWith('-') ? 'var(--red)' : 'var(--green)';
    return `<tr>
      <td style="font-size:18px;font-weight:900;font-family:'Nunito',sans-serif;color:${i<3?'var(--orange)':'#9E9E9E'}">${i+1}</td>
      <td><strong>${p.name}</strong><br><small style="color:#9E9E9E">${p.brand}</small></td>
      <td>${CAT_LABELS[p.category]}</td>
      <td style="font-family:'Nunito',sans-serif;font-weight:700">${p.sold} ชิ้น</td>
      <td style="color:var(--orange);font-family:'Nunito',sans-serif;font-weight:700">฿${revenue}</td>
      <td style="color:${gColor};font-weight:700">${growth}</td>
    </tr>`;}).join('');
}

/* =============================================
   TOAST
============================================= */
const adminToast = document.getElementById('adminToast');
let toastTimer;
function showAdminToast(msg) {
  adminToast.textContent = msg;
  adminToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => adminToast.classList.remove('show'), 3000);
}

/* =============================================
   INIT
============================================= */
initDashboard();
