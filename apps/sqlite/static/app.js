const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.style.display = 'block';
  clearTimeout(toast.h); toast.h = setTimeout(() => t.style.display = 'none', 6000);
}
async function api(path, opts) {
  const r = await fetch(path, opts);
  let j = null;
  try { j = await r.json(); } catch (e) {}
  if (!r.ok) { toast((j && j.error) || ('HTTP ' + r.status)); throw new Error('api'); }
  return j;
}
const post = (p, b) => api(p, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(b)});

function show(v) {
  ['home', 'note', 'mine', 'auth'].forEach(x => $('v-' + x).classList.toggle('hide', x !== v));
  if (v === 'mine') loadMine();
}
function card(n) {
  return `<div class="card"><h3><a href="#" onclick="openNote(${Number(n.id) || 0});return false" style="color:inherit;text-decoration:none">${esc(n.title)}</a></h3>
  <p>${esc(n.body)}</p><small>${esc(n.created)}</small></div>`;
}
async function loadNotes(url) {
  try { const d = await api(url); $('notes').innerHTML = d.length ? d.map(card).join('') : '<p>No notes found.</p>'; } catch (e) {}
  loadActivity();
}
function search() { show('home'); loadNotes('api/notes?q=' + encodeURIComponent($('q').value)); }
function byTag(t) { show('home'); loadNotes('api/shared?tag=' + encodeURIComponent(t)); }
async function openNote(id) {
  try {
    const n = await api('api/note?id=' + id);
    $('note').innerHTML = card(n); show('note');
  } catch (e) {}
}
async function loadTags() {
  try { const d = await api('api/tags'); $('tags').innerHTML = d.map(t => `<span class="chip" onclick="byTag('${esc(t.tag)}')">${esc(t.tag)}</span>`).join(''); } catch (e) {}
}
async function loadActivity() {
  try {
    const d = await api('api/activity');
    $('activity').innerHTML = d.map(a => `<div class="act">${esc(a.ip)} &middot; ${esc(a.path)}<br>${esc(a.ts)}</div>`).join('');
  } catch (e) {}
}
async function login() {
  try {
    const u = await post('api/login', {username: $('lu').value, password: $('lp').value});
    setUser(u); show('mine');
  } catch (e) {}
}
async function reg() {
  try { await post('api/register', {username: $('ru').value, password: $('rp').value}); toast('Account created. You can sign in now.'); } catch (e) {}
}
function setUser(u) {
  $('who').textContent = u ? 'Signed in as ' + u.username : '';
  $('authlink').textContent = u ? 'Sign out' : 'Sign in';
  $('authlink').onclick = u ? async () => { await post('api/logout', {}); setUser(null); show('home'); } : () => show('auth');
}
async function loadMine() {
  try { const d = await api('api/my-notes'); $('mynotes').innerHTML = d.length ? d.map(card).join('') : '<p>You have no notes yet.</p>'; }
  catch (e) { show('auth'); }
}
async function saveNote() {
  try {
    await post('api/my-notes', {title: $('nt').value, body: $('nb').value, tag: $('ntag').value || 'general', public: $('npub').checked});
    $('nt').value = $('nb').value = ''; loadMine();
  } catch (e) {}
}
(async () => {
  try { setUser(await api('api/me')); } catch (e) {}
  loadNotes('api/notes'); loadTags();
})();
