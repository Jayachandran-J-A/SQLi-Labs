<?php
require 'db.php';
$ref = $_GET['ref'] ?? '';
// basic input sanitisation
$ref = str_ireplace(['union', 'select'], '', $ref);
$r = rows("SELECT id,ref,customer,total,status FROM orders WHERE ref='$ref'");
if (!$r) fail('No order found with that reference', 404);
out($r);
