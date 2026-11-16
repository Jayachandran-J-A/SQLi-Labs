CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, email TEXT);
CREATE TABLE notes(id INTEGER PRIMARY KEY, title TEXT, body TEXT, created TEXT, author TEXT, tag TEXT, is_public INTEGER);
CREATE TABLE visits(id INTEGER PRIMARY KEY, ip TEXT, ua TEXT, path TEXT, ts TEXT);
CREATE TABLE api_keys(id INTEGER PRIMARY KEY, service TEXT, key_value TEXT);
CREATE TABLE vault_secrets(id INTEGER PRIMARY KEY, label TEXT, secret TEXT);

INSERT INTO users VALUES
(1,'admin','0d107d09f5bbe40cade3de5c71e9e9b7','admin','admin@notevault.local'),
(2,'maria','5f4dcc3b5aa765d61d8327deb882cf99','editor','maria@notevault.local'),
(3,'devon','e10adc3949ba59abbe56e057f20f883e','user','devon@notevault.local'),
(4,'priya','25d55ad283aa400af464c76d713c07ad','user','priya@notevault.local');

INSERT INTO notes VALUES
(1,'Welcome to NoteVault','Share ideas, drafts and checklists with your team. Public notes are visible to everyone.','2025-01-04','admin','general',1),
(2,'Sprint planning checklist','Review backlog, estimate stories, assign owners, confirm capacity.','2025-01-09','maria','work',1),
(3,'Onboarding guide','Accounts, VPN, repos, coffee machine rules. Ask devon for repo access.','2025-01-15','devon','general',1),
(4,'Book recommendations','Designing Data-Intensive Applications; The Pragmatic Programmer; Release It!','2025-02-02','priya','reading',1),
(5,'Conference trip ideas','Lisbon in May? Berlin in September? Budget approval pending.','2025-02-11','maria','travel',1),
(6,'Recipe: miso soup','Dashi, miso paste, tofu, wakame, scallions. Do not boil after adding miso.','2025-02-20','priya','food',1),
(7,'Private - server migration','Migration window Sunday 02:00. Root creds are in the vault.','2025-03-01','admin','work',0),
(8,'Private - salary review','Bands finalised. Do not share.','2025-03-05','admin','work',0),
(9,'Weekly retro notes','What went well: shipping. What to improve: on-call handoffs.','2025-03-12','devon','work',1),
(10,'Garden plan','Tomatoes, basil, peppers. Raised beds by the fence.','2025-03-18','priya','home',1);

INSERT INTO api_keys VALUES
(1,'payments','pk_live_51NvLt0SQLiteStripeKey'),
(2,'mailer','SG.sqlite.mailer.7f3a91c2'),
(3,'storage','AKIASQLITELABSTORAGE01');

INSERT INTO vault_secrets VALUES
(1,'root_password','R00t-Migr4tion-2025!'),
(2,'backup_encryption','b4ckup-k3y-9f82'),
(3,'flag','FLAG{sqlite_n0tes_vault_fully_dumped_7d41}');

INSERT INTO visits(ip,ua,path,ts) VALUES('10.0.0.5','Mozilla/5.0','/api/notes','2025-03-20 09:00:00');
