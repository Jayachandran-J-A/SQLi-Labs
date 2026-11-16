<?php
require 'db.php';
$cat = $_GET['category'] ?? '';
$sort = $_GET['sort'] ?? 'id';
$where = $cat === '' ? '1=1' : "category='$cat'";
out(rows("SELECT id,name,category,price,description FROM products WHERE $where ORDER BY $sort"));
