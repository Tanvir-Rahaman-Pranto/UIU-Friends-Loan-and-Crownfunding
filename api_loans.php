<?php
include 'db.php';
$user = requireLogin();
$uid  = (int) $user['user_id'];

/* ════════════════════════════════════════════
   GET  — list open loan requests
   Query params:
     sort     : latest | interest | trust   (default: latest)
     category : tuition | medical | emergency (maps to purpose LIKE)
     search   : free text search on purpose / full_name
   ════════════════════════════════════════════ */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $sort     = $_GET['sort']     ?? 'latest';
    $category = $_GET['category'] ?? '';
    $search   = trim($_GET['search'] ?? '');

    /* Build ORDER BY */
    $orderBy = match($sort) {
        'interest' => 'lr.max_interest_rate ASC',
        'trust'    => 'u.avg_rating DESC',
        default    => 'lr.created_at DESC',          /* latest */
    };

    /* Build WHERE clauses */
    $where   = ['lr.status = "open"'];
    $params  = [];
    $types   = '';

    if ($category !== '') {
        $where[]  = 'lr.purpose LIKE ?';
        $params[] = '%' . $category . '%';
        $types   .= 's';
    }

    if ($search !== '') {
        $where[]  = '(lr.purpose LIKE ? OR u.full_name LIKE ? OR lr.reason_details LIKE ?)';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
        $types   .= 'sss';
    }

    $whereSQL = 'WHERE ' . implode(' AND ', $where);

    /* ── Fetch loan requests with borrower info ──
       Columns used (loan_request):
         loan_id, borrower_id, amount, purpose, reason_details,
         repayment_deadline, max_interest_rate, conditions,
         status, views_count, created_at
       Columns used (user):
         full_name, department, profile_photo, avg_rating, total_reviews
    ─────────────────────────────────────────────── */
    $sql = "
        SELECT
            lr.loan_id,
            lr.amount,
            lr.purpose,
            lr.reason_details,
            lr.repayment_deadline,
            lr.max_interest_rate,
            lr.conditions,
            lr.views_count,
            lr.created_at,
            u.full_name,
            u.department,
            u.profile_photo,
            u.avg_rating,
            u.total_reviews,
            (SELECT COUNT(*) FROM loan_offer lo WHERE lo.loan_id = lr.loan_id AND lo.status = 'pending') AS offer_count
        FROM loan_request lr
        JOIN user u ON u.user_id = lr.borrower_id
        $whereSQL
        ORDER BY $orderBy
        LIMIT 20
    ";

    $stmt = $conn->prepare($sql);
    if ($types && $params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    /* ── For each loan, attach up to 3 best offers ──
       loan_offer columns: offer_id, loan_id, lender_id, interest_rate,
                           conditions, message_to_borrower,
                           status(pending/accepted/rejected/withdrawn), offered_at
    ─────────────────────────────────────────────── */
    $loans = [];
    foreach ($rows as $row) {
        $lid = (int) $row['loan_id'];

        $os = $conn->prepare("
            SELECT
                lo.offer_id,
                lo.interest_rate,
                lo.message_to_borrower,
                lo.status,
                u.full_name,
                u.profile_photo,
                u.avg_rating
            FROM loan_offer lo
            JOIN user u ON u.user_id = lo.lender_id
            WHERE lo.loan_id = ? AND lo.status = 'pending'
            ORDER BY lo.interest_rate ASC
            LIMIT 3
        ");
        $os->bind_param('i', $lid);
        $os->execute();
        $offers = $os->get_result()->fetch_all(MYSQLI_ASSOC);
        $os->close();

        /* Cast numeric types */
        $row['amount']            = (float) $row['amount'];
        $row['max_interest_rate'] = (float) $row['max_interest_rate'];
        $row['avg_rating']        = (float) $row['avg_rating'];
        $row['total_reviews']     = (int)   $row['total_reviews'];
        $row['offer_count']       = (int)   $row['offer_count'];
        $row['views_count']       = (int)   $row['views_count'];

        /* Increment view count */
        $conn->query("UPDATE loan_request SET views_count = views_count + 1 WHERE loan_id = $lid");

        foreach ($offers as &$o) {
            $o['interest_rate'] = (float) $o['interest_rate'];
            $o['avg_rating']    = (float) $o['avg_rating'];
        }
        unset($o);

        $row['offers'] = $offers;
        $loans[]       = $row;
    }

    respond(true, 'ok', 200, ['loans' => $loans]);
}


/* ════════════════════════════════════════════
   POST — two actions:
     action=create  → insert into loan_request
     action=bid     → insert into loan_offer
   ════════════════════════════════════════════ */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $action = trim($_POST['action'] ?? '');

    /* ── ACTION: create a new loan request ──
       Required POST fields:
         amount, purpose
       Optional:
         reason_details, repayment_deadline, max_interest_rate, conditions
    ─────────────────────────────────────────── */
    if ($action === 'create') {

        $amount     = trim($_POST['amount']             ?? '');
        $purpose    = trim($_POST['purpose']            ?? '');
        $details    = trim($_POST['reason_details']     ?? '');
        $deadline   = trim($_POST['repayment_deadline'] ?? '');
        $maxRate    = trim($_POST['max_interest_rate']  ?? '');
        $conditions = trim($_POST['conditions']         ?? '');

        if (!$amount || !$purpose)
            respond(false, 'Amount and purpose are required.', 422);

        if ((float)$amount <= 0)
            respond(false, 'Amount must be greater than zero.', 422);

        if (strlen($purpose) > 200)
            respond(false, 'Purpose must be 200 characters or fewer.', 422);

        /* Validate deadline is a future date if provided */
        $deadlineVal = null;
        if ($deadline !== '') {
            $d = DateTime::createFromFormat('Y-m-d', $deadline);
            if (!$d || $d < new DateTime('today'))
                respond(false, 'Repayment deadline must be a future date.', 422);
            $deadlineVal = $deadline;
        }

        $maxRateVal = ($maxRate !== '') ? (float)$maxRate : null;

        /* Prevent a user from posting a duplicate open request */
        $dup = $conn->prepare(
            'SELECT loan_id FROM loan_request WHERE borrower_id = ? AND status = "open" LIMIT 1'
        );
        $dup->bind_param('i', $uid);
        $dup->execute();
        $dup->store_result();
        if ($dup->num_rows > 0)
            respond(false, 'You already have an open loan request. Close it before posting a new one.', 409);
        $dup->close();

        $ins = $conn->prepare('
            INSERT INTO loan_request
                (borrower_id, amount, purpose, reason_details,
                 repayment_deadline, max_interest_rate, conditions, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, "open")
        ');
        $ins->bind_param('idsssdss',
            $uid, $amount, $purpose, $details,
            $deadlineVal, $maxRateVal, $conditions
        );

        if (!$ins->execute())
            respond(false, 'Failed to post loan request: ' . $conn->error, 500);

        $newId = $ins->insert_id;
        $ins->close();

        respond(true, 'Loan request posted successfully.', 201, ['loan_id' => $newId]);
    }


    /* ── ACTION: place a bid (loan offer) ──
       Required POST fields:
         loan_id, interest_rate
       Optional:
         message_to_borrower, conditions
    ─────────────────────────────────────────── */
    if ($action === 'bid') {

        $loanId      = (int)   ($_POST['loan_id']              ?? 0);
        $rate        = (float) ($_POST['interest_rate']        ?? -1);
        $msgBorrower = trim(   $_POST['message_to_borrower']   ?? '');
        $conditions  = trim(   $_POST['conditions']            ?? '');

        if (!$loanId)
            respond(false, 'Invalid loan ID.', 422);

        if ($rate < 0)
            respond(false, 'Please enter a valid interest rate (0 or above).', 422);

        /* Verify the loan exists and is still open */
        $chk = $conn->prepare(
            'SELECT borrower_id FROM loan_request WHERE loan_id = ? AND status = "open" LIMIT 1'
        );
        $chk->bind_param('i', $loanId);
        $chk->execute();
        $loan = $chk->get_result()->fetch_assoc();
        $chk->close();

        if (!$loan)
            respond(false, 'This loan request is no longer available.', 404);

        /* Borrower cannot bid on their own loan */
        if ((int)$loan['borrower_id'] === $uid)
            respond(false, 'You cannot place a bid on your own loan request.', 403);

        /* Check if this lender already has a pending bid on this loan */
        $existing = $conn->prepare(
            'SELECT offer_id FROM loan_offer WHERE loan_id = ? AND lender_id = ? AND status = "pending" LIMIT 1'
        );
        $existing->bind_param('ii', $loanId, $uid);
        $existing->execute();
        $existing->store_result();

        if ($existing->num_rows > 0) {
            /* Update existing bid instead of inserting a duplicate */
            $existing->close();
            $upd = $conn->prepare(
                'UPDATE loan_offer SET interest_rate = ?, message_to_borrower = ?, conditions = ?, offered_at = NOW()
                 WHERE loan_id = ? AND lender_id = ? AND status = "pending"'
            );
            $upd->bind_param('dssii', $rate, $msgBorrower, $conditions, $loanId, $uid);
            if (!$upd->execute())
                respond(false, 'Failed to update bid: ' . $conn->error, 500);
            $upd->close();
            respond(true, 'Your bid has been updated successfully.');
        }

        $existing->close();

        /* Insert new offer
           loan_offer columns: loan_id, lender_id, interest_rate,
                               conditions, message_to_borrower, status(default=pending)
        */
        $ins = $conn->prepare('
            INSERT INTO loan_offer
                (loan_id, lender_id, interest_rate, message_to_borrower, conditions)
            VALUES (?, ?, ?, ?, ?)
        ');
        $ins->bind_param('iidss', $loanId, $uid, $rate, $msgBorrower, $conditions);

        if (!$ins->execute())
            respond(false, 'Failed to place bid: ' . $conn->error, 500);

        $ins->close();

        /* Notify the borrower */
        $notif = $conn->prepare('
            INSERT INTO notification (user_id, title, body, type, reference_id, reference_type)
            VALUES (?, "New Loan Offer", ?, "info", ?, "loan_request")
        ');
        $notifMsg = $user['full_name'] . ' placed a ' . $rate . '% interest offer on your loan request.';
        $notif->bind_param('isi', $loan['borrower_id'], $notifMsg, $loanId);
        $notif->execute();
        $notif->close();

        respond(true, 'Bid placed successfully.');
    }

    respond(false, 'Unknown action.', 400);
}

respond(false, 'Method not allowed.', 405);
