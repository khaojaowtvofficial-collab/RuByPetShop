/* ===================================================
   Ruby Pet Shop — Product Detail JS
=================================================== */

/* =============================================
   REVIEWS — localStorage
============================================= */
const REVIEWS_KEY = 'ruby_reviews';

function loadUserReviews(pid) {
  try {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    return Array.isArray(all[pid]) ? all[pid] : [];
  } catch { return []; }
}

function saveUserReview(pid, review) {
  try {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    if (!Array.isArray(all[pid])) all[pid] = [];
    all[pid].unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch { }
}

/* =============================================
   PRODUCT DATABASE (shared with index)
============================================= */
const PRODUCTS_DB = {
  'P001': {
    id: 'P001',
    name: 'Royal Canin Adult 15kg อาหารสุนัขพันธุ์ใหญ่',
    brand: 'Royal Canin',
    category: 'dog-food',
    categoryLabel: 'อาหารน้องหมา',
    price: 1290,
    originalPrice: 1590,
    badge: 'hot',
    rating: 4.9,
    reviewCount: 248,
    sold: 1240,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=700&q=90',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=700&q=90',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=90',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&q=90',
    ],
    variants: {
      size: ['3kg', '8kg', '15kg', '25kg'],
      selected: { size: '15kg' }
    },
    description: `Royal Canin Maxi Adult เป็นอาหารสูตรพิเศษสำหรับสุนัขพันธุ์ใหญ่ อายุ 15 เดือนขึ้นไป
น้ำหนัก 26–44 กิโลกรัม ออกแบบโดยนักโภชนาการและสัตวแพทย์มืออาชีพ เพื่อตอบสนองความต้องการ
ทางโภชนาการเฉพาะของสุนัขพันธุ์ใหญ่`,
    highlights: [
      { icon:'🦴', title:'บำรุงข้อต่อ', desc:'EPA + DHA ช่วยดูแลข้อต่อและกระดูก' },
      { icon:'💪', title:'รักษากล้ามเนื้อ', desc:'โปรตีนคุณภาพสูง 28% ต่อกิโลกรัม' },
      { icon:'🫀', title:'ดูแลหัวใจ', desc:'L-Carnitine สนับสนุนสุขภาพหัวใจ' },
      { icon:'✨', title:'ขนสวยเงางาม', desc:'Omega 3 & 6 ช่วยบำรุงผิวและขน' },
    ],
    nutrition: [
      { name:'โปรตีน', value:'26%' },
      { name:'ไขมัน', value:'16%' },
      { name:'เส้นใยอาหาร', value:'1.4%' },
      { name:'ความชื้น', value:'10%' },
      { name:'แร่ธาตุรวม', value:'5.5%' },
      { name:'แคลเซียม', value:'1.4%' },
      { name:'ฟอสฟอรัส', value:'1.1%' },
    ],
    ingredients: 'ข้าวโพด, ไก่ (ผง), แป้งข้าวโพด, เนื้อสัตว์ปีก (ผง), ข้าวสาลี, ไขมันสัตว์, กากน้ำตาล, ปลาไฮโดรไลซ์, ไข่ (ผง), น้ำมันปลา, กากเมล็ดป่าน, น้ำมันข้าวโพด, ฟรุคโตโอลิโกแซคคาไรด์, สารสกัดจากดาวเรือง (ลูทีน), วิตามิน A, D3, E, B12, กรดโฟลิก, ไบโอติน',
    howTo: [
      'ค่อยๆ เปลี่ยนอาหารภายใน 7 วัน เพื่อหลีกเลี่ยงอาการท้องเสีย',
      'แบ่งให้ 2 ครั้งต่อวัน เช้าและเย็น',
      'มีน้ำสะอาดให้น้องตลอดเวลา',
      'ปิดถุงให้สนิท เก็บในที่เย็นและแห้ง',
    ],
    feedingGuide: [
      { weight:'26–35 kg', daily:'250–305 g' },
      { weight:'36–44 kg', daily:'305–365 g' },
      { weight:'45+ kg',   daily:'365–420 g' },
    ],
    reviews: [
      { name:'คุณมาลี + น้องโกลด์', avatar:'🐶', rating:5, date:'15 พ.ค. 2026', text:'น้องโกลด์ชอบมากเลยค่ะ กินหมดทุกมื้อ ขนสวยขึ้นด้วย สั่งซ้ำทุกเดือนเลย!', images:['https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80'], helpful:24 },
      { name:'คุณต้น + น้องแมกซ์', avatar:'🐕', rating:5, date:'10 พ.ค. 2026', text:'คุ้มมากครับ ราคาถูกกว่าร้านอื่นเยอะ ส่งเร็วมาก แพ็คดี จะสั่งซ้ำแน่นอน', images:[], helpful:18 },
      { name:'คุณนิด + น้องบัดดี้', avatar:'🦮', rating:4, date:'3 พ.ค. 2026', text:'ดีครับ น้องกินได้เป็นปกติ แต่ถุงฉีกง่ายนิดนึง นอกนั้นโอเค', images:['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80'], helpful:7 },
    ],
    ratingDist: { 5:198, 4:36, 3:10, 2:3, 1:1 },
    related: ['P005','P003','P007'],
  },

  'P002': {
    id: 'P002',
    name: 'Whiskas อาหารแมวรสปลาแซลมอน 1.2kg',
    brand: 'Whiskas',
    category: 'cat-food',
    categoryLabel: 'อาหารน้องแมว',
    price: 299,
    originalPrice: 0,
    badge: 'new',
    rating: 4.8,
    reviewCount: 187,
    sold: 890,
    stock: 88,
    images: [
      'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=700&q=90',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700&q=90',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=700&q=90',
    ],
    variants: {
      flavor: ['ปลาแซลมอน', 'ทูน่า', 'ไก่', 'กุ้ง'],
      size:   ['400g', '1.2kg', '3kg'],
      selected: { flavor: 'ปลาแซลมอน', size: '1.2kg' }
    },
    description: 'Whiskas สูตรพิเศษสำหรับแมวโตอายุ 1+ ปี ให้สารอาหารครบถ้วน 100% ตามที่แมวต้องการ ด้วยรสชาติปลาแซลมอนที่แมวชอบ เสริมด้วยวิตามินและแร่ธาตุที่จำเป็น',
    highlights: [
      { icon:'🐟', title:'ปลาแซลมอนแท้', desc:'โปรตีนจากปลาแซลมอนคุณภาพสูง' },
      { icon:'🦷', title:'ดูแลฟัน', desc:'สูตรพิเศษช่วยลดหินปูน' },
      { icon:'🧡', title:'ไตแข็งแรง', desc:'ควบคุมแร่ธาตุที่เหมาะสมสำหรับไต' },
      { icon:'🌿', title:'ย่อยง่าย', desc:'เส้นใยและพรีไบโอติกช่วยการย่อย' },
    ],
    nutrition: [
      { name:'โปรตีน', value:'30%' },
      { name:'ไขมัน', value:'12%' },
      { name:'เส้นใยอาหาร', value:'2%' },
      { name:'ความชื้น', value:'10%' },
      { name:'ฟอสฟอรัส', value:'0.85%' },
    ],
    ingredients: 'ปลาแซลมอน, ข้าวโพด, แป้งสาลี, ไขมันสัตว์, แป้งมันสำปะหลัง, น้ำมันปลา, วิตามินรวม, แร่ธาตุรวม',
    howTo: [
      'แบ่งให้ 2–3 ครั้งต่อวัน',
      'แมวหนัก 3–4 kg ให้ประมาณ 50–60g ต่อวัน',
      'มีน้ำสะอาดให้เสมอ',
      'เก็บในที่เย็น ปิดถุงให้สนิท',
    ],
    feedingGuide: [
      { weight:'2–3 kg', daily:'35–50 g' },
      { weight:'3–5 kg', daily:'50–70 g' },
      { weight:'5+ kg',  daily:'70–90 g' },
    ],
    reviews: [
      { name:'คุณก้อย + น้องมะม่วง', avatar:'🐱', rating:5, date:'18 พ.ค. 2026', text:'น้องมะม่วงชอบมากค่ะ กินหมดทุกครั้ง ไม่เหลือทิ้งเลย ส่งเร็วมากด้วย', images:['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80'], helpful:31 },
      { name:'คุณเจน + น้องบัตเตอร์', avatar:'😺', rating:5, date:'12 พ.ค. 2026', text:'ดีมากครับ แมวกินดี ขนนุ่ม ราคาถูกด้วย จะสั่งซ้ำแน่นอน', images:[], helpful:15 },
    ],
    ratingDist: { 5:150, 4:27, 3:7, 2:2, 1:1 },
    related: ['P006','P004','P008'],
  },

  'P003': {
    id: 'P003',
    name: 'Kong Classic ของเล่นยางกรอก ขนาด M',
    brand: 'Kong',
    category: 'dog-toy',
    categoryLabel: 'ของเล่นน้องหมา',
    price: 490,
    originalPrice: 590,
    badge: 'hot',
    rating: 4.7,
    reviewCount: 92,
    sold: 460,
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=700&q=90',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&q=90',
    ],
    variants: {
      size: ['S (น้ำหนัก <9kg)', 'M (น้ำหนัก 9–27kg)', 'L (น้ำหนัก 27kg+)'],
      color: ['สีแดง', 'สีดำ (Extra Tough)', 'สีชมพู (Puppy)'],
      selected: { size: 'M (น้ำหนัก 9–27kg)', color: 'สีแดง' }
    },
    description: 'Kong Classic ของเล่นยางธรรมชาติทรงกลมรูปทรง Snowman ที่คลาสสิกที่สุด กรอกขนม ขนมปัง หรือเนยถั่วได้ ช่วยให้น้องสนุก ลด boredom และ separation anxiety ได้อย่างมีประสิทธิภาพ',
    highlights: [
      { icon:'🦷', title:'ทำความสะอาดฟัน', desc:'รูปทรงช่วยขัดฟันและเหงือก' },
      { icon:'🧠', title:'กระตุ้นสมอง', desc:'ให้น้องคิดหาวิธีดึงขนมออก' },
      { icon:'💪', title:'ยางคุณภาพสูง', desc:'ทนทาน ไม่แตกหัก ปลอดภัย 100%' },
      { icon:'🌡️', title:'แช่แข็งได้', desc:'กรอกขนมแล้วแช่แข็งเพิ่มความสนุก' },
    ],
    nutrition: [],
    ingredients: 'วัสดุ: ยางธรรมชาติ 100% ผ่านการทดสอบความปลอดภัย ปราศจาก BPA, Phthalate, ผลิตใน USA',
    howTo: [
      'กรอกขนมที่น้องชอบ เช่น เนยถั่ว, ซอฟท์ฟูด, ขนมฝึก',
      'สามารถแช่แข็งได้เพื่อความสนุกนานยิ่งขึ้น',
      'ล้างด้วยน้ำอุ่นหรือใส่ dishwasher ได้',
      'ตรวจสอบสภาพสม่ำเสมอ ถ้าฉีกขาดให้เปลี่ยนใหม่',
    ],
    feedingGuide: [],
    reviews: [
      { name:'คุณมิ้น + น้องซอนเต้', avatar:'🐶', rating:5, date:'19 พ.ค. 2026', text:'น้องเล่นทุกวันเลยค่ะ กรอกเนยถั่วแล้วแช่แข็ง น้องนั่งแกะอยู่นานมาก ดีมาก!', images:['https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80'], helpful:19 },
    ],
    ratingDist: { 5:72, 4:14, 3:4, 2:1, 1:1 },
    related: ['P007','P001','P005'],
  },

  'P004': {
    id: 'P004',
    name: 'ของเล่นไม้ตกปลาแมวพร้อมขนนก',
    brand: 'PetDreamHouse',
    category: 'cat-toy',
    categoryLabel: 'ของเล่นน้องแมว',
    price: 189,
    originalPrice: 0,
    badge: '',
    rating: 4.9,
    reviewCount: 321,
    sold: 1600,
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700&q=90',
      'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=700&q=90',
    ],
    variants: {
      type: ['ขนนก', 'ลูกบอลระย้า', 'ปลาตุ๊กตา', 'แมลงวิบวับ'],
      selected: { type: 'ขนนก' }
    },
    description: 'ไม้ตกปลาแมวคุณภาพดี ด้ามไม้แท้ยาว 50 ซม. สายเส้นเหนียว ปลายติดขนนกแท้สีสันสดใสที่แมวต้านทานไม่ได้ ช่วยกระตุ้น instinct การล่าของแมว ออกกำลังกาย และสร้าง bond ระหว่างเจ้าของกับน้อง',
    highlights: [
      { icon:'🪶', title:'ขนนกแท้', desc:'แมวสนใจมากกว่าวัสดุสังเคราะห์' },
      { icon:'🎯', title:'กระตุ้น Instinct', desc:'จำลองการล่าเหยื่อ' },
      { icon:'💪', title:'ออกกำลังกาย', desc:'แมวในบ้านได้ขยับร่างกาย' },
      { icon:'❤️', title:'Bonding', desc:'เล่นกับน้องสร้างความผูกพัน' },
    ],
    nutrition: [],
    ingredients: 'ไม้ธรรมชาติ, สายไนลอน, ขนนกแท้, สีปลอดสาร',
    howTo: [
      'เล่นกับน้องวันละ 15–20 นาที',
      'เก็บให้พ้นมือเมื่อไม่ได้เล่น (ป้องกันน้องพันสาย)',
      'ถ้าขนหลุดเยอะให้เปลี่ยนหัวใหม่',
    ],
    feedingGuide: [],
    reviews: [
      { name:'คุณก้อย + น้องมะม่วง', avatar:'🐱', rating:5, date:'20 พ.ค. 2026', text:'ไม้ตกปลาตัวนี้น้องมะม่วงเล่นทุกวันเลยค่ะ สนุกมาก วิ่งตามตลอด คุ้มมากๆ', images:['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&q=80'], helpful:45 },
      { name:'คุณเจน + น้องบัตเตอร์', avatar:'😸', rating:5, date:'14 พ.ค. 2026', text:'ขนแน่น สวย แมวชอบมาก ส่งเร็วดีค่ะ', images:[], helpful:22 },
    ],
    ratingDist: { 5:290, 4:22, 3:6, 2:2, 1:1 },
    related: ['P008','P002','P006'],
  },

  'P005': { id:'P005', name:'Pedigree Dentastix ขนมกัดฟัน 7 ชิ้น', brand:'Pedigree', category:'dog-food', categoryLabel:'ขนมน้องหมา', price:149, originalPrice:0, badge:'new', rating:4.5, reviewCount:156, sold:780, stock:200,
    images:['https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=700&q=90','https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=700&q=90'],
    variants:{ size:['Small (สุนัข < 10kg)','Medium (10–25kg)','Large (> 25kg)'], selected:{size:'Medium (10–25kg)'} },
    description:'Pedigree Dentastix ขนมแท่งเนื้อนิ่มช่วยลดคราบหินปูนและดูแลเหงือก วิจัยและพิสูจน์แล้วว่าลดหินปูนได้ถึง 80% เมื่อให้กินทุกวัน',
    highlights:[{icon:'🦷',title:'ลดหินปูน 80%',desc:'พิสูจน์โดยงานวิจัยระดับโลก'},{icon:'🌿',title:'สูตรต่ำแคลอรี',desc:'ให้กินได้ทุกวันไม่อ้วน'},{icon:'🐾',title:'รสชาติที่ชอบ',desc:'หมาชอบมาก กินอย่างมีความสุข'},{icon:'✅',title:'ปลอดภัย',desc:'ผ่านมาตรฐาน AAFCO'}],
    nutrition:[{name:'โปรตีน',value:'5.5%'},{name:'ไขมัน',value:'2%'},{name:'เส้นใย',value:'3%'},{name:'ความชื้น',value:'26%'}],
    ingredients:'แป้งสาลี, กลีเซอรีน, ไก่, แป้งข้าวโพด, เจลาติน, น้ำตาลซอร์บิทอล, สารช่วยดูแลฟัน',
    howTo:['ให้กิน 1 แท่งต่อวัน','เหมาะเป็นขนมหลังอาหาร','มีน้ำสะอาดให้เสมอ'],
    feedingGuide:[],
    reviews:[{name:'คุณนิด + น้องลัคกี้',avatar:'🦮',rating:5,date:'16 พ.ค. 2026',text:'ฟันสะอาดขึ้นเห็นได้ชัดค่ะ หมากินทุกวันด้วยความสุข แนะนำมาก!',images:[],helpful:28}],
    ratingDist:{5:120,4:26,3:7,2:2,1:1},related:['P001','P003','P007'] },

  'P006': { id:'P006', name:'Sheba อาหารแมวเปียก แพ็ค 12 ถุง', brand:'Sheba', category:'cat-food', categoryLabel:'อาหารน้องแมว', price:259, originalPrice:320, badge:'hot', rating:4.9, reviewCount:409, sold:2000, stock:63,
    images:['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=700&q=90','https://images.unsplash.com/photo-1548366086-7f1b76106622?w=700&q=90'],
    variants:{ flavor:['ทูน่าชีส','แซลมอนแครอท','ไก่ฟักทอง','มิกซ์รสชาติ'], selected:{flavor:'มิกซ์รสชาติ'} },
    description:'Sheba อาหารแมวเปียกพรีเมียม คัดสรรวัตถุดิบคุณภาพ ไม่มีสีสังเคราะห์ ไม่มีผงชูรส แมวกินได้ทุกวันอย่างมั่นใจ',
    highlights:[{icon:'🐟',title:'ปลาแท้',desc:'วัตถุดิบคุณภาพ ไม่ใช้เนื้อสัตว์รอง'},{icon:'💧',title:'ความชื้นสูง',desc:'ช่วยให้น้องดื่มน้ำเพียงพอ'},{icon:'🚫',title:'ไม่มีสารกันบูด',desc:'สูตรธรรมชาติ 100%'},{icon:'😋',title:'กินง่าย',desc:'แมวจุกจิกก็ชอบ'}],
    nutrition:[{name:'โปรตีน',value:'11%'},{name:'ไขมัน',value:'5%'},{name:'เถ้า',value:'2%'},{name:'ความชื้น',value:'75%'}],
    ingredients:'ปลาทูน่า, น้ำ, ปลาแซลมอน, แป้งข้าวโพด, วิตามินและแร่ธาตุรวม',
    howTo:['แบ่งให้ 2–3 ครั้งต่อวัน','แมวหนัก 3–4 kg ให้ 2–3 ถุงต่อวัน','เปิดแล้วเก็บตู้เย็น ใช้ภายใน 24 ชม.'],
    feedingGuide:[{weight:'2–3 kg',daily:'1–2 ถุง'},{weight:'3–5 kg',daily:'2–3 ถุง'},{weight:'5+ kg',daily:'3–4 ถุง'}],
    reviews:[{name:'คุณต้น + น้องมะม่วง',avatar:'🐱',rating:5,date:'19 พ.ค. 2026',text:'แมวชอบมากค่ะ กินหมดทุกครั้ง ราคาคุ้มมาก สั่งซ้ำทุกเดือน',images:['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80'],helpful:52},{name:'คุณมาลี',avatar:'😺',rating:5,date:'10 พ.ค. 2026',text:'ดีมากๆ แมว 3 ตัวชอบทุกตัว',images:[],helpful:34}],
    ratingDist:{5:365,4:33,3:8,2:2,1:1},related:['P002','P004','P008'] },

  'P007': { id:'P007', name:'Chuckit! Ultra Ball ลูกบอลเทนนิส 2 ลูก', brand:'Chuckit!', category:'dog-toy', categoryLabel:'ของเล่นน้องหมา', price:350, originalPrice:0, badge:'', rating:4.6, reviewCount:74, sold:370, stock:8,
    images:['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&q=90','https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=700&q=90'],
    variants:{ size:['Small','Medium','Large'], selected:{size:'Medium'} },
    description:'Chuckit! Ultra Ball ลูกบอลยางธรรมชาติ ทนทานกว่าลูกเทนนิสทั่วไป 2 เท่า ยืดหยุ่นดี เด้งสูง เหมาะสำหรับโยน วิ่งเล่น และว่ายน้ำ มาพร้อมกัน 2 ลูก',
    highlights:[{icon:'⚡',title:'ทนทาน 2x',desc:'แข็งแกร่งกว่าลูกเทนนิสทั่วไป'},{icon:'🌊',title:'ว่ายน้ำได้',desc:'ลอยน้ำได้ เหมาะกับน้องชอบน้ำ'},{icon:'🎯',title:'เด้งดี',desc:'เด้งสม่ำเสมอ โยนง่าย'},{icon:'🔆',title:'สีสดใส',desc:'มองเห็นง่ายในทุกสภาพแสง'}],
    nutrition:[],
    ingredients:'วัสดุ: ยางธรรมชาติ 100% ปลอดสาร BPA และสาร Latex',
    howTo:['โยนให้น้องวิ่งไล่','ใช้กับ Chuckit! Launcher โยนได้ไกลยิ่งขึ้น','ล้างด้วยน้ำสะอาดหลังเล่น'],
    feedingGuide:[],
    reviews:[{name:'คุณบิ๊ก + น้องรอน',avatar:'🐕',rating:5,date:'17 พ.ค. 2026',text:'น้องชอบมาก เล่นทุกวัน ทนมากกว่าลูกบอลทั่วไป คุ้มมาก!',images:[],helpful:12}],
    ratingDist:{5:58,4:12,3:3,2:1,1:0},related:['P003','P001','P005'] },

  'P008': { id:'P008', name:'CatLife บ้านแมวกระดาษลับเล็บพร้อมลูกบอล', brand:'CatLife', category:'cat-toy', categoryLabel:'ของเล่นน้องแมว', price:599, originalPrice:750, badge:'new', rating:4.9, reviewCount:203, sold:1015, stock:0,
    images:['https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=700&q=90','https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700&q=90'],
    variants:{ color:['Natural Brown','Pastel Pink','Monochrome Black'], selected:{color:'Natural Brown'} },
    description:'บ้านแมวกระดาษลูกฟูก 2 ชั้น พร้อมที่ลับเล็บ ลูกบอล และรูแมวมุด ออกแบบเพื่อตอบสนองทุก Instinct ของแมว ทั้งการซ่อน ลับเล็บ และเล่น',
    highlights:[{icon:'📦',title:'กระดาษ Eco',desc:'วัสดุรีไซเคิล เป็นมิตรต่อสิ่งแวดล้อม'},{icon:'🏠',title:'ซ่อนได้',desc:'แมวชอบมุดเข้ามุดออก'},{icon:'💅',title:'ลับเล็บได้',desc:'กระดาษลูกฟูกหนาพิเศษ'},{icon:'🎾',title:'ลูกบอลแถม',desc:'มาพร้อมลูกบอลระย้า 1 ลูก'}],
    nutrition:[],
    ingredients:'กระดาษลูกฟูก 100% รีไซเคิล, สีน้ำปลอดสาร, ลูกบอล ABS',
    howTo:['ประกอบง่าย ไม่ต้องใช้กาว','วางในมุมที่แมวชอบ','เปลี่ยนเมื่อกระดาษขาดหมด (refill ได้)'],
    feedingGuide:[],
    reviews:[{name:'คุณเจน + น้องบัตเตอร์',avatar:'🐱',rating:5,date:'20 พ.ค. 2026',text:'น้องบัตเตอร์เข้าบ้านตลอดเลยค่ะ ออกมาแค่ตอนกินข้าว ดีใจมากที่ซื้อ',images:['https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=200&q=80'],helpful:67},{name:'คุณก้อย',avatar:'😸',rating:5,date:'15 พ.ค. 2026',text:'คุ้มมากๆ แมว 2 ตัวเล่นด้วยกัน',images:[],helpful:41}],
    ratingDist:{5:185,4:13,3:4,2:1,1:0},related:['P004','P002','P006'] },
};

