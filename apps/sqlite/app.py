import os, re, hashlib, sqlite3
from flask import Flask, request, jsonify, session
from werkzeug.exceptions import HTTPException

DB = os.environ.get('DB_PATH', '/data/notes.db')
app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = 'nv-3f8a1c9d-session'
app.config['SESSION_COOKIE_NAME'] = 'nv_session'


def init_db():
    if os.path.exists(DB):
        return
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.executescript(open(os.path.join(os.path.dirname(__file__), 'seed.sql')).read())
    c.commit()
    c.close()


def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def query(sql, params=()):
    c = conn()
    try:
        cur = c.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]
    finally:
        c.close()


def execute(sql, params=()):
    c = conn()
    try:
        c.execute(sql, params)
        c.commit()
    finally:
        c.close()


@app.errorhandler(Exception)
def on_error(e):
    if isinstance(e, HTTPException):
        return jsonify(error=e.description), e.code
    return jsonify(error=str(e)), 500


@app.before_request
def track():
    if request.path.startswith('/api/') and request.path != '/api/activity':
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        ua = request.headers.get('User-Agent', '')
        execute("INSERT INTO visits(ip,ua,path,ts) VALUES('%s','%s','%s',datetime('now'))" % (ip, ua, request.path))


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/notes')
def notes():
    q = request.args.get('q', '')
    sql = ("SELECT id,title,body,created FROM notes WHERE is_public=1 AND (title LIKE '%" + q +
           "%' OR body LIKE '%" + q + "%') ORDER BY id DESC")
    return jsonify(query(sql))


@app.route('/api/note')
def note():
    nid = request.args.get('id', '1')
    rows = query("SELECT id,title,body,created FROM notes WHERE id=" + nid + " AND is_public=1")
    if not rows:
        return jsonify(error='Note not found'), 404
    return jsonify(rows[0])


@app.route('/api/shared')
def shared():
    tag = request.args.get('tag', '')
    if re.search(r'union\s+select|--|#', tag, re.I):
        return jsonify(error='Request blocked by content filter'), 400
    return jsonify(query("SELECT id,title,body,created FROM notes WHERE is_public=1 AND tag='" + tag + "'"))


@app.route('/api/tags')
def tags():
    return jsonify(query("SELECT DISTINCT tag FROM notes WHERE is_public=1 ORDER BY tag"))


@app.route('/api/activity')
def activity():
    return jsonify(query("SELECT ip,ua,path,ts FROM visits ORDER BY id DESC LIMIT 8"))


@app.route('/api/register', methods=['POST'])
def register():
    d = request.get_json(force=True)
    u, p = d.get('username', ''), d.get('password', '')
    if not u or not p:
        return jsonify(error='Username and password required'), 400
    if query("SELECT id FROM users WHERE username=?", (u,)):
        return jsonify(error='Username already taken'), 409
    execute("INSERT INTO users(username,password,role,email) VALUES(?,?,?,?)",
            (u, hashlib.md5(p.encode()).hexdigest(), 'user', 'new-user@notevault.local'))
    return jsonify(ok=True)


@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json(force=True)
    rows = query("SELECT id,username,role FROM users WHERE username=? AND password=?",
                 (d.get('username', ''), hashlib.md5(d.get('password', '').encode()).hexdigest()))
    if not rows:
        return jsonify(error='Invalid credentials'), 401
    session['uid'] = rows[0]['id']
    return jsonify(rows[0])


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(ok=True)


@app.route('/api/me')
def me():
    uid = session.get('uid')
    if not uid:
        return jsonify(None)
    return jsonify(query("SELECT id,username,role FROM users WHERE id=?", (uid,))[0])


@app.route('/api/my-notes', methods=['GET', 'POST'])
def my_notes():
    uid = session.get('uid')
    if not uid:
        return jsonify(error='Not signed in'), 401
    user = query("SELECT username FROM users WHERE id=?", (uid,))[0]['username']
    if request.method == 'POST':
        d = request.get_json(force=True)
        execute("INSERT INTO notes(title,body,created,author,tag,is_public) VALUES(?,?,date('now'),?,?,?)",
                (d.get('title', ''), d.get('body', ''), user, d.get('tag', 'general'), 1 if d.get('public') else 0))
        return jsonify(ok=True)
    return jsonify(query("SELECT id,title,body,created FROM notes WHERE author='" + user + "' ORDER BY id DESC"))


init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
