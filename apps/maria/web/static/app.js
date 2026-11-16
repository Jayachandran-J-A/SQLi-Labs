const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let curPost = 0;

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
function view(v) {
  ['home', 'post', 'acct'].forEach(x => $('v-' + x).classList.toggle('hide', x !== v));
  if (v === 'acct') loadMe();
}
function list(d) {
  $('list').innerHTML = d.map(p => `<article class="p"><h2><a onclick="openPost('${esc(p.slug)}')">${esc(p.title)}</a></h2>
    <small>by ${esc(p.author)}</small><p>${esc(p.excerpt || '')}</p></article>`).join('') || '<p>No articles found.</p>';
}
async function load(tag) {
  try { list(await api('api/posts?tag=' + encodeURIComponent(tag || ''))); } catch (e) {}
}
function byTag(t) { view('home'); load(t); }
async function search() {
  view('home');
  try { list(await api('api/search?q=' + encodeURIComponent($('q').value))); } catch (e) {}
}
async function openPost(slug) {
  try {
    const p = await api('api/post?slug=' + encodeURIComponent(slug));
    curPost = p.id;
    $('post').innerHTML = `<h2>${esc(p.title)}</h2><small>by ${esc(p.author)} &middot; ${esc(p.created)}</small><p>${esc(p.body)}</p>`;
    view('post'); loadComments();
  } catch (e) {}
}
async function loadComments() {
  try {
    const d = await api('api/comments?post_id=' + curPost);
    $('cms').innerHTML = d.map(c => `<div class="cm"><b>${esc(c.author)}</b><br>${esc(c.body)}</div>`).join('') || '<small>Be the first to comment.</small>';
  } catch (e) {}
}
async function addComment() {
  try {
    await post('api/comments', {post_id: curPost, author: $('ca').value || 'anonymous', body: $('cb').value});
    $('cb').value = ''; loadComments();
  } catch (e) {}
}
async function popular() {
  try {
    const d = await api('api/popular?limit=3');
    $('pop').innerHTML = d.map(p => `<div class="cm"><a style="cursor:pointer" onclick="openPost('${esc(p.slug)}')">${esc(p.title)}</a><br><small>${esc(p.views)} reads</small></div>`).join('');
  } catch (e) {}
}
async function strings() {
  try {
    const s = await api('api/strings');
    $('tag').textContent = s.tagline || '';
    if (s.subscribe) $('subl').textContent = s.subscribe;
  } catch (e) {}
}
async function login() {
  try { const u = await post('api/login', {username: $('lu').value, password: $('lp').value}); setUser(u); loadMe(); } catch (e) {}
}
async function reg() {
  try { await post('api/register', {username: $('ru').value, password: $('rp').value}); toast('Welcome aboard! You can sign in now.'); } catch (e) {}
}
function setUser(u) { $('who').textContent = u ? 'Signed in as ' + (u.display_name || u.username) : ''; }
async function loadMe() {
  try {
    const u = await api('api/me'); setUser(u);
    $('me').classList.toggle('hide', !u);
    if (u) { $('dn').value = u.display_name || ''; loadMyComments(); }
  } catch (e) {}
}
async function saveName() {
  try { await post('api/profile', {display_name: $('dn').value}); toast('Profile updated.'); loadMe(); } catch (e) {}
}
async function loadMyComments() {
  try {
    const d = await api('api/my-comments');
    $('mc').innerHTML = d.map(c => `<div class="cm">${esc(c.body)}<br><small>on post #${esc(c.post_id)}</small></div>`).join('') || '<small>No comments yet.</small>';
  } catch (e) { $('mc').innerHTML = ''; }
}
if (!document.cookie.includes('lang=')) document.cookie = 'lang=en; path=/blog/';
strings(); popular(); load(''); loadMe();
