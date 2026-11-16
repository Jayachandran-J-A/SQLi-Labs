import os, time, hashlib
import pymysql
from flask import Flask, request, jsonify, session
from werkzeug.exceptions import HTTPException

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = 'ink-9a31c0e7-session'
app.config['SESSION_COOKIE_NAME'] = 'ink_session'


def conn():
    for i in range(30):
        try:
            return pymysql.connect(host=os.environ.get('DB_HOST', 'maria-db'),
                                   user=os.environ.get('DB_USER', 'inkwell'),
                                   password=os.environ.get('DB_PASS', 'Ink_w3ll_app_2025'),
                                   database='inkwell', autocommit=True,
                                   cursorclass=pymysql.cursors.DictCursor)
        except pymysql.err.OperationalError:
            time.sleep(2)
    raise RuntimeError('database unavailable')


def query(sql, params=None):
    c = conn()
    try:
        with c.cursor() as cur:
            cur.execute(sql, params)
            return list(cur.fetchall())
    finally:
        c.close()


@app.errorhandler(Exception)
def on_error(e):
    if isinstance(e, HTTPException):
        return jsonify(error=e.description), e.code
    return jsonify(error=str(e)), 500


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/posts')
def posts():
    tag = request.args.get('tag', '')
    if tag:
        sql = ("SELECT id,slug,title,SUBSTRING(body,1,140) AS excerpt,author FROM posts "
               "WHERE (published=1 AND tag='" + tag + "') ORDER BY created DESC")
    else:
        sql = ("SELECT id,slug,title,SUBSTRING(body,1,140) AS excerpt,author FROM posts "
               "WHERE (published=1) ORDER BY created DESC")
    return jsonify(query(sql))


@app.route('/api/post')
def post():
    slug = request.args.get('slug', '')
    rows = query("SELECT id,slug,title,body,author,created FROM posts WHERE slug='" + slug + "' AND published=1")
    if not rows:
        return jsonify(error='Post not found'), 404
    return jsonify(rows[0])


@app.route('/api/search')
def search():
    q = request.args.get('q', '')
    q = q.replace(' ', '').replace('\t', '')   # keep queries tidy
    return jsonify(query("SELECT id,slug,title,author FROM posts WHERE published=1 AND title LIKE '%" + q + "%'"))


@app.route('/api/popular')
def popular():
    limit = request.args.get('limit', '3')
    return jsonify(query("SELECT id,slug,title,views FROM posts WHERE published=1 ORDER BY views DESC LIMIT " + limit))


@app.route('/api/strings')
def strings():
    lang = request.cookies.get('lang', 'en')
    rows = query("SELECT k,text FROM i18n WHERE lang='" + lang + "'")
    return jsonify({r['k']: r['text'] for r in rows})


@app.route('/api/comments', methods=['GET', 'POST'])
def comments():
    if request.method == 'POST':
        d = request.get_json(force=True)
        pid = int(d.get('post_id', 0))
        query("INSERT INTO comments(post_id,author,body) VALUES(%d,'%s','%s')" %
              (pid, d.get('author', 'anonymous'), d.get('body', '').replace("'", "''")))
        return jsonify(ok=True)
    pid = int(request.args.get('post_id', 0))
    return jsonify(query("SELECT author,body,created FROM comments WHERE post_id=%s ORDER BY id DESC", (pid,)))


@app.route('/api/register', methods=['POST'])
def register():
    d = request.get_json(force=True)
    u, p = d.get('username', ''), d.get('password', '')
    if not u or not p:
        return jsonify(error='Username and password required'), 400
    if query("SELECT id FROM users WHERE username=%s", (u,)):
        return jsonify(error='Username already taken'), 409
    query("INSERT INTO users(username,password,email,role,display_name) VALUES(%s,%s,%s,'reader',%s)",
          (u, hashlib.md5(p.encode()).hexdigest(), 'new@inkwell.local', u))
    return jsonify(ok=True)


@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json(force=True)
    rows = query("SELECT id,username,display_name,role FROM users WHERE username=%s AND password=%s",
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
    return jsonify(query("SELECT id,username,display_name,role FROM users WHERE id=%s", (uid,))[0])


@app.route('/api/profile', methods=['POST'])
def profile():
    uid = session.get('uid')
    if not uid:
        return jsonify(error='Not signed in'), 401
    d = request.get_json(force=True)
    query("UPDATE users SET display_name=%s WHERE id=%s", (d.get('display_name', ''), uid))
    return jsonify(ok=True)


@app.route('/api/my-comments')
def my_comments():
    uid = session.get('uid')
    if not uid:
        return jsonify(error='Not signed in'), 401
    name = query("SELECT display_name FROM users WHERE id=%s", (uid,))[0]['display_name']
    return jsonify(query("SELECT post_id,author,body,created FROM comments WHERE author='" + name + "' ORDER BY id DESC"))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
