<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST')
    respond(false, 'Method not allowed.', 405);

$identifier = trim($_POST['identifier'] ?? '');
$password   = $_POST['password'] ?? '';

if (!$identifier || !$password)
    respond(false, 'Please fill in both fields.', 422);

/* Accept student ID (10 digits) or email (with or without domain) */
if (preg_match('/^\d{10}$/', $identifier)) {
    $stmt = $conn->prepare('SELECT * FROM USER WHERE student_id = ? AND is_active = 1 LIMIT 1');
} else {
    if (!str_contains($identifier, '@')) $identifier .= '@bscse.uiu.ac.bd';
    $stmt = $conn->prepare('SELECT * FROM USER WHERE email = ? AND is_active = 1 LIMIT 1');
}

$stmt->bind_param('s', $identifier);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password_hash']))
    respond(false, 'Invalid credentials. Please try again.', 401);

/* No is_verified check — users are verified on registration */

$_SESSION['user'] = [
    'user_id'       => $user['user_id'],
    'full_name'     => $user['full_name'],
    'email'         => $user['email'],
    'student_id'    => $user['student_id'],
    'department'    => $user['department'],
    'profile_photo' => $user['profile_photo'],
    'role'          => $user['role'],
    'avg_rating'    => $user['avg_rating'],
    'total_reviews' => $user['total_reviews'],
];

respond(true, 'Login successful.', 200, ['user' => $_SESSION['user']]);
