
const SUPABASE_URL='https://kaqxywhjukhtggmwzfha.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_WyXfTedEJbMifVW-l-TvSg_IRaQKuuv';
const SUPABASE_PRODUCT_TABLE='sangkidal_products';
const SUPABASE_SETTINGS_TABLE='sangkidal_settings';
const SUPABASE_IMAGE_BUCKET='sangkidal-product-images';
const supabaseClient=(window.supabase&&SUPABASE_URL.startsWith('http'))?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
const DEFAULT_STORE_SETTINGS={
  wa:'6285806183305',
  title:'Sangkidal Works Store',
  subtitle:'Biar nggak bingung, harga kami tampilkan dari awal. Pilih wardrobe, lemari, atau custom furniture yang paling cocok untuk ruangmu.',
  repeatOrderTitle:'Sudah pernah pesan di Sangkidal? 👋',
  repeatOrderText:'Kalau mau tambah wardrobe, lemari, kabinet, atau menyamakan model untuk ruangan lain, tinggal hubungi kami lagi ya kak. Kami bisa bantu cek pesanan sebelumnya supaya hasil barunya tetap nyambung.',
  repeatOrderMessage:'Halo Sangkidal Works, aku pernah order sebelumnya dan mau tambah furniture/wardrobe lagi. Boleh dibantu cek dan rekomendasikan yang paling cocok ya kak?',
  chatMessage:'Halo Sangkidal Works, aku mau tanya soal wardrobe atau custom furniture ya.',
  promo:{name:'Promo Kemerdekaan',start:'2026-08-01',end:'2026-08-30',label:'Harga spesial untuk produk pilihan.'}
};
let storeSettings=loadAdminSettings();
let WA=normalizeWaNumber(storeSettings.wa);

let products={
metal:{title:'Metal Wardrobe 01 — Lemari Besi 2 Pintu Perforated',price:1700000,old:2190000,img:'assets/product-1.jpg',type:'ready',rating:'4.9 (18 ulasan)',sold:'23 terjual',time:'Siap dikirim 1–3 hari',status:'READY STOCK',stock:8,size:'80 × 45 × 175 cm',system:'Ready Stock',variants:['Navy × Red','Full Black','Grey × Orange'],desc:'Lemari compact yang kita produksi partai supaya harganya tetap ringan. Harga promo ini berlaku untuk ukuran dan konfigurasi yang tampil. Kalau kamu masih ragu soal ukuran atau warna, chat kami dulu ya kak—biar kami bantu pilih yang paling aman.'},
console:{title:'Low Cabinet 01 — Kabinet Compact',price:1490000,old:1890000,img:'assets/product-2.jpg',type:'ready',rating:'4.8 (12 ulasan)',sold:'17 terjual',time:'Siap dikirim 1–3 hari',status:'READY STOCK',stock:5,size:'120 × 40 × 70 cm',system:'Ready Stock',variants:['Grey × Orange','Full Grey'],desc:'Kabinet rendah untuk ruang kerja, kamar, atau area TV. Produk batch dengan ukuran standar dan harga tetap. Kalau cocok, tinggal pesan. Kalau belum yakin, kami bantu cek dulu kebutuhan ruangnya.'},
tall:{title:'Daily Wardrobe 02 — Lemari 2 Pintu Minimalis',price:1990000,old:2490000,img:'assets/product-3.jpg',type:'ready',rating:'4.9 (9 ulasan)',sold:'14 terjual',time:'Siap dikirim 2–4 hari',status:'READY STOCK',stock:6,size:'90 × 50 × 190 cm',system:'Ready Stock',variants:['Warm White','Greige','Soft Grey'],desc:'Model minimalis yang aman masuk ke banyak interior. Harga ini untuk ukuran standar yang ditampilkan. Kalau kamu bingung pilih warna, kami bisa bantu rekomendasikan yang paling aman untuk ruanganmu.'},
walkin:{title:'Walk-in Wardrobe 01 — Full Custom Configuration',price:12900000,old:15900000,img:'assets/product-4.jpg',type:'po custom',rating:'5.0 (7 ulasan)',sold:'12 project selesai',time:'Pre-order ±21–30 hari kerja',status:'PRE-ORDER',stock:99,size:'Konfigurasi contoh ± 300 × 220 cm',system:'Pre-order',variants:['Konfigurasi Foto','Custom Warna','Custom Material'],desc:'Harga yang tampil adalah harga FIX untuk konfigurasi contoh dengan ukuran yang dicantumkan. Kalau ukuran ruang atau komposisi modul berubah, kita hitung harga baru sebelum produksi. Jadi kamu tetap tahu angkanya dulu sebelum lanjut.'},
open:{title:'Open Wardrobe 01 — Open Storage System',price:7900000,old:9500000,img:'assets/product-5.jpg',type:'po custom',rating:'4.9 (5 ulasan)',sold:'8 project selesai',time:'Pre-order ±14–25 hari kerja',status:'PRE-ORDER',stock:99,size:'Konfigurasi contoh ± 240 × 60 × 240 cm',system:'Pre-order',variants:['Konfigurasi Foto','Custom Ukuran','Custom Warna'],desc:'Harga yang tampil adalah harga FIX untuk konfigurasi contoh. Kalau ukuran atau jumlah modul berubah, kita sesuaikan dulu sebelum order dikunci. Biar nggak ada kejutan biaya di belakang.'}
};

const DEFAULT_PRODUCTS=JSON.parse(JSON.stringify(products));
products=loadAdminProducts();