/* =============================================
   CART (localStorage)
============================================= */
let cart = JSON.parse(localStorage.getItem('ruby_cart') || '[]');

function saveCart() { localStorage.setItem('ruby_cart', JSON.stringify(cart)); }

function addToCart(productId, qty = 1) {
  const p = PRODUCTS_DB[productId];
  if (!p || p.stock === 0) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty = Math.min(existing.qty + qty, p.stock);
  else cart.push({ id: productId, name: p.name, price: p.price, qty, img: p.images[0] });
  saveCart();
  updateCartCount();
  showToast(`🛒 เพิ่ม "${p.name}" ลงตะกร้าแล้ว!`);
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
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
   RENDER PRODUCT
============================================= */
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'P001';
}

let currentProduct = null;
let currentQty = 1;
let selectedVariants = {};

function renderProduct(product) {
  currentProduct = product;
  selectedVariants = { ...(product.variants?.selected || {}) };
  document.title = `${product.name} — Ruby Pet Shop`;

  // Inject OG / Twitter meta tags dynamically
  (function updateOgTags() {
    const img = product.images?.[0] || '';
    const desc = product.description
      ? product.description.replace(/<[^>]*>/g,'').slice(0,150)
      : `${product.name} — ซื้อได้ที่ Ruby Pet Shop คุณภาพดี ส่งเร็ว ราคาถูก`;
    const url = window.location.href;
    const setMeta = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute('content', val); };
    setMeta('ogTitle',  `${product.name} — Ruby Pet Shop`);
    setMeta('ogDesc',   desc);
    setMeta('ogImage',  img);
    setMeta('ogUrl',    url);
    setMeta('twTitle',  `${product.name} — Ruby Pet Shop`);
    setMeta('twDesc',   desc);
    setMeta('twImage',  img);
  })();

  // Breadcrumb
  document.getElementById('bcCategory').textContent = product.categoryLabel;
  document.getElementById('bcProduct').textContent   = product.name;

  const layout = document.getElementById('productLayout');
  layout.innerHTML = `
    <!-- GALLERY -->
    <div class="product-gallery" id="productGallery">
      <div class="gallery__main-wrap">
        <img src="${product.images[0]}" alt="${product.name}" class="gallery__main-img" id="mainImg"/>
        <div class="gallery__badge">
          ${product.badge === 'hot'  ? '<span class="badge badge--hot">🔥 ขายดี</span>' : ''}
          ${product.badge === 'new'  ? '<span class="badge badge--new">🌟 ใหม่</span>' : ''}
          ${product.badge === 'sale' ? '<span class="badge badge--sale">💥 ลด</span>' : ''}
          ${product.stock === 0      ? '<span class="badge badge--sale">หมดสต็อก</span>' : ''}
        </div>
        <button class="gallery__wishlist" id="wishlistBtn">♡</button>
        <button class="gallery__share" id="shareBtn">⬆</button>
      </div>
      <div class="gallery__thumbs" id="thumbs">
        ${product.images.map((img, i) => `
          <div class="gallery__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${img}" alt="รูปที่ ${i+1}"/>
          </div>`).join('')}
      </div>
    </div>

    <!-- INFO -->
    <div class="product-info">
      <div class="product-info__brand">${product.brand}</div>
      <h1 class="product-info__name">${product.name}</h1>

      <div class="product-info__rating">
        <span class="rating-stars-big">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</span>
        <span class="rating-num">${product.rating}</span>
        <span class="rating-count-link" onclick="goToReviews()">(${product.reviewCount} รีวิว)</span>
        <span class="rating-sold">• ขายแล้ว ${product.sold.toLocaleString()} ชิ้น</span>
      </div>

      <div class="product-info__price-block">
        <div class="price-row">
          <span class="price-main">฿ ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `
            <span class="price-was">฿ ${product.originalPrice.toLocaleString()}</span>
            <span class="price-save">-${Math.round((1 - product.price/product.originalPrice)*100)}%</span>` : ''}
        </div>
        <div class="price-note">💳 ผ่อน 0% นาน 3 เดือน | PromptPay ลด 2%</div>
      </div>

      ${renderStockIndicator(product)}
      ${renderVariants(product)}

      <div class="atc-row">
        <div class="qty-control">
          <button class="qty-control-btn" id="qtyMinus">−</button>
          <span class="qty-display" id="qtyDisplay">1</span>
          <button class="qty-control-btn" id="qtyPlus">+</button>
        </div>
        <button class="btn btn-primary btn-atc" id="addCartBtn" ${product.stock === 0 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>
          ${product.stock === 0 ? '😔 สินค้าหมด' : '🛒 หยิบใส่ตะกร้า'}
        </button>
      </div>

      <button class="btn btn-buy-now" id="buyNowBtn" ${product.stock === 0 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>
        ⚡ ซื้อเลย
      </button>

      <div class="trust-mini">
        <div class="trust-mini-item"><span>✅</span><span>ของแท้ 100%</span></div>
        <div class="trust-mini-item"><span>↩️</span><span>คืนได้ 7 วัน</span></div>
        <div class="trust-mini-item"><span>🔒</span><span>ชำระปลอดภัย</span></div>
        <div class="trust-mini-item"><span>📦</span><span>แพ็คอย่างดี</span></div>
      </div>

      <div class="delivery-info">
        <span style="font-size:24px">🚀</span>
        <div>
          <strong>ส่งเร็ว ได้พรุ่งนี้!</strong>
          สั่งภายใน 14:00 น. ส่งทาง Flash Express ได้รับพรุ่งนี้
        </div>
      </div>

      <div class="share-row">
        <span>แชร์ให้เพื่อน:</span>
        <button class="share-btn" title="Facebook">📘</button>
        <button class="share-btn" title="Line">💬</button>
        <button class="share-btn" title="Copy link" id="copyLinkBtn">🔗</button>
      </div>
    </div>
  `;

  // Sticky ATC
  document.getElementById('stickyName').textContent = product.name;
  document.getElementById('stickyPrice').textContent = `฿ ${product.price.toLocaleString()}`;

  bindGalleryEvents(product);
  bindInfoEvents(product);
  renderTabs(product);
  renderRelated(product);
  saveRecentlyViewed(product);
  renderRecentlyViewed(product.id);

  document.getElementById('tabsSection').style.display = '';
  document.getElementById('relatedSection').style.display = '';
}

