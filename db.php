<?php
session_start();

$host    = "localhost";
$user    = "root";
$pass    = "";
$db      = "uiu_flc";
$charset = "utf8mb4";

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset($charset);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Database connection failed."]));
}

/* ── Helper: send JSON and exit ── */
function respond(bool $success, string $message, int $code = 200, array $extra = []): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(array_merge(["success" => $success, "message" => $message], $extra));
    exit;
}

/* ── Helper: get logged-in user or abort ── */
function requireLogin(): array {
    if (empty($_SESSION['user'])) {
        respond(false, 'Not authenticated.', 401);
    }
    return $_SESSION['user'];
}
