CREATE DATABASE IF NOT EXISTS inkwell;
CREATE DATABASE IF NOT EXISTS cms_private;

CREATE USER IF NOT EXISTS 'inkwell'@'%' IDENTIFIED BY 'Ink_w3ll_app_2025';
GRANT SELECT, INSERT, UPDATE ON inkwell.* TO 'inkwell'@'%';
GRANT SELECT ON cms_private.* TO 'inkwell'@'%';

USE inkwell;
CREATE TABLE users(
  id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(40) UNIQUE, password CHAR(32),
  email VARCHAR(80), role VARCHAR(20), display_name VARCHAR(255));
CREATE TABLE posts(
  id INT PRIMARY KEY AUTO_INCREMENT, slug VARCHAR(80), title VARCHAR(160), body TEXT, tag VARCHAR(30),
  author VARCHAR(60), published TINYINT, views INT, created DATE);
CREATE TABLE comments(
  id INT PRIMARY KEY AUTO_INCREMENT, post_id INT, author VARCHAR(255), body VARCHAR(500),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE i18n(lang VARCHAR(5), k VARCHAR(30), text VARCHAR(160));
CREATE TABLE subscribers(id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80), token VARCHAR(40));

INSERT INTO users(username,password,email,role,display_name) VALUES
('editor','5ebe2294ecd0e0f08eab7690d2a6ee69','editor@inkwell.local','admin','Chief Editor'),
('nina','5f4dcc3b5aa765d61d8327deb882cf99','nina@inkwell.local','author','Nina'),
('omar','e10adc3949ba59abbe56e057f20f883e','omar@inkwell.local','author','Omar'),
('guest','084e0343a0486ff05530df6c705c8bb4','guest@inkwell.local','reader','Guest');

INSERT INTO posts(slug,title,body,tag,author,published,views,created) VALUES
('why-we-write','Why we write','Writing clarifies thinking. This blog is a place for long-form ideas about technology, culture and craft.','culture','Nina',1,320,'2025-01-10'),
('shipping-small','The case for shipping small','Small releases reduce risk, speed up feedback and keep teams motivated. Here is how we do it.','engineering','Omar',1,540,'2025-01-22'),
('remote-teams','Running remote teams well','Async communication, written culture and trust. Lessons from four years of distributed work.','culture','Nina',1,410,'2025-02-05'),
('db-indexing','A gentle guide to database indexing','Indexes make reads fast and writes slower. Learn when to add them and when to resist.','engineering','Omar',1,880,'2025-02-19'),
('coffee-science','The science of a good espresso','Grind size, pressure and temperature. Small variations make a large difference.','lifestyle','Nina',1,260,'2025-03-03'),
('draft-pricing','DRAFT: 2025 pricing changes','Internal draft - not for publication. Enterprise tier moves to annual billing only.','internal','editor',0,3,'2025-03-08'),
('trail-notes','Notes from the trail','A weekend hiking the coast. Packing list and route included.','lifestyle','Omar',1,190,'2025-03-14');

INSERT INTO comments(post_id,author,body) VALUES
(1,'Guest','Lovely read, thanks for sharing.'),
(2,'Omar','Shipping small is underrated.'),
(4,'Nina','Add a section on composite indexes next time!');

INSERT INTO i18n VALUES
('en','tagline','Ideas worth reading'),
('en','subscribe','Subscribe'),
('fr','tagline','Des idees qui valent la peine'),
('fr','subscribe','S abonner'),
('es','tagline','Ideas que vale la pena leer'),
('es','subscribe','Suscribirse');

INSERT INTO subscribers(email,token) VALUES
('reader1@example.com','unsub_a91f20'),
('reader2@example.com','unsub_c44d7b');

USE cms_private;
CREATE TABLE site_secrets(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(40), value VARCHAR(120));
CREATE TABLE api_tokens(id INT PRIMARY KEY AUTO_INCREMENT, owner VARCHAR(40), token VARCHAR(60));
INSERT INTO site_secrets(name,value) VALUES
('smtp_password','Smtp-Ink-2025!'),
('jwt_secret','ink-jwt-5d11f3b0'),
('flag','FLAG{mariadb_1nkwell_cms_filter_bypassed_e8a7}');
INSERT INTO api_tokens(owner,token) VALUES
('editor','tok_ed_77b1c0f3'),
('nina','tok_ni_20aa91c7');

FLUSH PRIVILEGES;
