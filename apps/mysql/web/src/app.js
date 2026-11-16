const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cat = '', curProd = 0;

function toast(m) {
  const t = $('toast'); t.textContent = m; t.style.display = 'block';
  clearTimeout(toast.h); toast.h = setTimeout(() => t.style.display = 'none', 7000);
}
async function api(p, o) {
  const r = await fetch(p, o); let j = null;
  try { j = await r.json(); } catch (e) {}
  if (!r.ok) { toast((j && j.error) || 'HTTP ' + r.status); throw new Error('api'); }
  return j;
}
const post = (p, b) => api(p, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(b)});

function view(v) { ['shop', 'prod', 'track', 'acct'].forEach(x => $('v-' + x).classList.toggle('hide', x !== v)); }

function drawCats() {
  const names = ['', 'electronics', 'home', 'books', 'sports'];
  $('cats').innerHTML = names.map(n => `<span class="chip ${n === cat ? 'on' : ''}" onclick="setCat('${n}')">${n || 'all'}</span>`).join('');
}
function setCat(c) { cat = c; drawCats(); load(); }

async function load() {
  try {
    const d = await api('api/products.php?category=' + encodeURIComponent(cat) + '&sort=' + encodeURIComponent($('sort').value));
    $('grid').innerHTML = d.map(p => `<div class="card"><h3>${esc(p.name)}</h3><small>${esc(p.category)}</small>
      <p>${esc(p.description)}</p><div class="p">$${esc(p.price)}</div><br><button onclick="openProd(${Number(p.id) || 0})">View</button></div>`).join('') || '<p>No products.</p>';
  } catch (e) {}
}
async function openProd(id) {
  try {
    const p = await api('api/product.php?id=' + id);
    curProd = p.id;
    $('prod').innerHTML = `<h2>${esc(p.name)}</h2><small>${esc(p.category)}</small><p>${esc(p.description)}</p><div class="p" style="font-size:20px;font-weight:700;color:#16a085">$${esc(p.price)}</div>`;
    view('prod'); loadReviews();
  } catch (e) {}
}
async function loadReviews() {
  try {
    const d = await api('api/reviews.php?product_id=' + curProd);
    $('revs').innerHTML = d.map(r => `<div class="rev"><b>${esc(r.author)}</b> &middot; ${esc(r.rating)}/5<br>${esc(r.comment)}</div>`).join('') || '<p>No reviews yet.</p>';
  } catch (e) {}
}
async function addReview() {
  try {
    await post('api/reviews.php', {product_id: curProd, author: $('ra').value || 'anonymous', rating: $('rr').value, comment: $('rc').value});
    $('rc').value = ''; loadReviews();
  } catch (e) {}
}
async function stock() {
  try {
    const d = await api('api/stock.php?sku=' + encodeURIComponent($('sku').value));
    $('stockout').innerHTML = '<div class="panel">' + d.map(s => `${esc(s.sku)} - ${esc(s.name)}: <b>${esc(s.stock)}</b> in stock`).join('<br>') + '</div>';
  } catch (e) { $('stockout').innerHTML = ''; }
}
async function track() {
  try {
    const d = await api('api/orders.php?ref=' + encodeURIComponent($('ref').value));
    $('trk').innerHTML = d.map(o => `<p>Order <b>${esc(o.ref)}</b> for ${esc(o.customer)} &middot; $${esc(o.total)} &middot; <i>${esc(o.status)}</i></p>`).join('');
  } catch (e) { $('trk').innerHTML = ''; }
}
async function login() {
  try {
    const d = await post('api/login.php', {username: $('lu').value, password: $('lp').value});
    $('msg').textContent = d.message;
  } catch (e) { $('msg').textContent = ''; }
}
async function promo() {
  try {
    const d = await api('api/cart.php');
    $('promo').textContent = d.percent ? `Promo ${d.code}: ${d.description} (-${d.percent}%)` : d.description;
  } catch (e) {}
}
if (!document.cookie.includes('promo=')) document.cookie = 'promo=WELCOME10; path=/shop/';
drawCats(); load(); promo();
