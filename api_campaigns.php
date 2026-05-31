<?php
include 'db.php';
$user   = requireLogin();
$uid    = $user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $filter = $_GET['filter'] ?? 'all';
    $where  = $filter === 'all' ? "WHERE c.status='active'" : "WHERE c.status='active' AND c.category='" . $conn->real_escape_string($filter) . "'";

    $camps = [];
    $res   = $conn->query("
        SELECT c.*, u.full_name creator_name, u.profile_photo creator_photo,
               (SELECT COUNT(*) FROM DONATION d WHERE d.campaign_id=c.campaign_id) donor_count
        FROM CAMPAIGN c JOIN USER u ON u.user_id=c.creator_id
        $where ORDER BY c.created_at DESC
    ");
    while ($row = $res->fetch_assoc()) $camps[] = $row;
    respond(true, 'ok', 200, ['campaigns' => $camps]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $title   = trim($_POST['title'] ?? '');
        $desc    = trim($_POST['description'] ?? '');
        $target  = (float)($_POST['target_amount'] ?? 0);
        $cat     = $_POST['category'] ?? 'other';
        $deadline = $_POST['deadline'] ?? null;

        if (!$title || $target <= 0) respond(false, 'Title and target amount are required.', 422);

        $coverPath = null;
        if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
            $f    = $_FILES['cover_image'];
            $ext  = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
            $name = 'campaign_' . $uid . '_' . time() . '.' . $ext;
            $dir  = __DIR__ . '/uploads/';
            if (!is_dir($dir)) mkdir($dir, 0755, true);
            if (move_uploaded_file($f['tmp_name'], $dir . $name)) $coverPath = 'uploads/' . $name;
        }

        $ins = $conn->prepare('
            INSERT INTO CAMPAIGN (creator_id, title, description, target_amount, category, cover_image, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $ins->bind_param('issdss s', $uid, $title, $desc, $target, $cat, $coverPath, $deadline);
        $ins->close();

        $ins2 = $conn->prepare('
            INSERT INTO CAMPAIGN (creator_id, title, description, target_amount, category, cover_image, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $ins2->bind_param('issdsss', $uid, $title, $desc, $target, $cat, $coverPath, $deadline);
        if (!$ins2->execute()) respond(false, 'Failed to create campaign.', 500);
        $cid = $ins2->insert_id;
        $ins2->close();
        respond(true, 'Campaign submitted for review.', 201, ['campaign_id' => $cid]);
    }

    if ($action === 'donate') {
        $campId  = (int)($_POST['campaign_id'] ?? 0);
        $amount  = (float)($_POST['amount'] ?? 0);
        $anon    = !empty($_POST['is_anonymous']) ? 1 : 0;
        $msg     = trim($_POST['message'] ?? '');
        $txRef   = trim($_POST['transaction_ref'] ?? '');

        if (!$campId || $amount <= 0) respond(false, 'Invalid donation data.', 422);

        /* Check campaign exists and active */
        $chk = $conn->prepare('SELECT campaign_id, collected_amount, target_amount FROM CAMPAIGN WHERE campaign_id=? AND status="active"');
        $chk->bind_param('i', $campId); $chk->execute();
        $camp = $chk->get_result()->fetch_assoc(); $chk->close();
        if (!$camp) respond(false, 'Campaign not found or inactive.', 404);

        /* Insert donation */
        $don = $conn->prepare('INSERT INTO DONATION (campaign_id, donor_id, amount, is_anonymous, message, transaction_ref) VALUES (?,?,?,?,?,?)');
        $don->bind_param('iidisd', $campId, $uid, $amount, $anon, $msg, $txRef);

        /* fix — use correct types */
        $don->close();
        $don2 = $conn->prepare('INSERT INTO DONATION (campaign_id, donor_id, amount, is_anonymous, message, transaction_ref) VALUES (?,?,?,?,?,?)');
        $don2->bind_param('iidiss', $campId, $uid, $amount, $anon, $msg, $txRef);
        if (!$don2->execute()) respond(false, 'Donation failed.', 500);
        $don2->close();

        /* Update collected_amount */
        $upd = $conn->prepare('UPDATE CAMPAIGN SET collected_amount = collected_amount + ? WHERE campaign_id=?');
        $upd->bind_param('di', $amount, $campId); $upd->execute(); $upd->close();

        /* Mark completed if reached target */
        $newTotal = $camp['collected_amount'] + $amount;
        if ($newTotal >= $camp['target_amount']) {
            $conn->query("UPDATE CAMPAIGN SET status='completed' WHERE campaign_id=$campId");
        }

        respond(true, 'Donation recorded! Thank you for your support.');
    }
}
respond(false, 'Bad request.', 400);
