const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'pg-db',
  user: process.env.DB_USER || 'people_app',
  password: process.env.DB_PASS || 'Pe0ple_app_2025',
  database: process.env.DB_NAME || 'people',
});

const app = express();
app.use(express.json());
app.use(express.static('public'));

const md5 = s => crypto.createHash('md5').update(String(s)).digest('hex');

// run raw SQL; supports multiple statements (returns all rows from all result sets)
async function run(sql) {
  const r = await pool.query(sql);
  if (Array.isArray(r)) return r.flatMap(x => x.rows);
  return r.rows;
}
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

app.get('/api/employees', wrap(async (req, res) => {
  const dept = req.query.dept || '';
  const sort = req.query.sort || 'name';
  const where = dept ? `WHERE department='${dept}'` : '';
  res.json(await run(`SELECT id,name,email,department,title FROM employees ${where} ORDER BY ${sort}`));
}));

app.get('/api/employee', wrap(async (req, res) => {
  const id = req.query.id || '1';
  const rows = await run(`SELECT id,name,email,department,title FROM employees WHERE id=${id}`);
  if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
  res.json(rows[0]);
}));

app.post('/api/search', wrap(async (req, res) => {
  const q = (req.body && req.body.q) || '';
  res.json(await run(`SELECT id,name,email,department,title FROM employees WHERE name ILIKE '%${q}%' OR title ILIKE '%${q}%'`));
}));

app.post('/api/login', wrap(async (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  await run(`INSERT INTO audit_log(ip,ua,action) VALUES('${ip}','${ua}','login attempt')`);
  const rows = await run(`SELECT id,username,role FROM users WHERE username='${username}' AND password='${md5(password)}'`);
  if (!rows.length) return res.status(401).json({ error: 'Invalid username or password' });
  res.json({ message: 'Signed in as ' + rows[0].username, role: rows[0].role });
}));

app.get('/api/audit', wrap(async (req, res) => {
  res.json(await run('SELECT ip,ua,action,ts FROM audit_log ORDER BY id DESC LIMIT 6'));
}));

app.post('/api/signup', wrap(async (req, res) => {
  const { username = '', password = '' } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const r = await pool.query('INSERT INTO users(username,password,role) VALUES($1,$2,$3) RETURNING id,username',
    [username, md5(password), 'staff']);
  res.json({ uid: r.rows[0].id, username: r.rows[0].username });
}));

app.get('/api/my-leave', wrap(async (req, res) => {
  const uid = parseInt(req.query.uid, 10);
  const u = await pool.query('SELECT username FROM users WHERE id=$1', [uid]);
  if (!u.rows.length) return res.status(401).json({ error: 'Unknown user' });
  res.json(await run(`SELECT id,reason,status,days FROM leave_requests WHERE requested_by='${u.rows[0].username}' ORDER BY id DESC`));
}));

app.post('/api/leave', wrap(async (req, res) => {
  const { requested_by = 'anonymous', reason = '', days = 1 } = req.body || {};
  await run(`INSERT INTO leave_requests(requested_by,reason,status,days) VALUES('${requested_by}','${reason}','pending',${parseInt(days, 10) || 1})`);
  res.json({ ok: true });
}));

app.get('/api/leave', wrap(async (req, res) => {
  res.json(await run('SELECT requested_by,reason,status,days FROM leave_requests ORDER BY id DESC LIMIT 8'));
}));

app.listen(3000, () => console.log('PeopleHub listening on 3000'));