let currentKey=Object.keys(products)[0] || 'metal',currentVariant='',count=1;
let cart = JSON.parse(localStorage.getItem('sangkidalCart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('sangkidalWishlist') || '[]');
let adminSelectedKey=currentKey;
let adminUser=null;
let adminUploadPromise=null;

function loadAdminSettings(){
 return {...DEFAULT_STORE_SETTINGS,promo:{...DEFAULT_STORE_SETTINGS.promo}};
}
function loadAdminProducts(){
 return products;
}
async function loadSupabaseData(){
 if(!supabaseClient){toast('Supabase belum dikonfigurasi');return;}
 const [{data:productRows,error:productError},{data:settingRow,error:settingError}]=await Promise.all([
  supabaseClient.from(SUPABASE_PRODUCT_TABLE).select('key,data').order('sort_order',{ascending:true}),
  supabaseClient.from(SUPABASE_SETTINGS_TABLE).select('data').eq('id','store').maybeSingle()
 ]);
 if(productError){toast('Produk Supabase belum bisa dibaca');console.error(productError);}
 if(settingError){toast('Pengaturan Supabase belum bisa dibaca');console.error(settingError);}
 if(productRows&&productRows.length){
  products={};
  productRows.forEach(row=>{products[row.key]=safeProduct(row.data||{});});
  currentKey=products[currentKey]?currentKey:Object.keys(products)[0];
  adminSelectedKey=products[adminSelectedKey]?adminSelectedKey:currentKey;
  renderCards();
 }
 if(settingRow&&settingRow.data){
  storeSettings={...DEFAULT_STORE_SETTINGS,...settingRow.data,promo:{...DEFAULT_STORE_SETTINGS.promo,...(settingRow.data.promo||{})}};
  WA=normalizeWaNumber(storeSettings.wa); STORE_PROMO=storeSettings.promo; applyStoreSettings(); updateEventBanner();
 }
}
async function persistProducts(){
 if(!supabaseClient) return toast('Supabase belum dikonfigurasi');
 const prepared=await Promise.all(Object.entries(products).map(async ([key,data],index)=>[key,await prepareProductForSupabase(key,data),index]));
 prepared.forEach(([key,data])=>{products[key]=data;});
 const rows=prepared.map(([key,data,index])=>({key,data,sort_order:index,updated_at:new Date().toISOString()}));
 const {error}=await supabaseClient.from(SUPABASE_PRODUCT_TABLE).upsert(rows,{onConflict:'key'});
 if(error){console.error(error);toast('Produk gagal disimpan ke Supabase');return false;}
 return true;
}
async function persistSettings(){
 if(!supabaseClient) return toast('Supabase belum dikonfigurasi');
 WA=normalizeWaNumber(storeSettings.wa); STORE_PROMO=storeSettings.promo; applyStoreSettings(); updateEventBanner();
 const {error}=await supabaseClient.from(SUPABASE_SETTINGS_TABLE).upsert({id:'store',data:storeSettings,updated_at:new Date().toISOString()},{onConflict:'id'});
 if(error){console.error(error);toast('Pengaturan gagal disimpan ke Supabase');return false;}
 return true;
}
function applyStoreSettings(){
 const title=document.getElementById('storeTitle'), subtitle=document.getElementById('storeSubtitle'), repeatTitle=document.getElementById('repeatTitle'), repeatText=document.getElementById('repeatText');
 if(title) title.textContent=storeSettings.title;
 if(subtitle) subtitle.textContent=storeSettings.subtitle;
 if(repeatTitle) repeatTitle.textContent=storeSettings.repeatOrderTitle;
 if(repeatText) repeatText.textContent=storeSettings.repeatOrderText;
}
function safeProduct(p){
 const images=Array.isArray(p.images)&&p.images.length?p.images.filter(Boolean):(p.img?[p.img]:[]);
 return {...p,img:p.img||images[0]||'',images,price:Number(p.price)||0,old:Number(p.old)||Number(p.price)||0,stock:Number(p.stock)||0,variants:Array.isArray(p.variants)&&p.variants.length?p.variants:['Default']};
}

function saveCart(){ localStorage.setItem('sangkidalCart', JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge(){
 const total=cart.reduce((s,i)=>s+i.qty,0), b=document.getElementById('cartBadge');
 if(!b) return; b.textContent=total; b.style.display=total>0?'grid':'none';
}
function cartKey(item){ return item.key+'__'+item.variant; }
function addCurrentToCart(){
 const p=safeProduct(products[currentKey]), key=currentKey+'__'+currentVariant;
 if(p.status==='READY STOCK' && p.stock<1) return toast('Stok produk ini sedang habis');
 const found=cart.find(i=>cartKey(i)===key);
 if(found) found.qty=Math.min(found.qty+count, p.status==='READY STOCK'?p.stock:10);
 else cart.push({key:currentKey,variant:currentVariant,qty:count});
 saveCart(); toast('Sudah masuk keranjang ya kak ✓');
}
function openCart(){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('show'));
 document.getElementById('cartView').classList.add('show');
 renderCart(); updateWishBtn(); window.scrollTo(0,0);
}
function closeCart(){
 document.getElementById('cartView').classList.remove('show');
 document.getElementById('listing').classList.add('show');
 window.scrollTo(0,0);
}
function renderCart(){
 const list=document.getElementById('cartList'), summary=document.getElementById('cartSummary');
 if(!cart.length){ list.innerHTML='<div class="cartEmpty"><div class="big">🛒</div><b>Keranjangnya masih kosong nih</b><div class="mini" style="margin-top:7px">Kalau ada yang kamu suka, simpan dulu di sini ya kak. Nanti bisa dicek lagi kapan saja.</div></div>'; summary.style.display='none'; updateCartBadge(); return; }
 summary.style.display='block'; list.innerHTML=''; let total=0, n=0;
 cart.forEach((it,idx)=>{
  const p=products[it.key]; if(!p) return; total+=p.price*it.qty; n+=it.qty;
  const el=document.createElement('div'); el.className='cartItem';
  el.innerHTML=`<img src="${safeSrc(p.img)}" alt="${escapeHTML(p.title)}"><div><div class="cartItemTitle">${escapeHTML(p.title)}</div><div class="cartItemVar">Varian: ${escapeHTML(it.variant)}</div><div class="cartItemPrice">${rupiah(p.price)}</div><div class="cartActions"><button class="removeBtn" onclick="removeCart(${idx})">Hapus</button><div class="cartQty"><button onclick="cartQty(${idx},-1)">−</button><span>${it.qty}</span><button onclick="cartQty(${idx},1)">+</button></div></div></div>`;
  list.appendChild(el);
 });
 document.getElementById('cartTotal').textContent=rupiah(total);
 document.getElementById('cartCountText').textContent=n+' barang';
 updateCartBadge();
}
function cartQty(idx,d){
 const it=cart[idx],p=safeProduct(products[it.key]); if(!products[it.key]){cart.splice(idx,1);saveCart();return renderCart();} const max=p.status==='READY STOCK'?Math.max(1,p.stock):10;
 it.qty=Math.max(1,Math.min(max,it.qty+d)); saveCart(); renderCart();
}
function removeCart(idx){ cart.splice(idx,1); saveCart(); renderCart(); toast('Sudah kami hapus dari keranjang'); }
function checkoutCart(){
 if(!cart.length) return toast('Keranjangnya masih kosong nih kak');
 let total=0;
 const lines=cart.filter(it=>products[it.key]).map((it,i)=>{const p=safeProduct(products[it.key]); total+=p.price*it.qty; return `${i+1}. ${p.title}\n   Varian: ${it.variant}\n   ${it.qty} × ${rupiah(p.price)} = ${rupiah(p.price*it.qty)}`});
 if(!lines.length) return toast('Produk di keranjang perlu dipilih ulang');
 openWA(`Halo Sangkidal Works, aku mau checkout isi keranjang ini ya kak:\n\n${lines.join('\n\n')}\n\nTotal produk: ${rupiah(total)}\nOngkir belum termasuk. Boleh dibantu cek ongkir dan lanjutkan order ya kak?\n\nLink toko: ${location.href.split('#')[0]}`);
}
function toggleWish(){
 const ix=wishlist.indexOf(currentKey);
 if(ix>=0){wishlist.splice(ix,1);toast('Sudah dihapus dari favorit');}
 else {wishlist.push(currentKey);toast('Sudah kami simpan ke favorit kamu ♥');}
 localStorage.setItem('sangkidalWishlist',JSON.stringify(wishlist)); updateWishBtn();
}
function updateWishBtn(){
 const b=document.getElementById('wishBtn'); if(!b)return;
 const on=wishlist.includes(currentKey); b.textContent=on?'♥':'♡'; b.classList.toggle('wishActive',on);
}
function goHome(){ if(document.getElementById('detail').classList.contains('show')) backToListing(); else window.scrollTo({top:0,behavior:'smooth'}); }
function openShareMenu(){document.getElementById('shareSheet').classList.add('show')}
function closeShareMenu(){document.getElementById('shareSheet').classList.remove('show')}
function copyCurrentLink(){
 const txt=location.href.split('#')[0]+(document.getElementById('detail').classList.contains('show')?'#product='+currentKey:'');
 navigator.clipboard?.writeText(txt).then(()=>toast('Link sudah disalin ya kak ✓')).catch(()=>toast('Link siap dibagikan'));
 closeShareMenu();
}
function shareCurrent(){
 const p=products[currentKey];
 if(navigator.share && document.getElementById('detail').classList.contains('show')) navigator.share({title:p.title,text:`${p.title} — ${rupiah(p.price)}`,url:location.href}).catch(()=>{});
 else copyCurrentLink();
}
function openFilterSheet(){document.getElementById('filterSheet').classList.add('show')}
function applyAdvancedFilter(){
 const ready=document.getElementById('fReady').checked, pre=document.getElementById('fPre').checked, custom=document.getElementById('fCustom').checked;
 document.querySelectorAll('#productGrid .card').forEach(c=>{
  const t=c.dataset.type; const noChoice=!ready&&!pre&&!custom;
  c.style.display=(noChoice||(ready&&t.includes('ready'))||(pre&&t.includes('po'))||(custom&&t.includes('custom')))?'block':'none';
 });
 document.getElementById('filterSheet').classList.remove('show'); toast('Sip, pilihannya sudah kami rapikan 😊');
}
function setTopTab(mode,el){
 document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active')); el.classList.add('active');
 const grid=document.getElementById('productGrid');
 if(mode==='custom'){ document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display=c.dataset.type.includes('custom')?'block':'none'); return; }
 document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display='block');
 const entries=Object.entries(products);
 let keys=entries.map(([k])=>k);
 if(mode==='popular') keys.sort((a,b)=>parseInt(products[b].sold)-parseInt(products[a].sold));
 if(mode==='rating') keys.sort((a,b)=>parseFloat(products[b].rating)-parseFloat(products[a].rating));
 if(mode==='price') keys.sort((a,b)=>products[a].price-products[b].price);
 if(mode==='related') keys=Object.keys(products);
 keys.forEach(k=>{const c=grid.querySelector(`[data-key="${k}"]`); if(c) grid.appendChild(c);});
}

function rupiah(n){return 'Rp'+(Number(n)||0).toLocaleString('id-ID')}
function numberOnly(value){return String(value||'').replace(/\D/g,'')}
function normalizeWaNumber(value){
 const digits=numberOnly(value);
 if(!digits) return DEFAULT_STORE_SETTINGS.wa;
 if(digits.startsWith('0')) return '62'+digits.slice(1);
 if(digits.startsWith('8')) return '62'+digits;
 return digits;
}
function escapeHTML(value){
 return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function safeSrc(value){
 const src=String(value||'').trim();
 if(src.startsWith('data:image/')||src.startsWith('https://')||src.startsWith('http://')||src.startsWith('PRODUK ETALASE/')||src.startsWith('assets/')) return escapeHTML(src);
 return '';
}
function formatDateID(value){
 const d=new Date(value+'T00:00:00');
 if(Number.isNaN(d.getTime())) return '';
 return d.toLocaleDateString('id-ID',{day:'numeric',month:'long'});
}
function promoRangeText(promo){
 const start=formatDateID(promo.start), end=formatDateID(promo.end);
 return start&&end?`${start}–${end}`:'Periode promo';
}
function formatMoneyValue(value){const digits=numberOnly(value);return digits?Number(digits).toLocaleString('id-ID'):''}
function parseMoney(value){return Number(numberOnly(value))||0}
function formatMoneyInput(input){input.value=formatMoneyValue(input.value)}
function discPct(p){return p.old&&p.old>p.price?Math.round((1-p.price/p.old)*100):0}
function openWA(msg){window.open(`https://wa.me/${normalizeWaNumber(WA)}?text=${encodeURIComponent(msg)}`,'_blank','noopener')}

function renderCards(){
 const grid=document.getElementById('productGrid');grid.innerHTML='';
 Object.entries(products).forEach(([k,p])=>{
  p=safeProduct(p);
  const card=document.createElement('article');card.className='card';card.dataset.type=p.type;card.dataset.key=k;card.dataset.search=(p.title+' '+p.status+' '+p.system).toLowerCase();card.style.cursor='pointer';card.onclick=()=>openProduct(k);
  card.innerHTML=`<div class="thumb"><img src="${safeSrc(p.img)}" alt="${escapeHTML(p.title)}" loading="lazy" decoding="async"><span class="storetag">SANGKIDAL</span><span class="mediaWatermark">SANGKIDAL</span><span class="status ${p.status==='READY STOCK'?'ready':'po'}">${p.status==='READY STOCK'?'READY':'PRE-ORDER'}</span></div>
  <div class="cbody"><div class="seller">${p.status==='READY STOCK'?'Sangkidal Works':'Sangkidal Custom'}</div><div class="ctitle">${escapeHTML(p.title)}</div>
  <div class="price">${rupiah(p.price)}</div><div class="discountline"><span class="oldprice">${rupiah(p.old)}</span><span class="disc">${discPct(p)}% OFF</span></div>
  <div class="mini">${p.status==='READY STOCK'?'Stok '+p.stock:'Harga fix konfigurasi foto'}</div><div class="stars"><span class="s">★</span> ${escapeHTML(String(p.rating).split(' ')[0])} • ${escapeHTML(p.sold)}</div>
  <span class="${p.status==='READY STOCK'?'free':'poLabel'}">${p.status==='READY STOCK'?'Siap dikirim':escapeHTML(p.time)}</span>
  <button class="main" onclick="event.stopPropagation();openProduct('${k}')">Lihat detail</button></div>`;
  grid.appendChild(card);
 });
}
renderCards();

let currentGalleryIndex=0;
let galleryTouchStartX=0;
let galleryTouchStartY=0;

function getGalleryImages(product){
 const p=product||safeProduct(products[currentKey]);
 const images=Array.isArray(p.images)&&p.images.length?p.images.filter(Boolean):(p.img?[p.img]:[]);
 return images.length?images:[p.img].filter(Boolean);
}

function preloadGalleryImages(images){
 if(!Array.isArray(images)||!images.length) return;
 const next=images[(currentGalleryIndex+1)%images.length];
 if(!next||images.length<2) return;
 const loadNext=()=>{
  const img=new Image();
  img.decoding='async';
  img.src=next;
 };
 if('requestIdleCallback' in window) requestIdleCallback(loadNext,{timeout:1200});
 else setTimeout(loadNext,300);
}

function openImageDetail(){
 const p=safeProduct(products[currentKey]);
 const images=getGalleryImages(p);
 if(!images.length) return;
 const lightbox=document.getElementById('imageLightbox');
 const img=document.getElementById('lightboxImg');
 const count=document.getElementById('lightboxCount');
 if(!lightbox||!img||!count) return;
 img.src=images[currentGalleryIndex]||p.img;
 img.alt=escapeHTML(p.title||'Foto produk');
 count.textContent=`${currentGalleryIndex+1}/${images.length}`;
 lightbox.classList.add('show');
 document.body.style.overflow='hidden';
}

function closeImageDetail(){
 const lightbox=document.getElementById('imageLightbox');
 if(!lightbox) return;
 lightbox.classList.remove('show');
 document.body.style.overflow='';
}

function moveGalleryImage(step,product){
 const p=product||safeProduct(products[currentKey]);
 const images=getGalleryImages(p);
 if(!images.length) return;
 currentGalleryIndex=(currentGalleryIndex+step+images.length)%images.length;
 selectGalleryImage(currentGalleryIndex,p);
 const lightbox=document.getElementById('imageLightbox');
 if(lightbox&&lightbox.classList.contains('show')){
  const img=document.getElementById('lightboxImg');
  const count=document.getElementById('lightboxCount');
  if(img){ img.src=images[currentGalleryIndex]||p.img; img.alt=p.title||'Foto produk'; }
  if(count) count.textContent=`${currentGalleryIndex+1}/${images.length}`;
 }
}

function openProduct(k){
 if(!products[k]) return toast('Produk tidak ditemukan');
 currentKey=k;count=1;const p=safeProduct(products[k]);
 if(location.hash!==`#product=${k}`) history.replaceState(null,'',location.pathname+location.search+`#product=${k}`);
 document.getElementById('listing').classList.remove('show');document.getElementById('detail').classList.add('show');
 document.getElementById('barTitle').textContent=p.title;selectGalleryImage(0,p);
 document.getElementById('detailPrice').textContent=rupiah(p.price);document.getElementById('detailOld').textContent=rupiah(p.old);document.getElementById('detailDisc').textContent=discPct(p)+'% OFF';
 document.getElementById('detailTitle').textContent=p.title;document.getElementById('detailRating').textContent=p.rating;document.getElementById('detailSold').textContent=p.sold;
 document.getElementById('detailTime').textContent=p.time;document.getElementById('statusPill').textContent=p.status;
 document.getElementById('stockText').textContent=p.status==='READY STOCK'?'Stok tersisa '+p.stock:'Dibuat setelah pesanan masuk';
 document.getElementById('buySystem').textContent=p.system;document.getElementById('detailSize').textContent=p.size;document.getElementById('detailDesc').textContent=p.desc;
 document.getElementById('qty').textContent=1;document.getElementById('flashText').textContent=p.status==='READY STOCK'?'stok tersisa '+p.stock:'slot produksi terbatas';
 const v=document.getElementById('variants');v.innerHTML='';currentVariant=p.variants[0];
 p.variants.forEach((x,i)=>{const b=document.createElement('button');b.className='variant'+(i===0?' active':'');b.textContent=x;b.onclick=()=>{document.querySelectorAll('.variant').forEach(e=>e.classList.remove('active'));b.classList.add('active');currentVariant=x};v.appendChild(b)});
 const rec=document.getElementById('recgrid');rec.innerHTML='';
 Object.entries(products).filter(([rk])=>rk!==k).slice(0,3).forEach(([rk,rp])=>{rp=safeProduct(rp);const d=document.createElement('div');d.className='card';d.onclick=()=>openProduct(rk);d.innerHTML=`<div class="thumb"><img src="${safeSrc(rp.img)}" alt="${escapeHTML(rp.title)}"></div><div class="cbody"><div class="ctitle">${escapeHTML(rp.title)}</div><div class="price">${rupiah(rp.price)}</div><div class="oldprice">${rupiah(rp.old)}</div></div>`;rec.appendChild(d)});
 window.scrollTo(0,0);
}
function selectGalleryImage(index,product){
 const p=product||safeProduct(products[currentKey]);
 const images=getGalleryImages(p);
 const hero=document.getElementById('heroImg');
 if(!hero) return;
 currentGalleryIndex=images.length?((index%images.length)+images.length)%images.length:0;
 hero.loading='eager';
 hero.decoding='async';
 hero.src=images[currentGalleryIndex]||p.img;
 hero.alt=p.title||'Foto produk';
 hero.style.cursor=images.length>1?'pointer':'default';
 hero.onclick=openImageDetail;
 hero.ontouchstart=e=>{const touch=e.touches[0];galleryTouchStartX=touch.clientX;galleryTouchStartY=touch.clientY;};
 hero.ontouchend=e=>{const touch=e.changedTouches[0];const dx=touch.clientX-galleryTouchStartX;const dy=touch.clientY-galleryTouchStartY;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>30){moveGalleryImage(dx<0?1:-1,p);} else if(Math.abs(dx)<8&&Math.abs(dy)<8){openImageDetail();}};
 hero.onload=()=>preloadGalleryImages(images);
 const dots=document.getElementById('galleryDots');
 if(!dots) return;
 dots.innerHTML='';
 images.forEach((img,i)=>{
  const dot=document.createElement('button');
  dot.className='dot'+(i===currentGalleryIndex?' active':'');
  dot.setAttribute('aria-label','Foto '+(i+1));
  dot.onclick=()=>selectGalleryImage(i,p);
  dots.appendChild(dot);
 });
}
function backToListing(){if(location.hash.startsWith('#product=')) history.replaceState(null,'',location.pathname+location.search);document.getElementById('detail').classList.remove('show');document.getElementById('listing').classList.add('show');window.scrollTo(0,0)}
function qty(d){const p=safeProduct(products[currentKey]);count=Math.max(1,Math.min(p.status==='READY STOCK'?p.stock:10,count+d));document.getElementById('qty').textContent=count}
function chatCurrent(){const p=safeProduct(products[currentKey]);openWA(`Halo Sangkidal Works, aku lagi lihat ${p.title}. Harga promo ${rupiah(p.price)}, varian ${currentVariant}. Aku mau tanya dulu ya.\n\nLink produk: ${location.href.split('#')[0]}#product=${currentKey}`)}
function openCheckout(){const p=safeProduct(products[currentKey]);document.getElementById('coImg').src=p.img;document.getElementById('coTitle').textContent=p.title;document.getElementById('coVariant').textContent='Varian: '+currentVariant;document.getElementById('coPrice').textContent=rupiah(p.price);document.getElementById('coQty').textContent=count+' barang';document.getElementById('coTotal').textContent=rupiah(p.price*count);document.getElementById('checkout').classList.add('show')}
function checkoutWA(){const p=safeProduct(products[currentKey]);openWA(`Halo Sangkidal Works, aku mau pesan ${p.title}.\nVarian: ${currentVariant}\nJumlah: ${count}\nHarga promo: ${rupiah(p.price)}\nHarga normal: ${rupiah(p.old)}\n\nBoleh dibantu lanjut checkout dan cek ongkirnya ya kak?\n\nLink produk: ${location.href.split('#')[0]}#product=${currentKey}`)}
document.getElementById('checkout').onclick=e=>{if(e.target.id==='checkout')e.currentTarget.classList.remove('show')}
document.getElementById('imageLightbox').addEventListener('click',e=>{if(e.target.id==='imageLightbox') closeImageDetail();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeImageDetail();} if(e.key==='ArrowRight'){moveGalleryImage(1);} if(e.key==='ArrowLeft'){moveGalleryImage(-1);}});
function filter(t,el){document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));el.classList.add('active');document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display=(t==='all'||c.dataset.type.includes(t))?'block':'none')}
function filterMobile(t){document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display=c.dataset.type.includes(t)?'block':'none');window.scrollTo({top:110,behavior:'smooth'})}
function doSearch(){const q=document.getElementById('search').value.toLowerCase();document.querySelectorAll('#productGrid .card').forEach(c=>c.style.display=(!q||c.dataset.search.includes(q))?'block':'none')}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',1800)}

