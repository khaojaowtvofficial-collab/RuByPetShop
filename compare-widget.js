/* ===================================================
   Ruby Pet Shop — Product Comparison Widget
   Self-contained: injects CSS + DOM automatically
   Works on: index.html, shop.html, product.html
=================================================== */
(function initCompareWidget() {
  'use strict';

  /* ── Product database (shared across pages) ───── */
  const PRODUCTS_DB = {
    'P001': {
      id:'P001', name:'Royal Canin Adult 15kg อาหารสุนัขพันธุ์ใหญ่',
      brand:'Royal Canin', category:'dog-food', price:1290, originalPrice:1590,
      rating:4.9, reviewCount:248, sold:1240, stock:45, badge:'hot',
      img:'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&q=80',
      highlights:['โปรตีน 26%','ดูแลข้อต่อ','บำรุงขน','น้ำหนัก 15kg'],
      nutrition:{ protein:'26%', fat:'16%', fiber:'1.4%', moisture:'10%' },
    },
    'P002': {
      id:'P002', name:'Whiskas อาหารแมวรสปลาแซลมอน 1.2kg',
      brand:'Whiskas', category:'cat-food', price:299, originalPrice:0,
      rating:4.8, reviewCount:187, sold:890, stock:88, badge:'new',
      img:'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=300&q=80',
      highlights:['โปรตีน 30%','ดูแลไต','ย่อยง่าย','สำหรับแมวโต'],
      nutrition:{ protein:'30%', fat:'12%', fiber:'2%', moisture:'10%' },
    },
    'P003': {
      id:'P003', name:'Kong Classic ของเล่นยางกรอก ขนาด M',
      brand:'Kong', category:'dog-toy', price:490, originalPrice:590,
      rating:4.7, reviewCount:92, sold:460, stock:32, badge:'hot',
      img:'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=300&q=80',
      highlights:['ยางธรรมชาติ','กรอกขนมได้','แช่แข็งได้','ปลอดภัย 100%'],
      nutrition:{ protein:'—', fat:'—', fiber:'—', moisture:'—' },
    },
    'P004': {
      id:'P004', name:'ของเล่นไม้ตกปลาแมวพร้อมขนนก',
      brand:'PetDreamHouse', category:'cat-toy', price:189, originalPrice:0,
      rating:4.9, reviewCount:321, sold:1600, stock:150, badge:'',
      img:'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&q=80',
      highlights:['ขนนกแท้','กระตุ้น Instinct','ด้าม 50 ซม.','สายเหนียว'],
      nutrition:{ protein:'—', fat:'—', fiber:'—', moisture:'—' },
    },
    'P005': {
      id:'P005', name:'Pedigree Dentastix ขนมกัดฟัน 7 ชิ้น',
      brand:'Pedigree', category:'dog-food', price:149, originalPrice:0,
      rating:4.5, reviewCount:156, sold:780, stock:200, badge:'new',
      img:'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=300&q=80',
      highlights:['ลดหินปูน 80%','ต่ำแคลอรี','รับรอง AAFCO','กิน 1 ชิ้น/วัน'],
      nutrition:{ protein:'5.5%', fat:'2%', fiber:'3%', moisture:'26%' },
    },
    'P006': {
      id:'P006', name:'Sheba อาหารแมวเปียก แพ็ค 12 ถุง',
      brand:'Sheba', category:'cat-food', price:259, originalPrice:320,
      rating:4.9, reviewCount:409, sold:2000, stock:63, badge:'hot',
      img:'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&q=80',
      highlights:['ปลาแท้','ความชื้นสูง','ไม่มีสารกันบูด','กิน 3 ครั้ง/วัน'],
      nutrition:{ protein:'11%', fat:'5%', fiber:'—', moisture:'75%' },
    },
    'P007': {
      id:'P007', name:'Chuckit! Ultra Ball ลูกบอลเทนนิส 2 ลูก',
      brand:'Chuckit!', category:'dog-toy', price:350, originalPrice:0,
      rating:4.6, reviewCount:74, sold:370, stock:8, badge:'',
      img:'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&q=80',
      highlights:['ทนทาน 2x','ลอยน้ำได้','เด้งสม่ำเสมอ','มา 2 ลูก'],
      nutrition:{ protein:'—', fat:'—', fiber:'—', moisture:'—' },
    },
    'P008': {
      id:'P008', name:'CatLife บ้านแมวกระดาษลับเล็บพร้อมลูกบอล',
      brand:'CatLife', category:'cat-toy', price:599, originalPrice:750,
      rating:4.9, reviewCount:203, sold:1015, stock:0, badge:'new',
      img:'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=300&q=80',
      highlights:['กระดาษ Eco','2 ชั้น','ลับเล็บได้','ลูกบอลแถม'],
      nutrition:{ protein:'—', fat:'—', fiber:'—', moisture:'—' },
    },
  };

  /* ── State ────────────────────────────────────── */
  const MAX_COMPARE = 3;
  let compareList = []; // array of product IDs

  /* ── Inject CSS ───────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* Compare button on cards */
    .btn-compare {
      position: absolute;
      bottom: 8px; left: 8px;
      padding: 5px 10px;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(6px);
      border: 1.5px solid rgba(0,0,0,.12);
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      cursor: pointer;
      color: #1A1A2E;
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transform: translateY(6px);
      transition: all .22s ease;
      z-index: 2;
      white-space: nowrap;
    }
    .product-card:hover .btn-compare,
    .shop-card:hover .btn-compare { opacity: 1; transform: translateY(0); }
    .btn-compare.in-compare {
      background: #FF7043;
      color: white;
      border-color: #FF7043;
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Floating Compare Bar ────────── */
    .compare-bar {
      position: fixed;
      bottom: -120px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -4px 32px rgba(0,0,0,.15);
      padding: 14px 24px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: bottom .4s cubic-bezier(.4,0,.2,1);
      max-width: 700px;
      width: calc(100% - 32px);
      border-top: 3px solid #FF7043;
    }
    .compare-bar.visible { bottom: 0; }
    .compare-bar__label {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 14px;
      color: #1A1A2E;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .compare-bar__items {
      display: flex;
      gap: 8px;
      flex: 1;
      overflow-x: auto;
    }
    .compare-bar__slot {
      width: 64px; height: 64px;
      border-radius: 12px;
      border: 2px dashed #E5E7EB;
      background: #F9FAFB;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #9E9E9E;
      font-size: 20px;
    }
    .compare-bar__slot.filled { border-style: solid; border-color: #FF7043; }
    .compare-bar__slot img { width: 100%; height: 100%; object-fit: cover; }
    .compare-bar__slot-remove {
      position: absolute;
      top: 2px; right: 2px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #FF7043;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900;
    }
    .compare-bar__actions { display: flex; gap: 8px; flex-shrink: 0; }
    .compare-go-btn {
      padding: 10px 18px;
      background: #FF7043;
      color: white;
      border: none;
      border-radius: 100px;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: background .22s ease;
    }
    .compare-go-btn:disabled { background: #E5E7EB; color: #9E9E9E; cursor: not-allowed; }
    .compare-go-btn:not(:disabled):hover { background: #E64A19; }
    .compare-clear-btn {
      padding: 10px 14px;
      background: transparent;
      color: #9E9E9E;
      border: 1.5px solid #E5E7EB;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all .22s;
    }
    .compare-clear-btn:hover { border-color: #FF7043; color: #FF7043; }

    /* ── Compare Modal ────────────────── */
    .compare-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.6);
      backdrop-filter: blur(6px);
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity .3s;
      overflow-y: auto;
      padding: 24px 12px;
    }
    .compare-overlay.open { opacity: 1; pointer-events: all; }
    .compare-modal {
      background: white;
      border-radius: 24px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      overflow: hidden;
      transform: translateY(24px) scale(.97);
      transition: transform .35s cubic-bezier(.4,0,.2,1);
    }
    .compare-overlay.open .compare-modal { transform: none; }

    .compare-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      background: linear-gradient(90deg, #FF7043, #FF8A65);
      color: white;
    }
    .compare-modal__header h2 {
      font-family: 'Nunito', sans-serif;
      font-size: 18px;
      font-weight: 900;
    }
    .compare-modal-close {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,.2);
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    .compare-modal-close:hover { background: rgba(255,255,255,.35); }

    .compare-table-wrap { overflow-x: auto; }
    .compare-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      font-family: 'Sarabun', sans-serif;
      min-width: 500px;
    }
    .compare-table th {
      padding: 0;
      vertical-align: top;
      background: #F9FAFB;
      border-bottom: 2px solid #E5E7EB;
    }
    .compare-table td {
      padding: 14px 20px;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: middle;
      text-align: center;
    }
    .compare-table td:first-child {
      text-align: left;
      font-weight: 700;
      color: #6B7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .4px;
      background: #F9FAFB;
      width: 130px;
    }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table tr:hover td:not(:first-child) { background: #FFFBF8; }

    /* Product header in compare table */
    .cmp-prod-header {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .cmp-prod-img {
      width: 90px; height: 90px;
      object-fit: cover;
      border-radius: 12px;
      border: 1px solid #E5E7EB;
    }
    .cmp-prod-name {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      line-height: 1.4;
      color: #1A1A2E;
    }
    .cmp-prod-price {
      font-family: 'Nunito', sans-serif;
      font-size: 18px;
      font-weight: 900;
      color: #FF7043;
    }
    .cmp-prod-original {
      font-size: 11px;
      text-decoration: line-through;
      color: #9E9E9E;
    }
    .cmp-atc-btn {
      padding: 8px 14px;
      background: #FF7043;
      color: white;
      border: none;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      cursor: pointer;
      transition: background .2s;
    }
    .cmp-atc-btn:hover { background: #E64A19; }
    .cmp-atc-btn:disabled { background: #E5E7EB; color: #9E9E9E; cursor: not-allowed; }

    /* Rating stars */
    .cmp-stars { color: #F59E0B; letter-spacing: -1px; font-size: 13px; }
    .cmp-rating-num { font-family: 'Nunito',sans-serif; font-weight: 800; }

    /* Badge chip in compare */
    .cmp-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 800;
      font-family: 'Nunito',sans-serif;
    }
    .cmp-badge--hot  { background: #FFF3E0; color: #E65100; }
    .cmp-badge--new  { background: #E8F5E9; color: #2E7D32; }
    .cmp-badge--none { background: #F0F0F0; color: #9E9E9E; }

    /* Highlight check */
    .cmp-highlight { font-size: 13px; color: #1A1A2E; }

    /* Best value indicator */
    .cmp-best { font-size: 11px; background: #FF7043; color: white; padding: 2px 6px; border-radius: 4px; font-family:'Nunito',sans-serif; font-weight:800; display:inline-block; margin-top:3px; }

    @media (max-width: 600px) {
      .compare-bar { padding: 12px 16px; gap: 8px; }
      .compare-bar__label { display: none; }
      .compare-modal__header { padding: 16px 20px; }
      .compare-table td:first-child { width: 90px; font-size: 10px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Inject DOM ───────────────────────────────── */
  const barEl = document.createElement('div');
  barEl.className = 'compare-bar';
  barEl.id = 'compareBar';
  barEl.innerHTML = `
    <span class="compare-bar__label">⚖️ เปรียบเทียบ</span>
    <div class="compare-bar__items" id="compareBarItems"></div>
    <div class="compare-bar__actions">
      <button class="compare-clear-btn" id="compareClearBtn">ล้าง</button>
      <button class="compare-go-btn" id="compareGoBtn" disabled>เปรียบเทียบ (0/${MAX_COMPARE})</button>
    </div>`;
  document.body.appendChild(barEl);

  const overlayEl = document.createElement('div');
  overlayEl.className = 'compare-overlay';
  overlayEl.id = 'compareOverlay';
  overlayEl.innerHTML = `
    <div class="compare-modal" id="compareModal">
      <div class="compare-modal__header">
        <h2>⚖️ เปรียบเทียบสินค้า</h2>
        <button class="compare-modal-close" id="compareModalClose">✕</button>
      </div>
      <div class="compare-table-wrap">
        <table class="compare-table" id="compareTable"></table>
      </div>
    </div>`;
  document.body.appendChild(overlayEl);

  /* ── Render bar ──────────────────────────────── */
  function renderBar() {
    const bar = document.getElementById('compareBar');
    const itemsEl = document.getElementById('compareBarItems');
    const goBtn   = document.getElementById('compareGoBtn');

    // Slots
    const slots = [];
    for (let i = 0; i < MAX_COMPARE; i++) {
      const id = compareList[i];
      const p  = id ? PRODUCTS_DB[id] : null;
      if (p) {
        slots.push(`<div class="compare-bar__slot filled">
          <img src="${p.img}" alt="${p.name}"/>
          <button class="compare-bar__slot-remove" data-id="${p.id}">✕</button>
        </div>`);
      } else {
        slots.push(`<div class="compare-bar__slot">+</div>`);
      }
    }
    itemsEl.innerHTML = slots.join('');

    goBtn.textContent = `เปรียบเทียบ (${compareList.length}/${MAX_COMPARE})`;
    goBtn.disabled    = compareList.length < 2;

    bar.classList.toggle('visible', compareList.length > 0);

    // Update all compare buttons
    document.querySelectorAll('.btn-compare').forEach(btn => {
      const id = btn.dataset.id;
      btn.classList.toggle('in-compare', compareList.includes(id));
      btn.textContent = compareList.includes(id) ? '✓ เปรียบเทียบ' : '⚖️ เปรียบเทียบ';
    });
  }

  /* ── Toggle compare ─────────────────────────── */
  function toggleCompare(id) {
    const idx = compareList.indexOf(id);
    if (idx >= 0) {
      compareList.splice(idx, 1);
    } else {
      if (compareList.length >= MAX_COMPARE) {
        showToast(`⚖️ เปรียบเทียบได้สูงสุด ${MAX_COMPARE} สินค้าค่ะ`);
        return;
      }
      compareList.push(id);
    }
    renderBar();
  }

  /* ── Render comparison table ─────────────────── */
  function openCompare() {
    if (compareList.length < 2) return;
    const products = compareList.map(id => PRODUCTS_DB[id]).filter(Boolean);

    const minPrice = Math.min(...products.map(p => p.price));
    const maxRating = Math.max(...products.map(p => p.rating));
    const maxSold   = Math.max(...products.map(p => p.sold));

    // Header row
    const headerCols = products.map(p => `
      <th>
        <div class="cmp-prod-header">
          <img src="${p.img}" alt="${p.name}" class="cmp-prod-img"/>
          <div class="cmp-prod-name">${p.name}</div>
          <div>
            <div class="cmp-prod-price">฿${p.price.toLocaleString()}</div>
            ${p.originalPrice > 0 ? `<div class="cmp-prod-original">฿${p.originalPrice.toLocaleString()}</div>` : ''}
          </div>
          ${p.price === minPrice && products.length > 1 ? '<span class="cmp-best">💰 ราคาดีสุด</span>' : ''}
          <button class="cmp-atc-btn" data-atc="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>${p.stock === 0 ? 'หมดสต็อก' : '🛒 ใส่ตะกร้า'}</button>
        </div>
      </th>`).join('');

    // Rows
    const rows = [
      {
        label: 'แบรนด์',
        cells: products.map(p => `<td>${p.brand}</td>`).join(''),
      },
      {
        label: 'หมวดหมู่',
        cells: products.map(p => {
          const catMap = { 'dog-food':'🐶 อาหารหมา','cat-food':'🐱 อาหารแมว','dog-toy':'🐶 ของเล่นหมา','cat-toy':'🐱 ของเล่นแมว' };
          return `<td>${catMap[p.category] || p.category}</td>`;
        }).join(''),
      },
      {
        label: 'ราคา',
        cells: products.map(p => `<td>
          <strong style="color:#FF7043;font-family:'Nunito',sans-serif;font-size:16px">฿${p.price.toLocaleString()}</strong>
          ${p.price === minPrice && products.length > 1 ? '<br><span class="cmp-best">ราคาดีสุด</span>' : ''}
        </td>`).join(''),
      },
      {
        label: 'คะแนนรีวิว',
        cells: products.map(p => `<td>
          <span class="cmp-stars">${'★'.repeat(Math.round(p.rating))}</span><br/>
          <span class="cmp-rating-num">${p.rating}</span>
          <span style="font-size:12px;color:#9E9E9E"> (${p.reviewCount.toLocaleString()})</span>
          ${p.rating === maxRating && products.length > 1 ? '<br><span class="cmp-best">⭐ รีวิวดีสุด</span>' : ''}
        </td>`).join(''),
      },
      {
        label: 'ยอดขาย',
        cells: products.map(p => `<td>
          <strong style="font-family:'Nunito',sans-serif">${p.sold.toLocaleString()} ชิ้น</strong>
          ${p.sold === maxSold && products.length > 1 ? '<br><span class="cmp-best">🔥 ขายดีสุด</span>' : ''}
        </td>`).join(''),
      },
      {
        label: 'สต็อก',
        cells: products.map(p => `<td>${
          p.stock === 0 ? '<span style="color:#EF4444;font-weight:700">หมด</span>'
          : p.stock < 10 ? `<span style="color:#F59E0B;font-weight:700">เหลือ ${p.stock}</span>`
          : `<span style="color:#4CAF82;font-weight:700">พร้อมส่ง</span>`
        }</td>`).join(''),
      },
      {
        label: 'Badge',
        cells: products.map(p => `<td>
          ${p.badge === 'hot' ? '<span class="cmp-badge cmp-badge--hot">🔥 ขายดี</span>'
          : p.badge === 'new' ? '<span class="cmp-badge cmp-badge--new">🌟 ใหม่</span>'
          : '<span class="cmp-badge cmp-badge--none">—</span>'}
        </td>`).join(''),
      },
      {
        label: 'จุดเด่น',
        cells: products.map(p => `<td>
          ${(p.highlights || []).map(h => `<div class="cmp-highlight">✓ ${h}</div>`).join('')}
        </td>`).join(''),
      },
      {
        label: 'โปรตีน',
        cells: products.map(p => `<td style="font-family:'Nunito',sans-serif;font-weight:700">${p.nutrition?.protein || '—'}</td>`).join(''),
      },
      {
        label: 'ไขมัน',
        cells: products.map(p => `<td style="font-family:'Nunito',sans-serif;font-weight:700">${p.nutrition?.fat || '—'}</td>`).join(''),
      },
      {
        label: 'ความชื้น',
        cells: products.map(p => `<td style="font-family:'Nunito',sans-serif;font-weight:700">${p.nutrition?.moisture || '—'}</td>`).join(''),
      },
    ];

    document.getElementById('compareTable').innerHTML = `
      <thead>
        <tr>
          <th style="background:#F9FAFB;width:130px"></th>
          ${headerCols}
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.label}</td>${r.cells}</tr>`).join('')}
      </tbody>`;

    // ATC buttons in modal
    document.querySelectorAll('.cmp-atc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCartCompare(btn.dataset.atc);
      });
    });

    document.getElementById('compareOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCompare() {
    document.getElementById('compareOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Add to cart (mini) ──────────────────────── */
  function addToCartCompare(productId) {
    const p = PRODUCTS_DB[productId];
    if (!p || p.stock === 0) return;
    try {
      const cart = JSON.parse(localStorage.getItem('ruby_cart') || '[]');
      const existing = cart.find(i => i.id === productId);
      if (existing) existing.qty = Math.min(existing.qty + 1, p.stock);
      else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, img: p.img });
      localStorage.setItem('ruby_cart', JSON.stringify(cart));
      const countEl = document.getElementById('cartCount');
      if (countEl) {
        const total = cart.reduce((s, i) => s + i.qty, 0);
        countEl.textContent = total;
      }
    } catch { }
    showToast(`🛒 เพิ่ม "${p.name}" ลงตะกร้าแล้ว!`);
  }

  /* ── Toast ──────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ── Inject compare buttons on product cards ── */
  function injectCompareButtons() {
    // index.html & shop.html: .product-card__img-wrap / .shop-card__img-wrap
    const imgWraps = document.querySelectorAll(
      '.product-card__img-wrap, .shop-card__img-wrap'
    );
    imgWraps.forEach(wrap => {
      // Find parent card to get product ID
      const card = wrap.closest('[data-qv-id], [data-id]');
      if (!card) return;
      const productId = card.dataset.qvId || card.dataset.id;
      if (!productId || !PRODUCTS_DB[productId]) return;
      if (wrap.querySelector('.btn-compare')) return; // already added

      const btn = document.createElement('button');
      btn.className = 'btn-compare';
      btn.dataset.id = productId;
      btn.textContent = '⚖️ เปรียบเทียบ';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleCompare(productId);
      });
      wrap.appendChild(btn);
    });

    // product.html — single product page
    const productLayout = document.getElementById('productLayout');
    if (productLayout && !document.getElementById('pdpCompareBtn')) {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('id');
      if (pid && PRODUCTS_DB[pid]) {
        const btn = document.createElement('button');
        btn.id = 'pdpCompareBtn';
        btn.className = 'btn btn-outline';
        btn.style.cssText = 'width:100%;margin-top:8px;font-size:14px';
        btn.textContent = '⚖️ เพิ่มในรายการเปรียบเทียบ';
        btn.addEventListener('click', () => {
          toggleCompare(pid);
          btn.textContent = compareList.includes(pid) ? '✓ อยู่ในรายการเปรียบเทียบแล้ว' : '⚖️ เพิ่มในรายการเปรียบเทียบ';
        });
        const wishlistBtn = productLayout.querySelector('.gallery__wishlist');
        if (wishlistBtn) wishlistBtn.closest('.gallery__main-wrap')?.after(btn);
      }
    }
  }

  /* ── Event Listeners ─────────────────────────── */
  // Bar: remove slot
  document.getElementById('compareBarItems').addEventListener('click', e => {
    const rm = e.target.closest('.compare-bar__slot-remove');
    if (rm) toggleCompare(rm.dataset.id);
  });

  // Bar: clear
  document.getElementById('compareClearBtn').addEventListener('click', () => {
    compareList = [];
    renderBar();
  });

  // Bar: open modal
  document.getElementById('compareGoBtn').addEventListener('click', openCompare);

  // Modal: close
  document.getElementById('compareModalClose').addEventListener('click', closeCompare);
  document.getElementById('compareOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('compareOverlay')) closeCompare();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCompare();
  });

  /* ── Observe DOM changes (shop grid re-renders) ── */
  const observer = new MutationObserver(() => {
    injectCompareButtons();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  /* ── Initial inject ─────────────────────────── */
  // Wait for page JS to render cards first
  setTimeout(injectCompareButtons, 600);

})();
