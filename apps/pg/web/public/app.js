const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let dept = '', uid = null;
try { uid = localStorage.getItem('ph_uid'); } catch (e) {}

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
  ['dir', 'emp', 'leave', 'acct'].forEach(x => $('v-' + x).classList.toggle('hide', x !== v));
  if (v === 'leave') { loadBoard(); loadMine(); }
}
function drawDepts() {
  const d = ['', 'Engineering', 'Design', 'Sales', 'Finance', 'HR'];
  $('depts').innerHTML = d.map(n => `<span class="chip ${n === dept ? 'on' : ''}" onclick="setDept('${n}')">${n || 'Everyone'}</span>`).join('');
}
function setDept(d) { dept = d; drawDepts(); load(); }
function render(d) {
  $('list').innerHTML = d.map(e => `<div class="card"><h3><a href="#" style="color:inherit;text-decoration:none" onclick="openEmp(${Number(e.id) || 0});return false">${esc(e.name)}</a></h3>
    <small>${esc(e.title)} &middot; ${esc(e.department)}</small><br><small>${esc(e.email)}</small></div>`).join('') || '<p>No results.</p>';
}
async function load() {
  try { render(await api('api/employees?dept=' + encodeURIComponent(dept) + '&sort=' + encodeURIComponent($('sort').value))); } catch (e) {}
  loadAudit();
}
async function search() {
  try { render(await post('api/search', {q: $('q').value})); } catch (e) {}
}
async function openEmp(id) {
  try {
    const e = await api('api/employee?id=' + id);
    $('emp').innerHTML = `<h2>${esc(e.name)}</h2><p>${esc(e.title)}<br>${esc(e.department)}</p><p>${esc(e.email)}</p>`;
    view('emp');
  } catch (e) {}
}
async function login() {
  try { const d = await post('api/login', {username: $('lu').value, password: $('lp').value}); $('msg').textContent = d.message; loadAudit(); }
  catch (e) { $('msg').textContent = ''; loadAudit(); }
}
async function signup() {
  try {
    const d = await post('api/signup', {username: $('ru').value, password: $('rp').value});
    uid = d.uid; try { localStorage.setItem('ph_uid', uid); } catch (e) {}
    $('who').textContent = 'Hi, ' + d.username; toast('Account created.');
  } catch (e) {}
}
async function loadAudit() {
  try {
    const d = await api('api/audit');
    $('audit').innerHTML = d.map(a => `<div class="mini">${esc(a.action)} &middot; ${esc(a.ip)}<br>${esc(a.ua)}</div>`).join('');
  } catch (e) {}
}
async function sendLeave() {
  try {
    await post('api/leave', {requested_by: $('lby').value || 'anonymous', reason: $('lreason').value, days: $('ldays').value});
    $('lreason').value = ''; loadBoard(); loadMine();
  } catch (e) {}
}
async function loadBoard() {
  try {
    const d = await api('api/leave');
    $('board').innerHTML = d.map(l => `<div class="mini"><b>${esc(l.requested_by)}</b> &middot; ${esc(l.days)}d &middot; ${esc(l.status)}<br>${esc(l.reason)}</div>`).join('');
  } catch (e) {}
}
async function loadMine() {
  if (!uid) return;
  try {
    const d = await api('api/my-leave?uid=' + encodeURIComponent(uid));
    $('mine').innerHTML = d.map(l => `<div class="mini">#${esc(l.id)} &middot; ${esc(l.days)}d &middot; ${esc(l.status)}<br>${esc(l.reason)}</div>`).join('') || '<small>No requests yet.</small>';
  } catch (e) {}
}
drawDepts(); load();
