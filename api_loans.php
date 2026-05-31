<?php
include 'db.php';
$user = requireLogin();
$uid  = $user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

/* GET  → list open loan requests */
if ($method === 'GET') {
    $sort = $_GET['sort'] ?? 'latest';
    $orderBy = match($sort) {
        'interest' => 'lr.max_interest_rate ASC',
        'trust'    => 'u.avg_rating DESC',
        default    => 'lr.created_at DESC',
    };

    $loans = [];
    $res = $conn->query("
        SELECT lr.*, u.full_name, u.avg_rating, u.department, u.profile_photo,
               (SELECT COUNT(*) FROM LOAN_OFFER o WHERE o.loan_id=lr.loan_id AND o.status='pending') offer_count
        FROM LOAN_REQUEST lr
        JOIN USER u ON u.user_id = lr.borrower_id
        WHERE lr.status='open'
        ORDER BY $orderBy
    ");
    while ($row = $res->fetch_assoc()) {
        /* fetch offers for this loan */
        $ofs = [];
        $os = $conn->prepare("
            SELECT lo.offer_id, lo.interest_rate, lo.status, u2.full_name, u2.avg_rating, u2.profile_photo
            FROM LOAN_OFFER lo JOIN USER u2 ON u2.user_id=lo.lender_id
            WHERE lo.loan_id=? AND lo.status='pending'
            ORDER BY lo.interest_rate ASC
        ");
        $os->bind_param('i', $row['loan_id']); $os->execute();
        $or = $os->get_result();
        while ($o = $or->fetch_assoc()) $ofs[] = $o;
        $os->close();
        $row['offers'] = $ofs;
        $loans[] = $row;
    }
    respond(true, 'ok', 200, ['loans' => $loans]);
}

/* POST → create loan request */
if ($method === 'POST') {
    $action = $_POST['action'] ?? 'create';

    if ($action === 'create') {
        $amount    = (float)($_POST['amount'] ?? 0);
        $purpose   = trim($_POST['purpose'] ?? '');
        $details   = trim($_POST['reason_details'] ?? '');
        $deadline  = $_POST['repayment_deadline'] ?? null;
        $maxInt    = (float)($_POST['max_interest_rate'] ?? 0);
        $conditions = trim($_POST['conditions'] ?? '');

        if ($amount <= 0 || !$purpose) respond(false, 'Amount and purpose are required.', 422);

        $ins = $conn->prepare('
            INSERT INTO LOAN_REQUEST (borrower_id, amount, purpose, reason_details, repayment_deadline, max_interest_rate, conditions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $ins->bind_param('idsssd s', $uid, $amount, $purpose, $details, $deadline, $maxInt, $conditions);
        /* fix bind — use correct format */
        $ins->close();

        $ins2 = $conn->prepare('
            INSERT INTO LOAN_REQUEST (borrower_id, amount, purpose, reason_details, repayment_deadline, max_interest_rate, conditions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $ins2->bind_param('idsssds', $uid, $amount, $purpose, $details, $deadline, $maxInt, $conditions);
        if (!$ins2->execute()) respond(false, 'Failed to create loan request.', 500);
        $newId = $ins2->insert_id;
        $ins2->close();
        respond(true, 'Loan request posted successfully.', 201, ['loan_id' => $newId]);
    }

    if ($action === 'bid') {
        $loanId   = (int)($_POST['loan_id'] ?? 0);
        $rate     = (float)($_POST['interest_rate'] ?? 0);
        $msg      = trim($_POST['message'] ?? '');
        if (!$loanId || $rate < 0) respond(false, 'Invalid bid data.', 422);

        /* Check borrower isn't bidding on own loan */
        $chk = $conn->prepare('SELECT borrower_id FROM LOAN_REQUEST WHERE loan_id=? AND status="open"');
        $chk->bind_param('i', $loanId); $chk->execute();
        $lr = $chk->get_result()->fetch_assoc(); $chk->close();
        if (!$lr) respond(false, 'Loan not found.', 404);
        if ($lr['borrower_id'] == $uid) respond(false, 'You cannot bid on your own loan.', 403);

        /* Check duplicate bid */
        $dup = $conn->prepare('SELECT offer_id FROM LOAN_OFFER WHERE loan_id=? AND lender_id=? AND status="pending"');
        $dup->bind_param('ii', $loanId, $uid); $dup->execute(); $dup->store_result();
        if ($dup->num_rows > 0) respond(false, 'You already have a pending offer for this loan.', 409);
        $dup->close();

        $bid = $conn->prepare('INSERT INTO LOAN_OFFER (loan_id, lender_id, interest_rate, message_to_borrower) VALUES (?,?,?,?)');
        $bid->bind_param('iids', $loanId, $uid, $rate, $msg);
        if (!$bid->execute()) respond(false, 'Failed to place bid.', 500);
        $bid->close();
        respond(true, 'Bid placed successfully.');
    }
}
respond(false, 'Bad request.', 400);
