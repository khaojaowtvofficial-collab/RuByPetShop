/* =============================================
   chat-widget.js — Ruby Pet Shop Live Chat
   Self-contained: injects own CSS + DOM
   ============================================= */
(function () {
  'use strict';

  /* ── FAQ bot responses ─────────────────────── */
  const FAQ = [
    {
      label: '📦 เช็คออเดอร์',
      reply: 'สามารถเช็คสถานะออเดอร์ได้ที่หน้า <a href="tracking.html" style="color:var(--cw-orange);font-weight:700">ติดตามพัสดุ</a> หรือเข้าสู่ระบบและไปที่โปรไฟล์ค่ะ 📦',
    },
    {
      label: '🚚 ค่าจัดส่ง',
      reply: 'ค่าจัดส่งของเราค่ะ 🚚<br/>• Flash Express — <strong>฿50</strong> (1–2 วัน)<br/>• Kerry Express — <strong>฿40</strong> (2–3 วัน)<br/>• <strong>ส่งฟรี</strong> เมื่อซื้อครบ ฿500!',
    },
    {
      label: '💳 วิธีชำระ',
      reply: 'รับชำระหลายช่องทางค่ะ 💳<br/>• บัตรเครดิต / เดบิต (ผ่อน 0%)<br/>• PromptPay QR (ลด 2%)<br/>• True Money Wallet<br/>• เก็บเงินปลายทาง COD (+฿20)',
    },
    {
      label: '↩️ คืนสินค้า',
      reply: 'คืนง่ายภายใน <strong>7 วัน</strong> ไม่ถามเยอะค่ะ ✅<br/>สินค้าต้องอยู่ในสภาพเดิม ไม่เปิดใช้งาน<br/>ติดต่อทีมงานผ่าน Line OA เพื่อดำเนินการได้เลย',
    },
    {
      label: '⭐ สะสมแต้ม',
      reply: 'ทุกการซื้อได้ <strong>10 แต้ม ต่อ ฿100</strong> ค่ะ 🌟<br/>100 แต้ม = ส่วนลด ฿10<br/>ดูแต้มสะสมได้ที่หน้าโปรไฟล์',
    },
    {
      label: '⏰ เวลาทำการ',
      reply: 'ทีมงานพร้อมตอบทุกวัน 🕗<br/><strong>8:00 – 22:00 น.</strong><br/>นอกเวลา bot จะรับข้อความไว้และทีมงานจะตอบกลับเร็วๆ ค่ะ',
    },
  ];

  const LINE_URL = 'https://line.me/R/ti/p/@rubypetshop'; // placeholder

  /* ── Inject CSS ────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    :root { --cw-orange:#FF7043; --cw-orange-d:#E64A19; --cw-green:#06C755; --cw-white:#fff; --cw-cream:#FFF8F0; --cw-text:#2D2D2D; --cw-muted:#9E9E9E; --cw-border:#EBEBEB; }

    /* Hide original line-float when widget active */
    .line-float { display:none !important; }

    /* Bubble trigger */
    #cwBubble {
      position:fixed; bottom:24px; right:24px; z-index:9000;
      width:58px; height:58px; border-radius:50%;
      background:var(--cw-green);
      box-shadow:0 4px 20px rgba(6,199,85,.45);
      border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      font-size:26px;
      transition:transform .2s, box-shadow .2s;
      animation:cwBounce 2.5s ease-in-out 3s 3;
    }
    #cwBubble:hover { transform:scale(1.1); box-shadow:0 6px 28px rgba(6,199,85,.55); }
    @keyframes cwBounce {
      0%,100%{transform:translateY(0)}
      40%    {transform:translateY(-8px)}
      60%    {transform:translateY(-4px)}
    }

    /* Unread badge */
    #cwBadge {
      position:absolute; top:-4px; right:-4px;
      width:20px; height:20px; border-radius:50%;
      background:#FF4444; color:#fff;
      font-size:11px; font-weight:700; font-family:'Nunito',sans-serif;
      display:flex; align-items:center; justify-content:center;
      border:2px solid #fff;
      animation:cwPop .3s cubic-bezier(.4,0,.2,1);
    }
    @keyframes cwPop { from{transform:scale(0)} to{transform:scale(1)} }

    /* Peek tooltip */
    #cwPeek {
      position:fixed; bottom:90px; right:24px; z-index:8999;
      background:var(--cw-white); border-radius:16px 16px 4px 16px;
      padding:12px 16px; box-shadow:0 4px 20px rgba(0,0,0,.14);
      font-family:'Sarabun',sans-serif; font-size:14px; font-weight:600; color:var(--cw-text);
      max-width:220px; line-height:1.5;
      animation:cwSlideUp .35s cubic-bezier(.4,0,.2,1);
      cursor:pointer;
    }
    #cwPeek::after {
      content:''; position:absolute; bottom:-8px; right:20px;
      border:8px solid transparent; border-top-color:var(--cw-white); border-bottom:none;
    }
    @keyframes cwSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

    /* Chat panel */
    #cwPanel {
      position:fixed; bottom:92px; right:24px; z-index:9001;
      width:340px; max-height:520px;
      background:var(--cw-white); border-radius:20px;
      box-shadow:0 12px 48px rgba(0,0,0,.18);
      display:flex; flex-direction:column;
      transform:scale(.92) translateY(16px); opacity:0; pointer-events:none;
      transition:transform .3s cubic-bezier(.4,0,.2,1), opacity .3s;
      overflow:hidden;
    }
    #cwPanel.open { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }

    /* Panel header */
    .cw-header {
      background:linear-gradient(135deg,var(--cw-green) 0%,#00A84F 100%);
      padding:14px 16px; display:flex; align-items:center; gap:12px; flex-shrink:0;
    }
    .cw-header__logo {
      width:42px; height:42px; border-radius:50%;
      background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center;
      font-size:22px; flex-shrink:0;
    }
    .cw-header__info { flex:1; }
    .cw-header__name { color:#fff; font-weight:700; font-size:15px; font-family:'Nunito',sans-serif; }
    .cw-header__status { color:rgba(255,255,255,.85); font-size:12px; display:flex; align-items:center; gap:5px; margin-top:2px; }
    .cw-status-dot { width:8px; height:8px; border-radius:50%; background:#adffd4; animation:cwDotPulse 2s ease-in-out infinite; }
    @keyframes cwDotPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .cw-close-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.8); font-size:20px; padding:4px; line-height:1; flex-shrink:0; }
    .cw-close-btn:hover { color:#fff; }

    /* Messages area */
    .cw-messages {
      flex:1; overflow-y:auto; padding:16px 14px;
      display:flex; flex-direction:column; gap:10px;
      background:#f0f0f0;
      scroll-behavior:smooth;
    }

    /* Bubbles */
    .cw-bubble { max-width:82%; animation:cwFadeIn .25s ease; }
    @keyframes cwFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .cw-bubble--bot {
      align-self:flex-start;
      display:flex; gap:8px; align-items:flex-end;
    }
    .cw-bubble--bot .cw-avatar {
      width:28px; height:28px; border-radius:50%;
      background:var(--cw-green); display:flex; align-items:center; justify-content:center;
      font-size:14px; flex-shrink:0;
    }
    .cw-bubble--bot .cw-text {
      background:#fff; border-radius:16px 16px 16px 4px;
      padding:10px 13px; font-size:13px; line-height:1.6;
      color:var(--cw-text); box-shadow:0 1px 4px rgba(0,0,0,.08);
      font-family:'Sarabun',sans-serif;
    }

    .cw-bubble--user { align-self:flex-end; }
    .cw-bubble--user .cw-text {
      background:var(--cw-green); color:#fff;
      border-radius:16px 16px 4px 16px;
      padding:10px 13px; font-size:13px; line-height:1.6;
      font-family:'Sarabun',sans-serif;
    }

    /* Quick replies */
    .cw-quick-replies {
      display:flex; flex-wrap:wrap; gap:6px;
      padding:0 14px 10px; background:#f0f0f0; flex-shrink:0;
    }
    .cw-qr-btn {
      padding:6px 12px;
      border:1.5px solid var(--cw-green);
      border-radius:20px; background:#fff;
      color:var(--cw-green); font-size:12px; font-weight:700;
      cursor:pointer; font-family:'Sarabun',sans-serif;
      transition:all .18s; white-space:nowrap;
    }
    .cw-qr-btn:hover { background:var(--cw-green); color:#fff; }

    /* Typing indicator */
    .cw-typing {
      display:flex; gap:4px; padding:10px 13px;
      background:#fff; border-radius:16px 16px 16px 4px;
      width:fit-content; box-shadow:0 1px 4px rgba(0,0,0,.08);
    }
    .cw-typing span {
      width:7px; height:7px; border-radius:50%; background:#bbb;
      animation:cwTyping 1.2s ease-in-out infinite;
    }
    .cw-typing span:nth-child(2) { animation-delay:.2s; }
    .cw-typing span:nth-child(3) { animation-delay:.4s; }
    @keyframes cwTyping { 0%,80%,100%{transform:scale(1);opacity:.4} 40%{transform:scale(1.3);opacity:1} }

    /* Input area */
    .cw-input-area {
      display:flex; gap:8px; padding:10px 12px;
      border-top:1px solid var(--cw-border); background:#fff; flex-shrink:0;
    }
    .cw-input {
      flex:1; padding:9px 13px; border:1.5px solid var(--cw-border);
      border-radius:20px; font-size:13px; font-family:'Sarabun',sans-serif;
      outline:none; color:var(--cw-text); background:#fafafa;
    }
    .cw-input:focus { border-color:var(--cw-green); background:#fff; }
    .cw-send-btn {
      width:36px; height:36px; border-radius:50%; border:none;
      background:var(--cw-green); color:#fff; font-size:16px;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:background .2s; flex-shrink:0;
    }
    .cw-send-btn:hover { background:#00A84F; }

    /* Line CTA */
    .cw-line-cta {
      padding:10px 12px; border-top:1px solid var(--cw-border);
      background:#fff; flex-shrink:0;
    }
    .cw-line-btn {
      display:flex; align-items:center; justify-content:center; gap:8px;
      width:100%; padding:10px;
      background:var(--cw-green); color:#fff;
      border:none; border-radius:12px;
      font-size:14px; font-weight:700; font-family:'Sarabun',sans-serif;
      cursor:pointer; text-decoration:none;
      transition:background .2s;
    }
    .cw-line-btn:hover { background:#00A84F; }

    /* Timestamp */
    .cw-time { font-size:10px; color:var(--cw-muted); text-align:center; margin:4px 0; }

    /* Mobile */
    @media (max-width:480px) {
      #cwPanel { width:calc(100vw - 24px); right:12px; bottom:82px; }
      #cwBubble { right:16px; bottom:16px; }
      #cwPeek  { right:16px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build DOM ─────────────────────────────── */
  function buildWidget() {
    // Bubble trigger
    const bubble = document.createElement('button');
    bubble.id = 'cwBubble';
    bubble.setAttribute('aria-label', 'เปิด Live Chat');
    bubble.innerHTML = `<span>💬</span><span id="cwBadge">1</span>`;
    document.body.appendChild(bubble);

    // Peek tooltip
    const peek = document.createElement('div');
    peek.id = 'cwPeek';
    peek.innerHTML = `สวัสดีค่ะ! 🐾 มีอะไรให้ช่วยไหม?`;
    document.body.appendChild(peek);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'cwPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Live Chat');
    panel.innerHTML = `
      <div class="cw-header">
        <div class="cw-header__logo">🐾</div>
        <div class="cw-header__info">
          <div class="cw-header__name">Ruby Pet Shop</div>
          <div class="cw-header__status">
            <span class="cw-status-dot"></span> ออนไลน์ · ตอบเร็วภายใน 5 นาที
          </div>
        </div>
        <button class="cw-close-btn" id="cwClose" aria-label="ปิด">✕</button>
      </div>

      <div class="cw-messages" id="cwMessages"></div>

      <div class="cw-quick-replies" id="cwQuickReplies"></div>

      <div class="cw-input-area">
        <input class="cw-input" id="cwInput" type="text" placeholder="พิมพ์ข้อความ..." maxlength="200"/>
        <button class="cw-send-btn" id="cwSend" aria-label="ส่ง">➤</button>
      </div>

      <div class="cw-line-cta">
        <a class="cw-line-btn" href="${LINE_URL}" target="_blank" rel="noopener">
          💬 คุยกับทีมงานบน Line OA
        </a>
      </div>
    `;
    document.body.appendChild(panel);
  }

  /* ── Messaging logic ───────────────────────── */
  let panelOpen = false;
  let peekTimer = null;
  let qrRendered = false;

  function now() {
    return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  function addBotMessage(html) {
    const msgs = document.getElementById('cwMessages');
    if (!msgs) return;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'cw-bubble cw-bubble--bot';
    typing.innerHTML = `
      <div class="cw-avatar">🐾</div>
      <div class="cw-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const bubble = document.createElement('div');
      bubble.className = 'cw-bubble cw-bubble--bot';
      bubble.innerHTML = `<div class="cw-avatar">🐾</div><div class="cw-text">${html}</div>`;
      msgs.appendChild(bubble);

      const time = document.createElement('div');
      time.className = 'cw-time';
      time.textContent = now();
      msgs.appendChild(time);

      msgs.scrollTop = msgs.scrollHeight;
    }, 900);
  }

  function addUserMessage(text) {
    const msgs = document.getElementById('cwMessages');
    if (!msgs) return;
    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble cw-bubble--user';
    bubble.innerHTML = `<div class="cw-text">${escHtml(text)}</div>`;
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderQuickReplies() {
    if (qrRendered) return;
    qrRendered = true;
    const container = document.getElementById('cwQuickReplies');
    if (!container) return;
    container.innerHTML = FAQ.map((f, i) =>
      `<button class="cw-qr-btn" data-idx="${i}">${f.label}</button>`
    ).join('');
    container.querySelectorAll('.cw-qr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const faq = FAQ[parseInt(btn.dataset.idx, 10)];
        addUserMessage(faq.label);
        addBotMessage(faq.reply);
        // Don't hide quick replies so user can ask more
      });
    });
  }

  function openPanel() {
    panelOpen = true;
    document.getElementById('cwPanel').classList.add('open');
    clearTimeout(peekTimer);
    hidePeek();
    hideBadge();

    // Greeting on first open
    const msgs = document.getElementById('cwMessages');
    if (msgs && msgs.children.length === 0) {
      setTimeout(() => {
        addBotMessage('สวัสดีค่ะ! ยินดีต้อนรับสู่ <strong>Ruby Pet Shop</strong> 🐾<br/>มีอะไรให้ช่วยไหมคะ? เลือกหัวข้อด้านล่างหรือพิมพ์ถามได้เลยค่ะ');
        setTimeout(renderQuickReplies, 1200);
      }, 200);
    } else {
      renderQuickReplies();
    }

    setTimeout(() => document.getElementById('cwInput')?.focus(), 300);
  }

  function closePanel() {
    panelOpen = false;
    document.getElementById('cwPanel').classList.remove('open');
  }

  function hidePeek() {
    const peek = document.getElementById('cwPeek');
    if (peek) peek.style.display = 'none';
  }

  function hideBadge() {
    const badge = document.getElementById('cwBadge');
    if (badge) badge.style.display = 'none';
  }

  function sendUserMessage() {
    const input = document.getElementById('cwInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);

    // Smart auto-reply based on keywords
    const lower = text.toLowerCase();
    let reply = 'ขอบคุณที่ส่งข้อความมาค่ะ 😊 ทีมงานจะตอบกลับภายใน 5 นาที หรือกด Line OA ด้านล่างเพื่อคุยทันทีค่ะ';

    if (/(ออเดอร์|order|สั่ง|ติดตาม|พัสดุ)/.test(lower)) {
      reply = `ตรวจสอบสถานะออเดอร์ได้ที่ <a href="tracking.html" style="color:var(--cw-green);font-weight:700">หน้าติดตามพัสดุ</a> ค่ะ 📦`;
    } else if (/(ส่ง|ค่าส่ง|shipping|delivery)/.test(lower)) {
      reply = FAQ[1].reply;
    } else if (/(ชำระ|จ่าย|payment|บัตร|qr|promptpay)/.test(lower)) {
      reply = FAQ[2].reply;
    } else if (/(คืน|return|refund)/.test(lower)) {
      reply = FAQ[3].reply;
    } else if (/(แต้ม|point|สะสม)/.test(lower)) {
      reply = FAQ[4].reply;
    } else if (/(สวัสดี|hello|hi|หวัดดี)/.test(lower)) {
      reply = 'สวัสดีค่ะ! 🐾 ยินดีให้บริการเสมอค่ะ มีอะไรให้ช่วยไหมคะ?';
    }

    addBotMessage(reply);
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Init ──────────────────────────────────── */
  function init() {
    buildWidget();

    const bubble = document.getElementById('cwBubble');
    const peek   = document.getElementById('cwPeek');

    bubble.addEventListener('click', () => {
      if (panelOpen) closePanel(); else openPanel();
    });

    document.getElementById('cwClose')?.addEventListener('click', closePanel);
    peek?.addEventListener('click', openPanel);

    document.getElementById('cwSend')?.addEventListener('click', sendUserMessage);
    document.getElementById('cwInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendUserMessage();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });

    // Show peek tooltip after 4 seconds if panel not opened
    peekTimer = setTimeout(() => {
      if (!panelOpen) peek.style.display = '';
      // Hide it after 6 seconds
      setTimeout(() => {
        if (!panelOpen) hidePeek();
      }, 6000);
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
