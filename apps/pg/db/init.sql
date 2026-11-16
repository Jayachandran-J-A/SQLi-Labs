CREATE ROLE people_app LOGIN PASSWORD 'Pe0ple_app_2025';
GRANT CONNECT ON DATABASE people TO people_app;

CREATE TABLE employees(
  id SERIAL PRIMARY KEY, name TEXT, email TEXT, department TEXT, title TEXT);
CREATE TABLE users(
  id SERIAL PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT);
CREATE TABLE leave_requests(
  id SERIAL PRIMARY KEY, requested_by TEXT, reason TEXT, status TEXT, days INT);
CREATE TABLE audit_log(
  id SERIAL PRIMARY KEY, ip TEXT, ua TEXT, action TEXT, ts TIMESTAMP DEFAULT now());
CREATE TABLE payroll(
  id SERIAL PRIMARY KEY, employee_id INT, salary INT, iban TEXT, tax_id TEXT);

INSERT INTO employees(name,email,department,title) VALUES
('Helen Ortiz','helen.ortiz@meridian.local','Engineering','CTO'),
('Marcus Lee','marcus.lee@meridian.local','Engineering','Senior Engineer'),
('Sofia Rossi','sofia.rossi@meridian.local','Design','Lead Designer'),
('Tomas Novak','tomas.novak@meridian.local','Sales','Account Executive'),
('Aisha Khan','aisha.khan@meridian.local','Finance','Controller'),
('Daniel Park','daniel.park@meridian.local','Engineering','DevOps Engineer'),
('Grace Miller','grace.miller@meridian.local','HR','HR Manager'),
('Liam Walker','liam.walker@meridian.local','Sales','Sales Manager'),
('Yuki Tanaka','yuki.tanaka@meridian.local','Design','UX Researcher');

INSERT INTO users(username,password,role) VALUES
('hr.admin','ef0c9d1d1f3a6ccd0ba2e1b9d6f4b7c0','admin'),
('helen','5f4dcc3b5aa765d61d8327deb882cf99','manager'),
('marcus','e10adc3949ba59abbe56e057f20f883e','staff'),
('sofia','25f9e794323b453885f5181f1b624d0b','staff');

INSERT INTO leave_requests(requested_by,reason,status,days) VALUES
('marcus','Family vacation','approved',10),
('sofia','Medical appointment','approved',1),
('helen','Conference travel','pending',3),
('marcus','Moving house','pending',2);

INSERT INTO audit_log(ip,ua,action) VALUES ('10.0.0.8','Mozilla/5.0','login');

INSERT INTO payroll(employee_id,salary,iban,tax_id) VALUES
(1,142000,'DE89370400440532013000','TX-551-9021'),
(2,98000,'GB29NWBK60161331926819','TX-330-8745'),
(3,87000,'FR1420041010050500013M02606','TX-621-1203');

CREATE SCHEMA internal;
CREATE TABLE internal.secrets(id SERIAL PRIMARY KEY, name TEXT, value TEXT);
INSERT INTO internal.secrets(name,value) VALUES
('vpn_psk','Pr3shared-K3y-Meridian'),
('hr_portal_token','tok_hr_8f21c9aa7d'),
('flag','FLAG{p0stgres_p30ple_hub_stack3d_and_cast_9be2}');

GRANT USAGE ON SCHEMA public, internal TO people_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO people_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO people_app;
GRANT SELECT ON ALL TABLES IN SCHEMA internal TO people_app;