function renderStockIndicator(p) {
  if (p.stock === 0) {
    return `<div class="stock-indicator" style="margin-bottom:16px">
      <div class="stock-dot stock-dot--out"></div>
      <span style="color:#EF4444">สินค้าหมดสต็อก — แจ้งเตือนเมื่อมีสินค้า</span>
    </div>`;
  }
  const pct = Math.min((p.stock / 100) * 100, 100);
  const cls = p.stock < 10 ? 'low' : 'in';
  const msg = p.stock < 10 ? `⚠️ เหลือเพียง ${p.stock} ชิ้น!` : `มีสินค้า ${p.stock} ชิ้น`;
  return `<div class="stock-indicator" style="margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div class="stock-dot stock-dot--${cls}"></div>
    <span>${msg}</span>
    <div class="stock-bar" style="flex:1;min-width:100px">
      <div class="stock-bar-fill" style="width:${pct}%;background:${cls==='low'?'#FF9800':'var(--green)'}"></div>
    </div>
  </div>`;
}

function renderVariants(p) {
  if (!p.variants) return '';
  const { size, flavor, color, type } = p.variants;
  let html = '';
  if (flavor) html += variantGroup('รสชาติ', 'flavor', flavor, p);
  if (size)   html += variantGroup('ขนาด',   'size',   size,   p);
  if (color)  html += variantGroup('สี',      'color',  color,  p);
  if (type)   html += variantGroup('แบบ',     'type',   type,   p);
  return html;
}

