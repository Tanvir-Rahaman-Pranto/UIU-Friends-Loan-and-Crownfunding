<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$fullName   = trim($_POST['fullName']   ?? '');
$studentId  = trim($_POST['studentId']  ?? '');
$emailUser  = trim($_POST['emailUser']  ?? '');
$password   = $_POST['password']        ?? '';
$confirm    = $_POST['confirmPassword'] ?? '';
$phone      = trim($_POST['phone']      ?? '');
$department = trim($_POST['department'] ?? '');
$email      = $emailUser . '@bscse.uiu.ac.bd';

/* ── Validation ── */
if (!$fullName || !$studentId || !$emailUser || !$password || !$confirm)
    respond(false, 'Please fill in all required fields.', 422);

if ($password !== $confirm)
    respond(false, 'Passwords do not match.', 422);

if (strlen($password) < 8)
    respond(false, 'Password must be at least 8 characters.', 422);

/* UIU email format: letters then digits, e.g. tpranto2331028 */
if (!preg_match('/^[a-zA-Z]+\d+$/', $emailUser))
    respond(false, 'Email must match UIU format: letters followed by digits (e.g. tpranto2331028).', 422);

if (!preg_match('/^\d{10}$/', $studentId))
    respond(false, 'Student ID must be exactly 10 digits (e.g. 0112010000).', 422);

/* ── ID card upload → saved to id_photo column ── */
$idPhotoPath = null;

if (isset($_FILES['idUpload']) && $_FILES['idUpload']['error'] === UPLOAD_ERR_OK) {
    $file    = $_FILES['idUpload'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo   = new finfo(FILEINFO_MIME_TYPE);
    $mime    = $finfo->file($file['tmp_name']);

    if (!in_array($mime, $allowed))
        respond(false, 'ID image must be JPG, PNG, GIF, or WEBP.', 422);

    if ($file['size'] > 5 * 1024 * 1024)
        respond(false, 'ID image must be smaller than 5 MB.', 422);

    $uploadDir = __DIR__ . '/uploads/id_cards/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $ext          = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $safeFileName = 'id_' . $studentId . '_' . time() . '.' . $ext;
    $destPath     = $uploadDir . $safeFileName;

    if (move_uploaded_file($file['tmp_name'], $destPath)) {
        /* Store a relative path that the app can use later */
        $idPhotoPath = 'uploads/id_cards/' . $safeFileName;
    }
}

/* ── Duplicate check ── */
$stmt = $conn->prepare('SELECT user_id FROM user WHERE email = ? OR student_id = ? LIMIT 1');
$stmt->bind_param('ss', $email, $studentId);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0)
    respond(false, 'An account with this email or Student ID already exists.', 409);
$stmt->close();

/* ── Insert ──
   Columns present in DB:
     full_name, email, password_hash, phone, student_id, department,
     profile_photo (NULL — avatar from initials),
     id_photo      (path saved if uploaded, else NULL),
     role, is_active
   NOTE: is_verified does NOT exist in this schema — omitted.
── */
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$ins = $conn->prepare('
    INSERT INTO user
        (full_name, email, password_hash, phone, student_id, department,
         profile_photo, id_photo, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, NULL, ?, "student", 1)
');
$ins->bind_param('sssssss', $fullName, $email, $hash, $phone, $studentId, $department, $idPhotoPath);

if (!$ins->execute())
    respond(false, 'Registration failed: ' . $conn->error, 500);

$ins->close();
respond(true, 'Account created successfully! You can now log in.');