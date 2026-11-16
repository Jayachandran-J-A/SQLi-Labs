import os, re, hashlib
import pymssql
from flask import Flask, request, jsonify
from werkzeug.exceptions import HTTPException
import init_db

app = Flask(__name__, static_folder='static', static_url_path='/static')


def conn():
    return pymssql.connect(server=os.environ.get('DB_HOST', 'mssql-db'), user='helpdesk_app',
                           password='H3lp_desk_app!2025', database='helpdesk',
                           as_dict=True, autocommit=True)


def query(sql, params=None):
    """Runs a batch (stacked statements allowed) and returns rows from every result set."""
    c = conn()
    try:
        cur = c.cursor()
        cur.execute(sql, params) if params is not None else cur.execute(sql)
        out = []
        while True:
            if cur.description:
                out.extend(cur.fetchall())
            if not cur.nextset():
                break
        return out
    finally:
        c.close()


def clean(rows):
    for r in rows:
        for k, v in list(r.items()):
            if hasattr(v, 'isoformat'):
                r[k] = v.isoformat()
    return rows


@app.errorhandler(Exception)
def on_error(e):
    if isinstance(e, HTTPException):
        return jsonify(error=e.description), e.code
    msg = str(e)
    if getattr(e, 'args', None) and len(e.args) > 1 and isinstance(e.args[1], (bytes, bytearray)):
        msg = e.args[1].decode('utf8', 'replace').split('DB-Lib')[0].strip()
    return jsonify(error=msg), 500


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/tickets', methods=['GET', 'POST'])
def tickets():
    if request.method == 'POST':
        d = request.get_json(force=True)
        rows = query("INSERT INTO tickets(subject,description,customer,status,priority) "
                     "OUTPUT INSERTED.id VALUES(%s,%s,%s,'open','medium')",
                     (d.get('subject', ''), d.get('description', ''), d.get('customer', '')))
        return jsonify(id=rows[0]['id'])
    status = request.args.get('status', 'open')
    sort = request.args.get('sort', 'id')
    return jsonify(clean(query("SELECT id,subject,customer,status,priority FROM tickets WHERE status='" +
                               status + "' ORDER BY " + sort)))


@app.route('/api/ticket')
def ticket():
    tid = request.args.get('id', '1')
    rows = query("SELECT id,subject,description,customer,status,priority FROM tickets WHERE id=" + tid)
    if not rows:
        return jsonify(error='Ticket not found'), 404
    return jsonify(clean(rows)[0])


@app.route('/api/related')
def related():
    tid = int(request.args.get('id', 0))
    rows = query("SELECT customer FROM tickets WHERE id=%d", (tid,))
    if not rows:
        return jsonify(error='Ticket not found'), 404
    cust = rows[0]['customer']
    return jsonify(clean(query("SELECT id,subject,status,priority FROM tickets WHERE customer='" + cust + "' AND id<>" + str(tid))))


@app.route('/api/kb')
def kb():
    q = request.args.get('q', '')
    ua = request.headers.get('User-Agent', '')
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if re.search(r'union|information_schema', q, re.I):
        return jsonify(error='Search term rejected'), 400
    query("INSERT INTO access_log(ip,ua,q) VALUES('" + ip + "','" + ua + "','search')")
    return jsonify(query("SELECT id,title,body,category FROM kb_articles WHERE title LIKE '%" + q + "%'"))


@app.route('/api/activity')
def activity():
    return jsonify(clean(query("SELECT TOP 6 ip,ua,q,ts FROM access_log ORDER BY id DESC")))


@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json(force=True)
    u = d.get('username', '')
    p = hashlib.md5(d.get('password', '').encode()).hexdigest()
    rows = query("SELECT id,username,role FROM agents WHERE username='" + u + "' AND password='" + p + "'")
    if not rows:
        return jsonify(error='Invalid username or password'), 401
    return jsonify(message='Signed in as ' + str(rows[0]['username']), role=rows[0]['role'])


if __name__ == '__main__':
    init_db.init()
    app.run(host='0.0.0.0', port=5000, threaded=True)
