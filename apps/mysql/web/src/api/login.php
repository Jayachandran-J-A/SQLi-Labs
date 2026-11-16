<?php
require 'db.php';
$d = json_decode(file_get_contents('php://input'), true) ?: [];
$u = $d['username'] ?? '';
$p = md5($d['password'] ?? '');
$r = rows("SELECT id,username,role FROM users WHERE username='$u' AND password='$p'");
if (!$r) fail('Invalid username or password', 401);
out(['message' => 'Welcome back, ' . $r[0]['username'], 'role' => $r[0]['role']]);
