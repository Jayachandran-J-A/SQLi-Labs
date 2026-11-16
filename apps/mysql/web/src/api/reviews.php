<?php
require 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true) ?: [];
    $pid = $d['product_id'] ?? 0;
    $author = $d['author'] ?? 'anonymous';
    $rating = $d['rating'] ?? 5;
    $comment = $d['comment'] ?? '';
    db()->query("INSERT INTO reviews(product_id,author,rating,comment) VALUES(" . intval($pid) . ",'$author',$rating,'$comment')");
    out(['ok' => true]);
}
$pid = intval($_GET['product_id'] ?? 0);
out(rows("SELECT author,rating,comment,created FROM reviews WHERE product_id=$pid ORDER BY id DESC"));