function adminIsLoggedIn(){return !!adminUser}
async function openAdmin(){
 location.hash='admin';
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('show'));
 document.getElementById('adminView').classList.add('show');
 document.body.classList.remove('welcome-lock');
 const overlay=document.getElementById('welcomeOverlay'); if(overlay) overlay.remove();
 if(supabaseClient){
  const {data}=await supabaseClient.auth.getUser();
  adminUser=data&&data.user?data.user:null;
 }
 renderAdmin();
 window.scrollTo(0,0);
}
function closeAdmin(){
 if(location.hash==='#admin') history.replaceState(null,'',location.pathname+location.search);
 document.getElementById('adminView').classList.remove('show');
 document.getElementById('listing').classList.add('show');
 window.scrollTo(0,0);
}
async function adminLogin(){
 if(!supabaseClient) return toast('Supabase belum dikonfigurasi');
 const email=document.getElementById('adminEmailInput').value.trim();
 const password=document.getElementById('adminPasswordInput').value;
 const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error){console.error(error);return toast('Login admin gagal');}
 adminUser=data.user;
 renderAdmin();
 toast('Masuk admin berhasil');
}
async function adminLogout(){if(supabaseClient) await supabaseClient.auth.signOut();adminUser=null;renderAdmin();toast('Admin keluar');}
function renderAdmin(){
 const gate=document.getElementById('adminGate'), workspace=document.getElementById('adminWorkspace');
 if(!gate||!workspace) return;
 const logged=adminIsLoggedIn();
 gate.style.display=logged?'none':'block';
 workspace.style.display=logged?'grid':'none';
 if(!logged) return;
 if(!products[adminSelectedKey]) adminSelectedKey=Object.keys(products)[0]||'';
 renderAdminProductList();
 fillAdminProductForm(adminSelectedKey);
 fillAdminSettingsForm();
}
function renderAdminProductList(){
 const list=document.getElementById('adminProductList'); list.innerHTML='';
 Object.entries(products).forEach(([key,p])=>{
  p=safeProduct(p);
  const btn=document.createElement('button');
  btn.className='adminProductBtn'+(key===adminSelectedKey?' active':'');
  btn.onclick=()=>{adminSelectedKey=key;renderAdmin();};
  btn.innerHTML=`<img src="${safeSrc(p.img)}" alt="${escapeHTML(p.title||'Produk')}"><div><b>${escapeHTML(p.title||'(Tanpa nama)')}</b><span>${escapeHTML(key)} • ${escapeHTML(p.status)} • ${rupiah(p.price)}</span></div><span>${p.stock}</span>`;
  list.appendChild(btn);
 });
 if(!Object.keys(products).length) list.innerHTML='<div class="adminHint">Belum ada produk. Tekan + Produk untuk mulai.</div>';
}
function fillAdminProductForm(key){
 const p=safeProduct(products[key]||{title:'',price:0,old:0,img:'',type:'ready',rating:'4.9 (0 ulasan)',sold:'0 terjual',time:'Ready',status:'READY STOCK',stock:1,size:'',system:'Ready stock',variants:['Default'],desc:''});
 const set=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val??'';};
 set('adminKey',key||'');
 set('adminTitle',p.title); set('adminStatus',p.status); set('adminType',p.type);
 set('adminPrice',formatMoneyValue(p.price)); set('adminOld',formatMoneyValue(p.old)); set('adminStock',p.stock);
 set('adminRating',p.rating); set('adminSold',p.sold); set('adminTime',p.time);
 set('adminSystem',p.system); set('adminSize',p.size); set('adminVariants',p.variants.join(', '));
 set('adminDesc',p.desc); set('adminImg',(p.images&&p.images.length?p.images:[p.img]).filter(Boolean).join('\n'));
 renderAdminImagePreview();
}
function fillAdminSettingsForm(){
 const set=(id,val)=>{const el=document.getElementById(id); if(el) el.value=val??'';};
 set('adminWa',normalizeWaNumber(storeSettings.wa)); set('adminStoreTitle',storeSettings.title); set('adminStoreSubtitle',storeSettings.subtitle);
 set('adminRepeatTitle',storeSettings.repeatOrderTitle); set('adminRepeatText',storeSettings.repeatOrderText);
 set('adminRepeatMessage',storeSettings.repeatOrderMessage); set('adminChatMessage',storeSettings.chatMessage);
 set('adminPromoName',storeSettings.promo.name); set('adminPromoStart',storeSettings.promo.start);
 set('adminPromoEnd',storeSettings.promo.end); set('adminPromoLabel',storeSettings.promo.label);
}
function productFromAdminForm(){
 const val=id=>document.getElementById(id).value.trim();
 const images=val('adminImg').split(/\n|,/).map(x=>x.trim()).filter(Boolean);
 return safeProduct({
  title:val('adminTitle'),status:val('adminStatus'),type:val('adminType')||'ready',
  price:parseMoney(val('adminPrice')),old:parseMoney(val('adminOld'))||parseMoney(val('adminPrice')),stock:Number(val('adminStock'))||0,
  rating:val('adminRating')||'4.9 (0 ulasan)',sold:val('adminSold')||'0 terjual',time:val('adminTime')||'Ready',
  system:val('adminSystem')||val('adminStatus'),size:val('adminSize'),variants:val('adminVariants').split(',').map(x=>x.trim()).filter(Boolean),
  desc:val('adminDesc'),img:images[0]||'',images
 });
}
function normalizeProductKey(key){
 return (key||'produk_baru').toLowerCase().replace(/[^a-z0-9_-]+/g,'_').replace(/^_+|_+$/g,'')||'produk_baru';
}
function setAdminUploadStatus(msg,isError=false){
 const el=document.getElementById('adminUploadStatus');
 if(el){el.textContent=msg;el.style.color=isError?'#e73355':'#6d7580';}
}
function setAdminSaveBusy(isBusy){
 const btn=document.getElementById('adminSaveProductBtn');
 if(btn){btn.disabled=isBusy;btn.textContent=isBusy?'Menyimpan...':'Simpan Produk';}
}
function adminImageUrls(){
 const field=document.getElementById('adminImg');
 return field?field.value.split(/\n|,/).map(x=>x.trim()).filter(Boolean):[];
}
function renderAdminImagePreview(){
 const list=document.getElementById('adminImagePreviewList');
 if(!list) return;
 const urls=adminImageUrls();
 list.innerHTML='';
 for(let i=0;i<5;i++){
  if(urls[i]){
   const img=document.createElement('img');
   img.src=urls[i];
   img.alt='Foto produk '+(i+1);
   list.appendChild(img);
  }else{
   const empty=document.createElement('div');
   empty.className='empty';
   empty.textContent='Foto '+(i+1);
   list.appendChild(empty);
  }
 }
}
async function requireAdminSession(){
 if(!supabaseClient){toast('Supabase belum dikonfigurasi');return false;}
 const {data,error}=await supabaseClient.auth.getUser();
 if(error||!data.user){toast('Login admin dulu sebelum upload');return false;}
 adminUser=data.user;
 return true;
}
function imageExtFromDataUrl(dataUrl){
 const mime=(dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)||[])[1]||'image/jpeg';
 if(mime.includes('png')) return 'png';
 if(mime.includes('webp')) return 'webp';
 return 'jpg';
}
function fileToDataUrl(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(reader.result);
  reader.onerror=()=>reject(new Error('Gagal membaca file gambar'));
  reader.readAsDataURL(file);
 });
}
const WATERMARK_LOGO_PATH='assets/logo-watermark.png';

