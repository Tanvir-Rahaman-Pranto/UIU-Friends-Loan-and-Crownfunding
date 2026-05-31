<?php
/* ── Prevent cached pages from being shown after logout ── */
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

include 'db.php'; /* db.php calls session_start() */

/* Clear all session data and destroy the session */
$_SESSION = [];

if (ini_get('session.use_cookies')) {
    /* Expire the session cookie immediately */
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

session_destroy();

/* Redirect to login page */
header('Location: login.html');
exit;