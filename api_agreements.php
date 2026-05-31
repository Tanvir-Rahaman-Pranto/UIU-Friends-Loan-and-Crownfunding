<?php
include 'db.php';
$user   = requireLogin();
$uid    = $user['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $agreements = [];
    $ag = $conn->prepare('
        SELECT la.*, lr.purpose, lr.amount loan_amount,
               ub.full_name borrower_name, ub.profile_photo borrower_photo,
               ul.full_name lender_name,  ul.profile_photo lender_photo
        FROM LOAN_AGREEMENT la
        JOIN LOAN_REQUEST lr ON lr.loan_id=la.loan_id
        JOIN USER ub ON ub.user_id=la.borrower_id
        JOIN USER ul ON ul.user_id=la.lender_id
        WHERE la.borrower_id=? OR la.lender_id=?
        ORDER BY la.created_at DESC
    ');
    $ag->bind_param('ii', $uid, $uid); $ag->execute();
    $ar = $ag->get_result();
    while ($row = $ar->fetch_assoc()) {
        /* fetch repayments */
        $rps = [];
        $rp = $conn->prepare('SELECT * FROM REPAYMENT WHERE agreement_id=? ORDER BY paid_on ASC');
        $rp->bind_param('i', $row['agreement_id']); $rp->execute();
        $rr = $rp->get_result();
        while ($r = $rr->fetch_assoc()) $rps[] = $r;
        $rp->close();
        $row['repayments'] = $rps;

        /* fetch messages */
        $msgs = [];
        $ms = $conn->prepare('
            SELECT m.*, u.full_name sender_name, u.profile_photo sender_photo
            FROM MESSAGE m JOIN USER u ON u.user_id=m.sender_id
            WHERE m.agreement_id=? ORDER BY m.sent_at ASC
        ');
        $ms->bind_param('i', $row['agreement_id']); $ms->execute();
        $mr = $ms->get_result();
        while ($m = $mr->fetch_assoc()) $msgs[] = $m;
        $ms->close();
        $row['messages'] = $msgs;

        $agreements[] = $row;
    }
    respond(true, 'ok', 200, ['agreements' => $agreements]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    /* Accept a loan offer → create agreement */
    if ($action === 'accept_offer') {
        $offerId = (int)($_POST['offer_id'] ?? 0);
        $of = $conn->prepare('SELECT * FROM LOAN_OFFER WHERE offer_id=? AND status="pending"');
        $of->bind_param('i', $offerId); $of->execute();
        $offer = $of->get_result()->fetch_assoc(); $of->close();
        if (!$offer) respond(false, 'Offer not found.', 404);

        $lr = $conn->prepare('SELECT * FROM LOAN_REQUEST WHERE loan_id=? AND borrower_id=?');
        $lr->bind_param('ii', $offer['loan_id'], $uid); $lr->execute();
        $loan = $lr->get_result()->fetch_assoc(); $lr->close();
        if (!$loan) respond(false, 'Unauthorized.', 403);

        $principal  = $loan['amount'];
        $rate       = $offer['interest_rate'];
        $total      = round($principal * (1 + $rate / 100), 2);
        $startDate  = date('Y-m-d');
        $dueDate    = $loan['repayment_deadline'];

        $ins = $conn->prepare('
            INSERT INTO LOAN_AGREEMENT (loan_id, offer_id, borrower_id, lender_id, principal_amount, interest_rate, total_payable, start_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $ins->bind_param('iiiiddss s', $offer['loan_id'], $offerId, $uid, $offer['lender_id'], $principal, $rate, $total, $startDate, $dueDate);
        $ins->close();

        $ins2 = $conn->prepare('
            INSERT INTO LOAN_AGREEMENT (loan_id, offer_id, borrower_id, lender_id, principal_amount, interest_rate, total_payable, start_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $ins2->bind_param('iiiidddss', $offer['loan_id'], $offerId, $uid, $offer['lender_id'], $principal, $rate, $total, $startDate, $dueDate);
        if (!$ins2->execute()) respond(false, 'Failed to create agreement.', 500);
        $ins2->close();

        /* Mark offer accepted, others rejected, loan funded */
        $conn->prepare('UPDATE LOAN_OFFER SET status="accepted" WHERE offer_id=?')
             ->bind_param('i', $offerId) || true;
        $conn->query("UPDATE LOAN_OFFER SET status='rejected' WHERE loan_id={$offer['loan_id']} AND offer_id<>$offerId");
        $conn->query("UPDATE LOAN_REQUEST SET status='funded' WHERE loan_id={$offer['loan_id']}");

        respond(true, 'Agreement created successfully.');
    }

    /* Send message */
    if ($action === 'message') {
        $agreeId    = (int)($_POST['agreement_id'] ?? 0);
        $receiverId = (int)($_POST['receiver_id'] ?? 0);
        $content    = trim($_POST['content'] ?? '');
        if (!$agreeId || !$receiverId || !$content) respond(false, 'Missing fields.', 422);

        $ins = $conn->prepare('INSERT INTO MESSAGE (agreement_id, sender_id, receiver_id, content) VALUES (?,?,?,?)');
        $ins->bind_param('iiis', $agreeId, $uid, $receiverId, $content);
        if (!$ins->execute()) respond(false, 'Failed to send message.', 500);
        $ins->close();
        respond(true, 'Message sent.');
    }

    /* Log repayment */
    if ($action === 'repayment') {
        $agreeId = (int)($_POST['agreement_id'] ?? 0);
        $amount  = (float)($_POST['amount_paid'] ?? 0);
        $method  = $_POST['payment_method'] ?? 'other';
        $txRef   = trim($_POST['transaction_ref'] ?? '');
        $note    = trim($_POST['note'] ?? '');
        $paidOn  = date('Y-m-d');
        if (!$agreeId || $amount <= 0) respond(false, 'Invalid repayment data.', 422);

        $ins = $conn->prepare('INSERT INTO REPAYMENT (agreement_id, amount_paid, paid_on, payment_method, transaction_ref, note) VALUES (?,?,?,?,?,?)');
        $ins->bind_param('idssss', $agreeId, $amount, $paidOn, $method, $txRef, $note);
        if (!$ins->execute()) respond(false, 'Failed to log repayment.', 500);
        $ins->close();

        /* Update repayment_status */
        $totPaid = $conn->query("SELECT COALESCE(SUM(amount_paid),0) t FROM REPAYMENT WHERE agreement_id=$agreeId")->fetch_assoc()['t'];
        $totalPayable = $conn->query("SELECT total_payable FROM LOAN_AGREEMENT WHERE agreement_id=$agreeId")->fetch_assoc()['total_payable'];
        $status = ($totPaid >= $totalPayable) ? 'completed' : 'partial';
        $conn->query("UPDATE LOAN_AGREEMENT SET repayment_status='$status' WHERE agreement_id=$agreeId");

        respond(true, 'Repayment recorded.');
    }
}
respond(false, 'Bad request.', 400);
