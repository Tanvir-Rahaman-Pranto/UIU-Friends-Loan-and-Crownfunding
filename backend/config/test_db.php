<?php
// ================================================================
//  test_db.php  –  Database Connection & Table Diagnostic
//  Open this in browser: http://localhost/UIU_Friends/backend/config/test_db.php
// ================================================================

require_once __DIR__ . '/db.php';

header('Content-Type: text/html; charset=utf-8');

echo '<h2>UIU Friends – Database Diagnostic</h2>';

// 1. Connection check
echo '<h3>1. Connection</h3>';
try {
    $pdo->query('SELECT 1');
    echo '<p style="color:green">✅ Database connected successfully (uiu_flc on ' . DB_HOST . ')</p>';
} catch (Exception $e) {
    echo '<p style="color:red">❌ Connection failed: ' . $e->getMessage() . '</p>';
    exit;
}

// 2. Tables check
$required = [
    'user', 'loan_request', 'loan_offer', 'loan_agreement',
    'repayment', 'message', 'campaign', 'donation',
    'campaign_comment', 'review', 'notification',
    'payment_method', 'report'
];

echo '<h3>2. Required Tables</h3><table border="1" cellpadding="6">';
echo '<tr><th>Table</th><th>Status</th><th>Rows</th></tr>';

foreach ($required as $table) {
    try {
        $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "<tr><td>$table</td><td style='color:green'>✅ EXISTS</td><td>$count rows</td></tr>";
    } catch (Exception $e) {
        echo "<tr><td>$table</td><td style='color:red'>❌ MISSING — run IMPORT_THIS_COMPLETE.sql</td><td>—</td></tr>";
    }
}
echo '</table>';

// 3. Session test
session_start();
echo '<h3>3. Session</h3>';
echo '<p>Session status: ' . (session_status() === PHP_SESSION_ACTIVE ? '✅ Active' : '❌ Not active') . '</p>';
echo '<p>Session ID: ' . session_id() . '</p>';
echo '<p>Logged-in user_id: ' . ($_SESSION['user_id'] ?? '❌ Not logged in') . '</p>';

// 4. Agreement API test
echo '<h3>4. Agreement API Test</h3>';
if (!empty($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT agreement_id, repayment_status FROM loan_agreement WHERE borrower_id = :uid OR lender_id = :uid LIMIT 5");
    $stmt->execute([':uid' => $_SESSION['user_id']]);
    $ags = $stmt->fetchAll();
    if ($ags) {
        echo '<p>Your agreements:</p><ul>';
        foreach ($ags as $ag) {
            echo '<li>Agreement #' . $ag['agreement_id'] . ' — Status: ' . $ag['repayment_status'] .
                 ' — <a href="../../agreement.html?agreement_id=' . $ag['agreement_id'] . '">Open Agreement Room</a></li>';
        }
        echo '</ul>';
    } else {
        echo '<p style="color:orange">⚠ No agreements found for your account. Create a loan, get a bid, and accept it first.</p>';
    }
} else {
    echo '<p style="color:orange">⚠ Not logged in — log in first then revisit this page.</p>';
}

echo '<hr><p><em>Delete or password-protect this file before going to production.</em></p>';
