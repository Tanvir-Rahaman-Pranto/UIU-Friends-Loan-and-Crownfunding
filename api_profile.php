<?php
include 'db.php';
$user = requireLogin();
$uid  = (int)($_GET['user_id'] ?? $user['user_id']);

/* Fetch user */
$s = $conn->prepare('SELECT user_id, full_name, email, student_id, department, phone, profile_photo, role, avg_rating, total_reviews, is_verified, created_at FROM USER WHERE user_id=?');
$s->bind_param('i', $uid); $s->execute();
$profile = $s->get_result()->fetch_assoc(); $s->close();
if (!$profile) respond(false, 'User not found.', 404);

/* Stats */
$ls  = $conn->prepare('SELECT COUNT(*) c FROM LOAN_REQUEST WHERE borrower_id=? AND status IN ("open","funded")');
$ls->bind_param('i', $uid); $ls->execute();
$activeLoans = $ls->get_result()->fetch_assoc()['c']; $ls->close();

$cs  = $conn->prepare('SELECT COUNT(*) c FROM CAMPAIGN WHERE creator_id=? AND status="active"');
$cs->bind_param('i', $uid); $cs->execute();
$activeCampaigns = $cs->get_result()->fetch_assoc()['c']; $cs->close();

$ds  = $conn->prepare('SELECT COALESCE(SUM(amount),0) t FROM DONATION WHERE donor_id=?');
$ds->bind_param('i', $uid); $ds->execute();
$totalDonated = $ds->get_result()->fetch_assoc()['t']; $ds->close();

/* Reviews */
$reviews = [];
$rv = $conn->prepare('
    SELECT r.rating, r.comment, r.created_at, u.full_name reviewer_name, u.profile_photo reviewer_photo
    FROM REVIEW r JOIN USER u ON u.user_id=r.reviewer_id
    WHERE r.reviewee_id=? ORDER BY r.created_at DESC LIMIT 10
');
$rv->bind_param('i', $uid); $rv->execute();
$rr = $rv->get_result();
while ($row = $rr->fetch_assoc()) $reviews[] = $row;
$rv->close();

/* Agreements */
$agreements = [];
$ag = $conn->prepare('
    SELECT la.agreement_id, la.principal_amount, la.interest_rate, la.repayment_status, la.due_date,
           ub.full_name borrower_name, ul.full_name lender_name
    FROM LOAN_AGREEMENT la
    JOIN USER ub ON ub.user_id=la.borrower_id
    JOIN USER ul ON ul.user_id=la.lender_id
    WHERE la.borrower_id=? OR la.lender_id=?
    ORDER BY la.created_at DESC LIMIT 10
');
$ag->bind_param('ii', $uid, $uid); $ag->execute();
$ar = $ag->get_result();
while ($row = $ar->fetch_assoc()) $agreements[] = $row;
$ag->close();

respond(true, 'ok', 200, [
    'profile'    => $profile,
    'stats'      => ['active_loans' => $activeLoans, 'active_campaigns' => $activeCampaigns, 'total_donated' => $totalDonated],
    'reviews'    => $reviews,
    'agreements' => $agreements,
]);