function variantGroup(label, key, options, p) {
  const selected = selectedVariants[key] || options[0];
  return `<div class="variant-section">
    <div class="variant-label">${label}: <span>${selected}</span></div>
    <div class="variant-options">
      ${options.map(opt => `
        <button class="variant-btn ${opt === selected ? 'active' : ''}"
          data-key="${key}" data-val="${opt}">${opt}</button>`).join('')}
    </div>
  </div>`;
}

/* =============================================
   GALLERY EVENTS
============================================= */
function bindGalleryEvents(product) {
  const mainImg = document.getElementById('mainImg');
  const thumbs  = document.querySelectorAll('.gallery__thumb');

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = product.images[i];
        mainImg.style.opacity = '1';
      }, 150);
    });
  });

  // Zoom
  mainImg.addEventListener('click', () => {
    mainImg.classList.toggle('zoomed');
  });

  // Wishlist — synced with localStorage
  const wlBtn = document.getElementById('wishlistBtn');
  if (wlBtn) {
    const WKEY = 'ruby_wishlist';
    const getWL = () => { try { return JSON.parse(localStorage.getItem(WKEY) || '[]'); } catch { return []; } };
    const saveWL = l => localStorage.setItem(WKEY, JSON.stringify(l));

    // Set initial state
    const inList = getWL().some(i => i.id === product.id);
    wlBtn.textContent = inList ? '♥' : '♡';
    if (inList) wlBtn.classList.add('active');

    wlBtn.addEventListener('click', function() {
      let wl = getWL();
      const exists = wl.some(i => i.id === product.id);
      if (exists) {
        wl = wl.filter(i => i.id !== product.id);
        wlBtn.textContent = '♡';
        wlBtn.classList.remove('active');
        showToast('ลบออกจากรายการโปรดแล้ว');
      } else {
        wl.push({ id: product.id, name: product.name, price: product.price, img: product.images?.[0] || '' });
        wlBtn.textContent = '♥';
        wlBtn.classList.add('active');
        showToast('❤️ เพิ่มในรายการโปรดแล้ว!');
      }
      saveWL(wl);
      wlBtn.style.transform = 'scale(1.3)';
      setTimeout(() => { wlBtn.style.transform = ''; }, 180);
    });
  }

  // Share / Copy
  document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.href).then(() => showToast('🔗 คัดลอกลิงก์แล้ว!'));
  });

  // Facebook share
  document.querySelector('.share-btn[title="Facebook"]')?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=580,height=400,noopener');
  });

  // Line share
  document.querySelector('.share-btn[title="Line"]')?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}`, '_blank', 'width=580,height=400,noopener');
  });

  // Native share button (top gallery)
  document.getElementById('shareBtn')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => showToast('🔗 คัดลอกลิงก์แล้ว!'));
    }
  });
}

/* =============================================
   INFO EVENTS
============================================= */
function bindInfoEvents(product) {
  // Qty
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; document.getElementById('qtyDisplay').textContent = currentQty; }
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    if (currentQty < product.stock) { currentQty++; document.getElementById('qtyDisplay').textContent = currentQty; }
    else showToast(`⚠️ มีสินค้าแค่ ${product.stock} ชิ้น`);
  });

  // Add to Cart
  document.getElementById('addCartBtn')?.addEventListener('click', () => {
    if (product.stock === 0) return;
    addToCart(product.id, currentQty);
  });

  // Buy Now → Checkout
  document.getElementById('buyNowBtn')?.addEventListener('click', () => {
    if (product.stock === 0) return;
    addToCart(product.id, currentQty);
    window.location.href = 'checkout.html';
  });

  // Sticky ATC
  document.getElementById('stickyAddCart')?.addEventListener('click', () => {
    addToCart(product.id, currentQty);
  });

  // Variants
  document.addEventListener('click', e => {
    const btn = e.target.closest('.variant-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const val = btn.dataset.val;
    selectedVariants[key] = val;
    document.querySelectorAll(`.variant-btn[data-key="${key}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update label
    const section = btn.closest('.variant-section');
    const label = section?.querySelector('.variant-label span');
    if (label) label.textContent = val;
  });

  // Sticky ATC on scroll
  const atcRow = document.querySelector('.atc-row');
  if (atcRow) {
    const observer = new IntersectionObserver(([entry]) => {
      const sticky = document.getElementById('stickyAtc');
      if (sticky) sticky.style.display = entry.isIntersecting ? 'none' : 'flex';
    }, { threshold: 0.5 });
    observer.observe(atcRow);
  }
}

