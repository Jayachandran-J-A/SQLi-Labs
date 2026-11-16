<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function db() {
    static $c = null;
    if ($c === null) {
        $c = new mysqli(getenv('DB_HOST') ?: 'mysql-db', getenv('DB_USER') ?: 'bazaar',
                        getenv('DB_PASS') ?: 'Bz4ar_app_2025', 'shop');
        $c->set_charset('utf8mb4');
    }
    return $c;
}

function out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function fail($msg, $code = 500) {
    out(['error' => $msg], $code);
}

function rows($sql) {
    $res = db()->query($sql);
    $r = [];
    while ($row = $res->fetch_assoc()) { $r[] = $row; }
    return $r;
}

set_exception_handler(function ($e) {
    fail($e->getMessage());
});
