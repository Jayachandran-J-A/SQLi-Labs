<?php
require 'db.php';
$id = $_GET['id'] ?? '1';
$r = rows("SELECT id,name,category,price,description FROM products WHERE id=$id");
if (!$r) fail('Product not found', 404);
out($r[0]);