async function loadWatermarkLogo(){
 try{
  const response=await fetch(WATERMARK_LOGO_PATH,{cache:'no-store'});
  if(!response.ok) return null;
  const blob=await response.blob();
  if(!blob.type.startsWith('image/')) return null;
  return await new Promise((resolve,reject)=>{
   const url=URL.createObjectURL(blob);
   const img=new Image();
   img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Logo watermark gagal dimuat'));};
   img.src=url;
  });
 }catch(_){
  return null;
 }
}

function addSangkidalWatermark(dataUrl, options={}){
 return new Promise(async (resolve,reject)=>{
  try{
   const img=new Image();
   img.onload=async()=>{
    const maxWidth=options.maxWidth||1400;
    const maxHeight=options.maxHeight||1800;
    const ratio=Math.min(maxWidth/img.width, maxHeight/img.height, 1);
    const width=Math.max(1,Math.round(img.width*ratio));
    const height=Math.max(1,Math.round(img.height*ratio));
    const canvas=document.createElement('canvas');
    canvas.width=width; canvas.height=height;
    const ctx=canvas.getContext('2d');
    if(!ctx){reject(new Error('Canvas tidak didukung'));return;}
    ctx.drawImage(img,0,0,width,height);

    const logoImg=await loadWatermarkLogo();
    if(logoImg){
     const logoWidth=Math.max(80, Math.round(width*0.22));
     const logoHeight=Math.max(32, Math.round(logoWidth * (logoImg.naturalHeight/logoImg.naturalWidth)));
     const x=20;
     const y=16;
     ctx.save();
     ctx.globalAlpha=0.92;
     ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
     ctx.restore();
     const mime='image/jpeg';
     resolve(canvas.toDataURL(mime, options.quality||0.8));
     return;
    }

    const logo='SANGKIDAL';
    const fontSize=Math.max(24,Math.round(width*0.045));
    const lineHeight=fontSize*1.05;
    const textMetrics=ctx.measureText(logo);
    const boxWidth=textMetrics.width + 42;
    const boxHeight=lineHeight + 20;
    const x=width - boxWidth - 28;
    const y=height - boxHeight - 24;

    ctx.save();
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, boxWidth, boxHeight);
    ctx.strokeStyle='rgba(255,255,255,0.18)';
    ctx.lineWidth=1;
    ctx.strokeRect(x, y, boxWidth, boxHeight);
    ctx.font=`600 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.shadowColor='rgba(0,0,0,0.18)';
    ctx.shadowBlur=8;
    ctx.fillText(logo, x + boxWidth/2, y + boxHeight/2 + 1);
    ctx.restore();

    const mime='image/jpeg';
    resolve(canvas.toDataURL(mime, options.quality||0.8));
   };
   img.onerror=()=>reject(new Error('Gagal memproses watermark'));
   img.src=dataUrl;
  }catch(error){
   reject(error);
  }
 });
}
async function uploadDataImageToStorage(key,img){
 if(!img||!img.startsWith('data:image')) return img;
 if(!(await requireAdminSession())) return img;
 const watermarked=await addSangkidalWatermark(img,{maxWidth:1400,maxHeight:1800,quality:0.8});
 const blob=await fetch(watermarked).then(r=>r.blob());
 const ext=imageExtFromDataUrl(watermarked);
 const fileName=`products/${normalizeProductKey(key)}-${Date.now()}.${ext}`;
 const {error}=await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).upload(fileName,blob,{upsert:true,contentType:blob.type||'image/jpeg'});
 if(error){console.error(error);toast('Upload gambar ke Supabase gagal: '+error.message);return img;}
 const {data}=supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(fileName);
 return data.publicUrl;
}
async function uploadFileToStorage(key,file){
 if(!(await requireAdminSession())) return '';
 const dataUrl=await fileToDataUrl(file);
 const watermarked=await addSangkidalWatermark(dataUrl,{maxWidth:1400,maxHeight:1800,quality:0.8});
 const ext=imageExtFromDataUrl(watermarked);
 const fileName=`products/${normalizeProductKey(key)}-${Date.now()}.${ext}`;
 const blob=await fetch(watermarked).then(r=>r.blob());
 const {error}=await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).upload(fileName,blob,{upsert:true,contentType:blob.type||'image/jpeg'});
 if(error){console.error(error);throw new Error(error.message||'Upload gambar gagal');}
 const {data}=supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(fileName);
 return data.publicUrl;
}
function appendAdminImageUrl(url){
 const field=document.getElementById('adminImg');
 const urls=field.value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
 urls.push(url);
 field.value=[...new Set(urls)].join('\n');
 renderAdminImagePreview();
}
async function prepareProductForSupabase(key,product){
 const ready=safeProduct(product);
 ready.images=await Promise.all((ready.images&&ready.images.length?ready.images:[ready.img]).filter(Boolean).map((img,i)=>uploadDataImageToStorage(`${key}-${i+1}`,img)));
 ready.img=ready.images[0]||ready.img;
 return ready;
}
async function saveAdminProduct(){
 const oldKey=adminSelectedKey, newKey=normalizeProductKey(document.getElementById('adminKey').value);
 if(adminUploadPromise){
  setAdminSaveBusy(true);
  setAdminUploadStatus('Menunggu upload gambar selesai...');
  try{await adminUploadPromise;}catch(e){setAdminSaveBusy(false);return;}
 }
 const product=productFromAdminForm();
 if(!product.title) return toast('Nama produk wajib diisi');
 if(oldKey && oldKey!==newKey) delete products[oldKey];
 products[newKey]=product; adminSelectedKey=newKey; currentKey=products[currentKey]?currentKey:newKey;
 const saved=await persistProducts();
 setAdminSaveBusy(false);
 if(saved!==false){renderCards(); renderAdmin(); toast('Produk tersimpan di Supabase');}
}
async function newAdminProduct(){
 const key='produk_'+Date.now();
 products[key]={title:'Produk Baru',price:0,old:0,img:'',type:'ready',rating:'4.9 (0 ulasan)',sold:'0 terjual',time:'Ready stock',status:'READY STOCK',stock:1,size:'',system:'Ready stock',variants:['Default'],desc:''};
 adminSelectedKey=key; await persistProducts(); renderCards(); renderAdmin();
}
async function duplicateAdminProduct(){
 if(!adminSelectedKey||!products[adminSelectedKey]) return toast('Pilih produk dulu');
 const key=normalizeProductKey(adminSelectedKey+'_copy_'+Date.now());
 products[key]=JSON.parse(JSON.stringify(products[adminSelectedKey]));
 products[key].title=products[key].title+' Copy';
 adminSelectedKey=key; const saved=await persistProducts(); if(saved!==false){renderCards(); renderAdmin(); toast('Produk diduplikat');}
}
async function deleteAdminProduct(){
 if(!adminSelectedKey||!products[adminSelectedKey]) return toast('Pilih produk dulu');
 if(!confirm('Hapus produk ini dari etalase?')) return;
 if(supabaseClient){
  const {error}=await supabaseClient.from(SUPABASE_PRODUCT_TABLE).delete().eq('key',adminSelectedKey);
  if(error){console.error(error);return toast('Produk gagal dihapus dari Supabase');}
 }
 delete products[adminSelectedKey];
 adminSelectedKey=Object.keys(products)[0]||'';
 currentKey=adminSelectedKey;
 cart=cart.filter(it=>products[it.key]); saveCart();
 renderCards(); renderAdmin(); toast('Produk dihapus');
}
async function adminImageFromFile(event){
 const files=[...(event.target.files||[])].filter(file=>file.type.startsWith('image/')); if(!files.length) return;
 const key=normalizeProductKey(document.getElementById('adminKey').value||adminSelectedKey);
 setAdminUploadStatus(`Mengupload ${files.length} gambar ke Supabase Storage...`);
 setAdminSaveBusy(true);
 adminUploadPromise=(async()=>{
  const urls=[];
  for(let i=0;i<files.length;i++){
   setAdminUploadStatus(`Mengupload gambar ${i+1} dari ${files.length}: ${files[i].name}`);
   const url=await uploadFileToStorage(`${key}-${i+1}`,files[i]);
   appendAdminImageUrl(url);
   urls.push(url);
  }
  setAdminUploadStatus(`${files.length} gambar selesai diupload. URL gambar sudah terisi.`);
  toast('Gambar berhasil diupload');
  return urls;
 })().catch(error=>{
 setAdminUploadStatus('Upload gagal: '+error.message,true);
 toast('Upload gambar gagal: '+error.message);
 throw error;
 }).finally(()=>{
  adminUploadPromise=null;
  setAdminSaveBusy(false);
 });
 await adminUploadPromise.catch(()=>{});
}
async function saveAdminSettings(){
 const val=id=>document.getElementById(id).value.trim();
 storeSettings={
  ...storeSettings,
  wa:normalizeWaNumber(val('adminWa')||DEFAULT_STORE_SETTINGS.wa),
  title:val('adminStoreTitle')||DEFAULT_STORE_SETTINGS.title,
  subtitle:val('adminStoreSubtitle'),
  repeatOrderTitle:val('adminRepeatTitle'),
  repeatOrderText:val('adminRepeatText'),
  repeatOrderMessage:val('adminRepeatMessage'),
  chatMessage:val('adminChatMessage'),
  promo:{name:val('adminPromoName'),start:val('adminPromoStart'),end:val('adminPromoEnd'),label:val('adminPromoLabel')}
 };
 const saved=await persistSettings(); if(saved!==false){fillAdminSettingsForm(); toast('Pengaturan tersimpan di Supabase');}
}
function exportAdminData(){
 document.getElementById('adminExport').value=JSON.stringify({settings:storeSettings,products},null,2);
 toast('Data siap diekspor');
}
async function importAdminData(){
 try{
  const data=JSON.parse(document.getElementById('adminExport').value);
  if(data.products) products=data.products;
  if(data.settings) storeSettings={...DEFAULT_STORE_SETTINGS,...data.settings,promo:{...DEFAULT_STORE_SETTINGS.promo,...(data.settings.promo||{})}};
  const savedProducts=await persistProducts(); const savedSettings=await persistSettings();
  if(savedProducts!==false&&savedSettings!==false){renderCards(); renderAdmin(); toast('Data berhasil diimpor ke Supabase');}
 }catch(e){toast('Format data impor belum valid')}
}
async function seedDefaultData(){
 if(!confirm('Upload 5 contoh produk yang sudah bagus ke Supabase? Data contoh akan disimpan sebagai produk awal.')) return;
 products=JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
 storeSettings={...DEFAULT_STORE_SETTINGS,promo:{...DEFAULT_STORE_SETTINGS.promo}};
 adminSelectedKey=Object.keys(products)[0]||'';
 toast('Mengupload contoh produk ke Supabase...');
 const savedProducts=await persistProducts();
 const savedSettings=await persistSettings();
 if(savedProducts!==false&&savedSettings!==false){renderCards(); renderAdmin(); toast('Contoh produk sudah masuk Supabase');}
}

document.getElementById('filterSheet').onclick=e=>{if(e.target.id==='filterSheet')e.currentTarget.classList.remove('show')}
document.getElementById('shareSheet').onclick=e=>{if(e.target.id==='shareSheet')e.currentTarget.classList.remove('show')}
updateCartBadge();
applyStoreSettings();

const hashMatch=location.hash.match(/product=([a-z0-9_-]+)/i);
if(location.hash==='#admin') openAdmin();
else if(hashMatch && products[hashMatch[1]]) openProduct(hashMatch[1]);



function enterStore(){
 const overlay=document.getElementById('welcomeOverlay');
 if(!overlay) return;
 overlay.classList.add('welcome-hide');
 document.body.classList.remove('welcome-lock');
 window.setTimeout(()=>overlay.remove(),1200);
}



let STORE_PROMO = storeSettings.promo;

function updateEventBanner(){
  const banner=document.getElementById('eventBanner');
  if(!banner) return;
  const start=new Date(STORE_PROMO.start+'T00:00:00');
  const end=new Date(STORE_PROMO.end+'T23:59:59');
  const now=new Date();
  const title=banner.querySelector('.eventTitle');
  const text=banner.querySelector('.eventText');

  if(now < start){
    title.textContent='Promo berikutnya: '+STORE_PROMO.name;
    text.textContent='Mulai '+formatDateID(STORE_PROMO.start)+' • '+STORE_PROMO.label;
  }else if(now > end){
    title.textContent='Promo '+STORE_PROMO.name+' sudah selesai';
    text.textContent='Nanti kami kabari lagi kalau ada harga spesial berikutnya ya kak.';
  }else{
    title.textContent=STORE_PROMO.name;
    text.textContent=promoRangeText(STORE_PROMO)+' • '+STORE_PROMO.label;
  }
}
updateEventBanner();
if(supabaseClient){
 supabaseClient.auth.getUser().then(({data})=>{adminUser=data&&data.user?data.user:null;if(location.hash==='#admin')renderAdmin();});
 loadSupabaseData().then(()=>{if(location.hash==='#admin')renderAdmin();});
}else{
 console.warn('Isi SUPABASE_URL dan SUPABASE_ANON_KEY agar produk admin tersambung ke Supabase.');
}