/* =============================================
   TABS
============================================= */
function renderTabs(product) {
  // Description
  let feedingHTML = '';
  if (product.feedingGuide?.length) {
    feedingHTML = `<h4 style="margin:20px 0 10px">ปริมาณการให้อาหารแนะนำ</h4>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="background:var(--cream)">
          <th style="padding:10px;text-align:left;border-bottom:2px solid var(--border)">น้ำหนักน้อง</th>
          <th style="padding:10px;text-align:right;border-bottom:2px solid var(--border)">ปริมาณ/วัน</th>
        </tr>
        ${product.feedingGuide.map(r=>`<tr>
          <td style="padding:10px;border-bottom:1px solid var(--border)">${r.weight}</td>
          <td style="padding:10px;border-bottom:1px solid var(--border);text-align:right;font-weight:700">${r.daily}</td>
        </tr>`).join('')}
      </table>`;
  }
  document.getElementById('tab-description').innerHTML = `
    <div class="desc-grid">
      <div class="desc-text">
        <h3>เกี่ยวกับสินค้า</h3>
        <p>${product.description}</p>
        ${feedingHTML}
        <h3 style="margin-top:20px">วิธีใช้งาน</h3>
        <ul>${product.howTo.map(h=>`<li>${h}</li>`).join('')}</ul>
      </div>
      <div class="desc-highlights">
        <h4>จุดเด่นของสินค้า</h4>
        ${product.highlights.map(h=>`
          <div class="highlight-item">
            <span class="highlight-icon">${h.icon}</span>
            <div><strong>${h.title}</strong><small>${h.desc}</small></div>
          </div>`).join('')}
      </div>
    </div>`;

  // Ingredients / Nutrition
  const hasNutrition = product.nutrition?.length > 0;
  document.getElementById('tab-ingredients').innerHTML = `
    ${hasNutrition ? `
      <h3 style="margin-bottom:16px">ตารางโภชนาการ</h3>
      <table class="nutrition-table">
        <thead><tr><th>สารอาหาร</th><th style="text-align:right">ปริมาณ</th></tr></thead>
        <tbody>${product.nutrition.map(n=>`<tr><td>${n.name}</td><td>${n.value}</td></tr>`).join('')}</tbody>
      </table>` : ''}
    <h3 style="margin:${hasNutrition?'24px':'0'} 0 12px">ส่วนประกอบ / วัสดุ</h3>
    <div class="ingredients-text">${product.ingredients}</div>`;

  // How To (reuse description tab's howTo section already there)
  document.getElementById('tab-howto').innerHTML = `
    <h3 style="margin-bottom:20px">วิธีใช้งาน</h3>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${product.howTo.map((h,i)=>`
        <div style="display:flex;gap:14px;align-items:flex-start;background:var(--cream);padding:16px;border-radius:12px">
          <span style="width:28px;height:28px;background:var(--orange);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;font-weight:900;flex-shrink:0">${i+1}</span>
          <span style="font-size:15px;line-height:1.7">${h}</span>
        </div>`).join('')}
    </div>`;

  // Reviews
  renderReviewsTab(product);

  // Tabs interaction
  document.querySelectorAll('.product-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });
}

function buildReviewItemHTML(r) {
  return `
    <div class="review-item${r._user ? ' review-item--user' : ''}">
      <div class="review-item__header">
        <div class="review-avatar">${r.avatar || '😊'}</div>
        <div class="review-item__meta">
          <strong>${escHtmlProd(r.name)}</strong>
          ${r._user ? '<span class="review-user-tag">คุณ</span>' : ''}
          <small>${r.date}</small>
        </div>
        <div class="review-item__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      </div>
      <p class="review-item__text">${escHtmlProd(r.text)}</p>
      ${r.images?.length ? `<div class="review-item__img-row">${r.images.map(img=>`<img src="${img}" class="review-item__img" alt="รีวิว"/>`).join('')}</div>` : ''}
      ${!r._user ? `<div class="review-helpful">
        <span>เป็นประโยชน์ไหม?</span>
        <button class="helpful-btn">👍 ใช่ (${r.helpful || 0})</button>
        <button class="helpful-btn">👎 ไม่</button>
      </div>` : ''}
    </div>`;
}

function renderReviewsTab(product) {
  const userReviews = loadUserReviews(product.id).map(r => ({ ...r, _user: true }));
  const allReviews  = [...userReviews, ...product.reviews];
  const totalCount  = product.reviewCount + userReviews.length;

  /* recalculate avg from userReviews + static */
  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : product.rating;

  /* rating distribution */
  const dist = { ...product.ratingDist };
  userReviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
  const total = Object.values(dist).reduce((a,b) => a + b, 0);
  const bars = [5,4,3,2,1].map(star => {
    const pct = Math.round((dist[star] || 0) / total * 100);
    return `<div class="rating-bar-row">
      <span>${star}</span>
      <div class="rating-bar-bg"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
      <span>${dist[star] || 0}</span>
    </div>`;
  }).join('');

  document.getElementById('reviewCount').textContent = totalCount;

  /* pre-fill reviewer name from logged-in user */
  let savedName = '';
  try {
    const u = JSON.parse(localStorage.getItem('ruby_user') || 'null');
    if (u?.name) savedName = u.name;
  } catch { }

  document.getElementById('tab-reviews').innerHTML = `
    <div class="reviews-summary">
      <div class="rating-big">
        <div class="rating-big__num">${avgRating}</div>
        <div class="rating-big__stars">${'★'.repeat(Math.round(avgRating))}</div>
        <div class="rating-big__total">${totalCount} รีวิว</div>
      </div>
      <div class="rating-bars">${bars}</div>
    </div>

    <!-- Write Review Form -->
    <div class="write-review-wrap" id="writeReviewWrap">
      <div class="write-review-header">
        <h4>✍️ เขียนรีวิว</h4>
        <button class="wr-toggle-btn" id="wrToggleBtn">+ เขียนรีวิว</button>
      </div>
      <form class="write-review-form" id="writeReviewForm" style="display:none">
        <div class="wr-star-row">
          <span class="wr-label">คะแนน <span class="req">*</span></span>
          <div class="wr-stars" id="wrStars">
            <button type="button" class="wr-star" data-val="1">★</button>
            <button type="button" class="wr-star" data-val="2">★</button>
            <button type="button" class="wr-star" data-val="3">★</button>
            <button type="button" class="wr-star" data-val="4">★</button>
            <button type="button" class="wr-star" data-val="5">★</button>
          </div>
          <span class="wr-star-label" id="wrStarLabel">แตะเพื่อให้คะแนน</span>
        </div>
        <span class="wr-field-err" id="err-wrStars"></span>

        <div class="wr-field">
          <label>ชื่อผู้รีวิว <span class="req">*</span></label>
          <input type="text" id="wrName" placeholder="ชื่อของคุณ" maxlength="60" value="${escHtmlProd(savedName)}"/>
          <span class="wr-field-err" id="err-wrName"></span>
        </div>

        <div class="wr-field">
          <label>รีวิวสินค้า <span class="req">*</span></label>
          <textarea id="wrText" rows="4" placeholder="บอกเราว่าน้องของคุณชอบสินค้านี้แค่ไหน..." maxlength="500"></textarea>
          <div class="wr-char-count"><span id="wrCharCount">0</span>/500</div>
          <span class="wr-field-err" id="err-wrText"></span>
        </div>

        <div class="wr-actions">
          <button type="submit" class="btn btn-primary wr-submit-btn">📝 ส่งรีวิว</button>
          <button type="button" class="btn btn-outline wr-cancel-btn" id="wrCancelBtn">ยกเลิก</button>
        </div>
      </form>
    </div>

    <div class="reviews-list" id="reviewsList">${allReviews.map(buildReviewItemHTML).join('')}</div>`;

  initWriteReviewForm(product);
}

const STAR_LABELS = ['', 'แย่มาก', 'ไม่ดี', 'พอใช้', 'ดี', 'ดีมาก'];
let selectedRating = 0;

function initWriteReviewForm(product) {
  const toggleBtn = document.getElementById('wrToggleBtn');
  const form      = document.getElementById('writeReviewForm');
  const cancelBtn = document.getElementById('wrCancelBtn');
  const stars     = document.querySelectorAll('.wr-star');
  const starLabel = document.getElementById('wrStarLabel');
  const textarea  = document.getElementById('wrText');
  const charCount = document.getElementById('wrCharCount');

  selectedRating = 0;

  /* toggle form */
  toggleBtn?.addEventListener('click', () => {
    const open = form.style.display === 'none';
    form.style.display = open ? 'block' : 'none';
    toggleBtn.textContent = open ? '✕ ปิด' : '+ เขียนรีวิว';
    if (open) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  cancelBtn?.addEventListener('click', () => {
    form.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = '+ เขียนรีวิว';
  });

  /* star picker */
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => highlightStars(+star.dataset.val));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = +star.dataset.val;
      highlightStars(selectedRating);
      if (starLabel) starLabel.textContent = STAR_LABELS[selectedRating];
      const errEl = document.getElementById('err-wrStars');
      if (errEl) errEl.textContent = '';
    });
  });

  /* char counter */
  textarea?.addEventListener('input', () => {
    if (charCount) charCount.textContent = textarea.value.length;
  });

  /* submit */
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateReviewForm()) return;

    const name = document.getElementById('wrName').value.trim();
    const text = textarea.value.trim();
    const now  = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' });

    const review = {
      name,
      avatar: '😊',
      rating: selectedRating,
      date: dateStr,
      text,
      helpful: 0,
    };

    saveUserReview(product.id, review);
    showToastProd('ขอบคุณสำหรับรีวิวค่ะ! ✅');

    /* re-render the whole reviews tab */
    renderReviewsTab(product);

    /* open the reviews tab if not active */
    document.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.product-tab[data-tab="reviews"]')?.classList.add('active');
    document.getElementById('tab-reviews')?.classList.add('active');
  });
}

