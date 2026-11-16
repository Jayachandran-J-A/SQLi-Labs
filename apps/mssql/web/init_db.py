"""Idempotent database bootstrap, executed as 'sa' when the app container starts."""
import os, time
import pymssql

HOST = os.environ.get('DB_HOST', 'mssql-db')
SA_PASS = os.environ.get('MSSQL_SA_PASSWORD', 'Sa_Str0ng!Lab2025')

STEPS = [
    # --- helpdesk database ---
    "CREATE DATABASE helpdesk",
    "CREATE DATABASE payroll_db",
    "CREATE LOGIN helpdesk_app WITH PASSWORD='H3lp_desk_app!2025', CHECK_POLICY=OFF",
]

HELPDESK = [
    "CREATE USER helpdesk_app FOR LOGIN helpdesk_app",
    "ALTER ROLE db_datareader ADD MEMBER helpdesk_app",
    "ALTER ROLE db_datawriter ADD MEMBER helpdesk_app",
    """CREATE TABLE tickets(id INT IDENTITY(1,1) PRIMARY KEY, subject NVARCHAR(200), description NVARCHAR(1000),
        customer NVARCHAR(300), status NVARCHAR(20), priority NVARCHAR(10), created DATE DEFAULT GETDATE())""",
    """CREATE TABLE agents(id INT IDENTITY(1,1) PRIMARY KEY, username NVARCHAR(40), password CHAR(32),
        role NVARCHAR(20), email NVARCHAR(80))""",
    "CREATE TABLE kb_articles(id INT IDENTITY(1,1) PRIMARY KEY, title NVARCHAR(160), body NVARCHAR(600), category NVARCHAR(30))",
    "CREATE TABLE access_log(id INT IDENTITY(1,1) PRIMARY KEY, ip NVARCHAR(300), ua NVARCHAR(500), q NVARCHAR(300), ts DATETIME DEFAULT GETDATE())",
    "CREATE TABLE internal_credentials(id INT IDENTITY(1,1) PRIMARY KEY, name NVARCHAR(40), value NVARCHAR(160))",
    """INSERT INTO tickets(subject,description,customer,status,priority) VALUES
        ('Cannot reset my password','The reset email never arrives.','Acme Corp','open','high'),
        ('Invoice shows wrong VAT','VAT rate is 20% but should be 0% for our account.','Globex Ltd','open','medium'),
        ('Feature request: dark mode','Our team would love a dark theme.','Initech','closed','low'),
        ('API returns 502 intermittently','Happens roughly once per hour since Tuesday.','Umbrella Inc','pending','high'),
        ('Export to CSV fails','Large exports time out after 30 seconds.','Acme Corp','open','medium'),
        ('Update billing address','Please change our billing address on file.','Hooli','closed','low'),
        ('SSO login loop','Users bounce between IdP and the app.','Globex Ltd','pending','high')""",
    """INSERT INTO agents(username,password,role,email) VALUES
        ('support.admin','e3afed0047b08059d0fada10f400c1e5','admin','admin@support.local'),
        ('rhea','5f4dcc3b5aa765d61d8327deb882cf99','agent','rhea@support.local'),
        ('kofi','e10adc3949ba59abbe56e057f20f883e','agent','kofi@support.local')""",
    """INSERT INTO kb_articles(title,body,category) VALUES
        ('Resetting your password','Use the Forgot password link. Emails arrive within five minutes.','account'),
        ('Understanding your invoice','Invoices are issued on the first business day of each month.','billing'),
        ('Configuring SSO','Provide your IdP metadata URL under Settings > Security.','security'),
        ('Exporting your data','Exports are available as CSV and JSON from the Reports page.','reports'),
        ('API rate limits','Default limit is 600 requests per minute per key.','api')""",
    """INSERT INTO internal_credentials(name,value) VALUES
        ('sa_hint','sa password lives in the infra vault'),
        ('pagerduty_key','pd_live_7c1e92aa04'),
        ('flag','FLAG{mssql_supp0rt_center_stacked_and_error_4f60}')""",
]

PAYROLL = [
    "CREATE USER helpdesk_app FOR LOGIN helpdesk_app",
    "ALTER ROLE db_datareader ADD MEMBER helpdesk_app",
    "CREATE TABLE salaries(id INT IDENTITY(1,1) PRIMARY KEY, employee NVARCHAR(60), salary INT, iban NVARCHAR(40))",
    "CREATE TABLE notes(id INT IDENTITY(1,1) PRIMARY KEY, label NVARCHAR(40), value NVARCHAR(120))",
    """INSERT INTO salaries(employee,salary,iban) VALUES
        ('Rhea Patel',64000,'GB82WEST12345698765432'),
        ('Kofi Mensah',61000,'DE44500105175407324931'),
        ('Ana Souza',59000,'ES9121000418450200051332')""",
    "INSERT INTO notes(label,value) VALUES ('flag','FLAG{mssql_payroll_cross_database_read_92d3}')",
]


def connect(db='master'):
    return pymssql.connect(server=HOST, user='sa', password=SA_PASS, database=db, autocommit=True)


def run(db, stmts):
    c = connect(db)
    cur = c.cursor()
    for s in stmts:
        cur.execute(s)
    c.close()


def init():
    for i in range(60):
        try:
            c = connect()
            break
        except Exception:
            time.sleep(3)
    else:
        raise RuntimeError('SQL Server did not become ready')
    cur = c.cursor()
    cur.execute("SELECT DB_ID('helpdesk')")
    if cur.fetchone()[0] is None:
        for s in STEPS:
            cur.execute(s)
        c.close()
        run('helpdesk', HELPDESK)
        run('payroll_db', PAYROLL)
        print('database initialised', flush=True)
    else:
        c.close()
