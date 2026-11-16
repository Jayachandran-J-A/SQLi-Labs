<?php
require 'db.php';
$code = $_COOKIE['promo'] ?? '';
if ($code === '') out(['code' => null, 'description' => 'No promo applied', 'percent' => 0]);
$r = rows("SELECT code,description,percent FROM promo_codes WHERE code='$code'");
out($r ? $r[0] : ['code' => $code, 'description' => 'Invalid promo code', 'percent' => 0]);