function highlightStars(count) {
  document.querySelectorAll('.wr-star').forEach((s, i) => {
    s.classList.toggle('active', i < count);
  });
}

function validateReviewForm() {
  let ok = true;
  const set = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg; };

  if (!selectedRating) { set('err-wrStars', 'กรุณาเลือกคะแนน'); ok = false; }
  else set('err-wrStars', '');

  const name = document.getElementById('wrName')?.value.trim();
  if (!name) { set('err-wrName', 'กรุณากรอกชื่อ'); ok = false; }
  else set('err-wrName', '');

  const text = document.getElementById('wrText')?.value.trim();
  if (!text || text.length < 10) { set('err-wrText', 'กรุณากรอกรีวิวอย่างน้อย 10 ตัวอักษร'); ok = false; }
  else set('err-wrText', '');

  return ok;
}

function escHtmlProd(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToastProd(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function goToReviews() {
  document.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.product-tab[data-tab="reviews"]')?.classList.add('active');
  document.getElementById('tab-reviews')?.classList.add('active');
  document.getElementById('tab-reviews')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.goToReviews = goToReviews;

/* =============================================
   RELATED PRODUCTS
============================================= */
function renderRelated(product) {
  const grid = document.getElementById('relatedGrid');
  if (!grid || !product.related) return;
  grid.innerHTML = product.related.map(id => {
    const p = PRODUCTS_DB[id];
    if (!p) return '';
    return `<div class="product-card">
      <div class="product-card__img-wrap">
        <a href="product.html?id=${p.id}">
          <img src="${p.images[0]}" alt="${p.name}"/>
        </a>
        ${p.badge ? `<span class="badge badge--${p.badge}">${p.badge==='hot'?'ขายดี':p.badge==='new'?'ใหม่':'ลด'}</span>` : ''}
        <button class="btn-wishlist" aria-label="บันทึก">♡</button>
      </div>
      <div class="product-card__body">
        <span class="product-card__brand">${p.brand}</span>
        <h3 class="product-card__name"><a href="product.html?id=${p.id}" style="color:inherit">${p.name}</a></h3>
        <div class="product-card__rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating))}</span>
          <span class="rating-count">(${p.reviewCount})</span>
        </div>
        <div class="product-card__price-row">
          <span class="price">฿ ${p.price.toLocaleString()}</span>
          ${p.originalPrice ? `<span class="price-original">฿ ${p.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-block" onclick="addToCart('${p.id}',1)">🛒 หยิบใส่ตะกร้า</button>
      </div>
    </div>`;
  }).join('');
}
window.addToCart = addToCart;

/* =============================================
   RECENTLY VIEWED
============================================= */
const RECENTLY_KEY = 'ruby_recent_viewed';
const RECENTLY_MAX = 6;

function saveRecentlyViewed(product) {
  try {
    let list = JSON.parse(localStorage.getItem(RECENTLY_KEY) || '[]');
    list = list.filter(i => i.id !== product.id);
    list.unshift({
      id:    product.id,
      name:  product.name,
      price: product.price,
      img:   product.images?.[0] || '',
      rating: product.rating,
    });
    list = list.slice(0, RECENTLY_MAX);
    localStorage.setItem(RECENTLY_KEY, JSON.stringify(list));
  } catch { }
}

function renderRecentlyViewed(currentId) {
  const section = document.getElementById('recentlyViewedSection');
  const strip   = document.getElementById('recentlyViewedStrip');
  if (!section || !strip) return;

  try {
    const list = JSON.parse(localStorage.getItem(RECENTLY_KEY) || '[]')
      .filter(i => i.id !== currentId);
    if (list.length === 0) return;

    strip.innerHTML = list.map(item => `
      <a href="product.html?id=${item.id}" class="rv-card">
        <div class="rv-card__img">
          <img src="${escHtmlProd(item.img)}" alt="${escHtmlProd(item.name)}" loading="lazy"/>
        </div>
        <div class="rv-card__body">
          <div class="rv-card__name">${escHtmlProd(item.name)}</div>
          <div class="rv-card__price">฿ ${(item.price||0).toLocaleString()}</div>
          ${item.rating ? `<div class="rv-card__stars">${'★'.repeat(Math.round(item.rating))}</div>` : ''}
        </div>
      </a>`).join('');

    section.style.display = '';
  } catch { }
}

/* =============================================
   NAVBAR SCROLL
============================================= */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
});

/* =============================================
   INIT
============================================= */
updateCartCount();
document.getElementById('cartBtn')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

const pid = getProductId();
const product = PRODUCTS_DB[pid];
if (product) {
  setTimeout(() => renderProduct(product), 400); // brief skeleton
} else {
  document.getElementById('productLayout').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--muted)">
      <div style="font-size:64px;margin-bottom:16px">😔</div>
      <h2>ไม่พบสินค้านี้</h2>
      <p style="margin:12px 0 24px">สินค้าอาจถูกลบหรือ URL ไม่ถูกต้อง</p>
      <a href="index.html" class="btn btn-primary">← กลับหน้าร้าน</a>
    </div>`;
}
