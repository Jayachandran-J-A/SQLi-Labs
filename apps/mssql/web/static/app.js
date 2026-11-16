const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let status = 'open';

function toast(m) {
  const t = $('toast'); t.textContent = m; t.style.display = 'block';
  clearTimeout(toast.h); toast.h = setTimeout(() => t.style.display = 'none', 8000);
}
async function api(p, o) {
  const r = await fetch(p, o); let j = null;
  try { j = await r.json(); } catch (e) {}
  if (!r.ok) { toast((j && j.error) || 'HTTP ' + r.status); throw new Error('api'); }
  return j;
}
const post = (p, b) => api(p, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(b)});
function view(v) { ['tix', 'det', 'kb', 'new', 'agent'].forEach(x => $('v-' + x).classList.toggle('hide', x !== v)); }

function tabs() {
  $('tabs').innerHTML = ['open', 'pending', 'closed'].map(s => `<span class="tab ${s === status ? 'on' : ''}" onclick="setStatus('${s}')">${s}</span>`).join('');
}
function setStatus(s) { status = s; tabs(); load(); }
async function load() {
  try {
    const d = await api('api/tickets?status=' + encodeURIComponent(status) + '&sort=' + encodeURIComponent($('sort').value));
    $('list').innerHTML = d.map(t => `<div class="card"><h3><a href="#" style="color:inherit;text-decoration:none" onclick="openTicket(${Number(t.id) || 0});return false">#${esc(t.id)} ${esc(t.subject)}</a>
      <span class="b">${esc(t.priority)}</span></h3><small>${esc(t.customer)} &middot; ${esc(t.status)}</small></div>`).join('') || '<p>No tickets.</p>';
  } catch (e) {}
  activity();
}
async function openTicket(id) {
  try {
    const t = await api('api/ticket?id=' + id);
    $('det').innerHTML = `<h2>#${esc(t.id)} ${esc(t.subject)}</h2><p>${esc(t.description)}</p><small>${esc(t.customer)} &middot; ${esc(t.status)} &middot; ${esc(t.priority)}</small>`;
    view('det'); related(id);
  } catch (e) {}
}
async function related(id) {
  try {
    const d = await api('api/related?id=' + id);
    $('rel').innerHTML = d.map(t => `<div class="mini">#${esc(t.id)} ${esc(t.subject)} &middot; ${esc(t.status)} &middot; ${esc(t.priority)}</div>`).join('') || '<small>None.</small>';
  } catch (e) { $('rel').innerHTML = ''; }
}
async function kb() {
  try {
    const d = await api('api/kb?q=' + encodeURIComponent($('q').value));
    $('kbl').innerHTML = d.map(a => `<div class="card"><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><small>${esc(a.category)}</small></div>`).join('') || '<p>No articles found.</p>';
  } catch (e) {}
  activity();
}
async function activity() {
  try {
    const d = await api('api/activity');
    $('act').innerHTML = d.map(a => `<div class="mini">${esc(a.q)} &middot; ${esc(a.ip)}<br>${esc(a.ua)}</div>`).join('');
  } catch (e) {}
}
async function newTicket() {
  try {
    const r = await post('api/tickets', {subject: $('ns').value, customer: $('nc').value, description: $('nd').value});
    $('nmsg').textContent = 'Ticket #' + r.id + ' created.';
  } catch (e) {}
}
async function login() {
  try { const d = await post('api/login', {username: $('lu').value, password: $('lp').value}); $('msg').textContent = d.message; }
  catch (e) { $('msg').textContent = ''; }
}
tabs(); load();
