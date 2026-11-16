CREATE DATABASE IF NOT EXISTS shop;
CREATE DATABASE IF NOT EXISTS hr_internal;
CREATE DATABASE IF NOT EXISTS vault;

CREATE USER IF NOT EXISTS 'bazaar'@'%' IDENTIFIED BY 'Bz4ar_app_2025';
GRANT SELECT, INSERT, UPDATE ON shop.* TO 'bazaar'@'%';
GRANT SELECT ON hr_internal.* TO 'bazaar'@'%';
GRANT SELECT ON vault.* TO 'bazaar'@'%';
GRANT FILE ON *.* TO 'bazaar'@'%';

USE shop;
CREATE TABLE products(
  id INT PRIMARY KEY AUTO_INCREMENT, sku VARCHAR(20), name VARCHAR(100), category VARCHAR(40),
  price DECIMAL(8,2), description VARCHAR(255), stock INT);
CREATE TABLE users(
  id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(40), password CHAR(32), email VARCHAR(80), role VARCHAR(20));
CREATE TABLE orders(
  id INT PRIMARY KEY AUTO_INCREMENT, ref VARCHAR(20), customer VARCHAR(60), total DECIMAL(8,2), status VARCHAR(20));
CREATE TABLE promo_codes(code VARCHAR(20), description VARCHAR(80), percent INT);
CREATE TABLE reviews(
  id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, author VARCHAR(255), rating INT, comment VARCHAR(500),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE payment_cards(
  id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, card_number VARCHAR(20), expiry VARCHAR(7), holder VARCHAR(60));

INSERT INTO products(sku,name,category,price,description,stock) VALUES
('EL-1001','Wireless Headphones','electronics',89.99,'Over-ear, 30h battery, active noise cancelling.',42),
('EL-1002','Mechanical Keyboard','electronics',119.50,'Hot-swappable switches, aluminium case.',17),
('EL-1003','USB-C Hub','electronics',39.00,'7-in-1 hub with HDMI and card reader.',80),
('HM-2001','Ceramic Mug Set','home',24.90,'Set of four hand-glazed mugs.',55),
('HM-2002','Linen Throw Blanket','home',58.00,'Soft washed linen, 130x170cm.',23),
('HM-2003','Desk Lamp','home',45.25,'Adjustable arm, warm and cool light.',31),
('BK-3001','The Pragmatic Programmer','books',32.00,'20th anniversary edition.',64),
('BK-3002','Designing Data-Intensive Applications','books',47.50,'The big ideas behind reliable systems.',29),
('SP-4001','Yoga Mat','sports',28.00,'Non-slip, 6mm thick.',90),
('SP-4002','Trail Running Shoes','sports',96.00,'Lightweight with aggressive grip.',14);

INSERT INTO users(username,password,email,role) VALUES
('admin','21232f297a57a5a743894a0e4a801fc3','admin@bazaar.local','admin'),
('alice','5f4dcc3b5aa765d61d8327deb882cf99','alice@example.com','customer'),
('bob','482c811da5d5b4bc6d497ffa98491e38','bob@example.com','customer'),
('carol','e99a18c428cb38d5f260853678922e03','carol@example.com','customer');

INSERT INTO orders(ref,customer,total,status) VALUES
('ORD-10001','alice',89.99,'delivered'),
('ORD-10002','bob',119.50,'shipped'),
('ORD-10003','carol',56.00,'processing'),
('ORD-10004','alice',24.90,'delivered');

INSERT INTO promo_codes VALUES
('WELCOME10','Welcome discount',10),
('SPRING15','Spring sale',15),
('VIP30','VIP customers only',30);

INSERT INTO reviews(product_id,author,rating,comment) VALUES
(1,'alice',5,'Great sound and very comfortable.'),
(1,'bob',4,'Battery life is excellent.'),
(2,'carol',5,'Typing feel is superb.'),
(7,'alice',5,'A classic. Must read.');

INSERT INTO payment_cards(user_id,card_number,expiry,holder) VALUES
(2,'4111111111111111','09/27','Alice Johnson'),
(3,'5500000000000004','03/28','Bob Smith'),
(4,'340000000000009','12/26','Carol White');

USE hr_internal;
CREATE TABLE staff(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(60), ssn VARCHAR(15), salary INT, position VARCHAR(40));
INSERT INTO staff(name,ssn,salary,position) VALUES
('Helen Ortiz','512-44-9021',142000,'CTO'),
('Marcus Lee','330-12-8745',98000,'Engineer'),
('Sofia Rossi','621-77-1203',87000,'Designer');

USE vault;
CREATE TABLE secrets(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(40), value VARCHAR(120));
INSERT INTO secrets(name,value) VALUES
('db_root_hint','root password is rotated monthly'),
('s3_backup_key','AKIAMYSQLLABBACKUP0001'),
('flag','FLAG{mysql_b4zaar_3rror_and_un10n_complete_5c19}');

FLUSH PRIVILEGES;
