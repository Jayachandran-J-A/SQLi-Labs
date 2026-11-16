<?php
require 'db.php';
$sku = $_GET['sku'] ?? '';
$c = db();
$all = [];
if ($c->multi_query("SELECT sku,name,stock FROM products WHERE sku='$sku'")) {
    do {
        if ($res = $c->store_result()) {
            while ($row = $res->fetch_assoc()) { $all[] = $row; }
            $res->free();
        }
    } while ($c->more_results() && $c->next_result());
}
if (!$all) fail('SKU not found', 404);
out($all);
