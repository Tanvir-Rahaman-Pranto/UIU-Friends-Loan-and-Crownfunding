<?php
include 'db.php'; /* db.php must call session_start() before this point */

if ($_SERVER['REQUEST_METHOD'] !== 'POST')
    respond(false, 'Method not allowed.', 405);

$identifier = trim($_POST['identifier'] ?? '');
$password   = $_POST['password']        ?? '';

if (!$identifier || !$password)
    respond(false, 'Please fill in both fields.', 422);

/* ── Accept either:
      • 10-digit student ID  →  look up by student_id
      • email username only  →  append domain
      • full email address   →  use as-is
─────────────────────────────────────────────────── */
if (preg_match('/^\d{10}$/', $identifier)) {
    /* Student ID lookup */
    $stmt = $conn->prepare(
        'SELECT * FROM user WHERE student_id = ? AND is_active = 1 LIMIT 1'
    );
} else {
    /* Email lookup — append domain if only username given */
    if (strpos($identifier, '@') === false) {
        $identifier .= '@bscse.uiu.ac.bd';
    }
    $stmt = $conn->prepare(
        'SELECT * FROM user WHERE email = ? AND is_active = 1 LIMIT 1'
    );
}

if (!$stmt)
    respond(false, 'Server error. Please try again.', 500);

$stmt->bind_param('s', $identifier);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

/* ── Verify password ── */
if (!$user || !password_verify($password, $user['password_hash']))
    respond(false, 'Invalid credentials. Please try again.', 401);

/* ── Check account is active (redundant with SQL but explicit) ── */
if (!(int)$user['is_active'])
    respond(false, 'Your account has been deactivated. Please contact support.', 403);

/* ── Store session — only safe scalar fields ──
   Columns present in USER table:
     user_id, full_name, email, student_id, department,
     profile_photo, role, avg_rating, total_reviews, is_active
   NOTE: password_hash, id_photo intentionally excluded from session
─────────────────────────────────────────────────────────────────── */
$_SESSION['user'] = [
    'user_id'       => (int)   $user['user_id'],
    'full_name'     =>         $user['full_name'],
    'email'         =>         $user['email'],
    'student_id'    =>         $user['student_id'],
    'department'    =>         $user['department'],
    'profile_photo' =>         $user['profile_photo'],  /* may be NULL */
    'role'          =>         $user['role'],
    'avg_rating'    => (float) $user['avg_rating'],
    'total_reviews' => (int)   $user['total_reviews'],
    'is_active'     => (int)   $user['is_active'],
];

respond(true, 'Login successful.', 200, ['user' => $_SESSION['user']]);