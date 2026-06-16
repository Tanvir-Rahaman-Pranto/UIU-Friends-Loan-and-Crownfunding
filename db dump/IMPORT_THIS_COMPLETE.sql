-- ================================================================
--  UIU Friends Loan & Crowdfunding Network
--  COMPLETE DATABASE SETUP — Import this ONE file into phpMyAdmin
--  Database: uiu_flc
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ── 1. USER ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id`       INT(11)       NOT NULL AUTO_INCREMENT,
  `full_name`     VARCHAR(100)  NOT NULL,
  `email`         VARCHAR(150)  NOT NULL,
  `password_hash` VARCHAR(255)  NOT NULL,
  `phone`         VARCHAR(20)   DEFAULT NULL,
  `student_id`    VARCHAR(50)   DEFAULT NULL,
  `department`    VARCHAR(100)  DEFAULT NULL,
  `profile_photo` VARCHAR(255)  DEFAULT NULL,
  `id_photo`      VARCHAR(255)  DEFAULT NULL,
  `role`          ENUM('student','admin','moderator') DEFAULT 'student',
  `avg_rating`    FLOAT         DEFAULT 0,
  `total_reviews` INT(11)       DEFAULT 0,
  `is_active`     TINYINT(1)    DEFAULT 1,
  `created_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Restore existing user (password: your original password unchanged)
INSERT INTO `user` VALUES (2,'Tanvir Rahaman Pranto','tpranto2331028@bscse.uiu.ac.bd','$2y$12$qiubq90.8K.E3QRwQdw/ouPw/ZaFbMyTvdUMkTtrKCr8EJea2VvsO','01629671648','0112331028','CSE',NULL,'uploads/id_cards/id_0112331028_1780248525.jpeg','student',0,0,1,'2026-05-31 23:28:45','2026-05-31 23:28:45');

-- ── 2. LOAN REQUEST ───────────────────────────────────────────────
DROP TABLE IF EXISTS `loan_request`;
CREATE TABLE `loan_request` (
  `loan_id`            INT(11)  NOT NULL AUTO_INCREMENT,
  `borrower_id`        INT(11)  NOT NULL,
  `amount`             FLOAT    NOT NULL,
  `purpose`            VARCHAR(200) DEFAULT NULL,
  `reason_details`     TEXT     DEFAULT NULL,
  `repayment_deadline` DATE     DEFAULT NULL,
  `max_interest_rate`  FLOAT    DEFAULT NULL,
  `conditions`         TEXT     DEFAULT NULL,
  `status`             ENUM('open','funded','closed','cancelled') DEFAULT 'open',
  `views_count`        INT(11)  DEFAULT 0,
  `created_at`         DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`loan_id`),
  KEY `borrower_id` (`borrower_id`),
  CONSTRAINT `loan_request_ibfk_1` FOREIGN KEY (`borrower_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 3. LOAN OFFER (must come before loan_agreement) ───────────────
DROP TABLE IF EXISTS `loan_offer`;
CREATE TABLE `loan_offer` (
  `offer_id`            INT(11)  NOT NULL AUTO_INCREMENT,
  `loan_id`             INT(11)  NOT NULL,
  `lender_id`           INT(11)  NOT NULL,
  `interest_rate`       FLOAT    DEFAULT NULL,
  `conditions`          TEXT     DEFAULT NULL,
  `message_to_borrower` TEXT     DEFAULT NULL,
  `status`              ENUM('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
  `offered_at`          DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_id`),
  KEY `loan_id` (`loan_id`),
  KEY `lender_id` (`lender_id`),
  CONSTRAINT `loan_offer_ibfk_1` FOREIGN KEY (`loan_id`)   REFERENCES `loan_request` (`loan_id`) ON DELETE CASCADE,
  CONSTRAINT `loan_offer_ibfk_2` FOREIGN KEY (`lender_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 4. LOAN AGREEMENT (depends on loan_offer) ─────────────────────
DROP TABLE IF EXISTS `loan_agreement`;
CREATE TABLE `loan_agreement` (
  `agreement_id`      INT(11) NOT NULL AUTO_INCREMENT,
  `loan_id`           INT(11) NOT NULL,
  `offer_id`          INT(11) NOT NULL,
  `borrower_id`       INT(11) NOT NULL,
  `lender_id`         INT(11) NOT NULL,
  `principal_amount`  FLOAT   NOT NULL,
  `interest_rate`     FLOAT   DEFAULT NULL,
  `total_payable`     FLOAT   DEFAULT NULL,
  `agreed_conditions` TEXT    DEFAULT NULL,
  `start_date`        DATE    DEFAULT NULL,
  `due_date`          DATE    DEFAULT NULL,
  `repayment_status`  ENUM('pending','partial','completed','defaulted') DEFAULT 'pending',
  `created_at`        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`agreement_id`),
  KEY `loan_id`     (`loan_id`),
  KEY `offer_id`    (`offer_id`),
  KEY `borrower_id` (`borrower_id`),
  KEY `lender_id`   (`lender_id`),
  CONSTRAINT `loan_agreement_ibfk_1` FOREIGN KEY (`loan_id`)     REFERENCES `loan_request` (`loan_id`) ON DELETE CASCADE,
  CONSTRAINT `loan_agreement_ibfk_2` FOREIGN KEY (`offer_id`)    REFERENCES `loan_offer`   (`offer_id`) ON DELETE CASCADE,
  CONSTRAINT `loan_agreement_ibfk_3` FOREIGN KEY (`borrower_id`) REFERENCES `user`         (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `loan_agreement_ibfk_4` FOREIGN KEY (`lender_id`)   REFERENCES `user`         (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 5. REPAYMENT ──────────────────────────────────────────────────
DROP TABLE IF EXISTS `repayment`;
CREATE TABLE `repayment` (
  `repayment_id`    INT(11) NOT NULL AUTO_INCREMENT,
  `agreement_id`    INT(11) NOT NULL,
  `amount_paid`     FLOAT   NOT NULL,
  `paid_on`         DATE    NOT NULL,
  `payment_method`  ENUM('bkash','nagad','bank','cash','other') DEFAULT NULL,
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `note`            TEXT    DEFAULT NULL,
  `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`repayment_id`),
  KEY `agreement_id` (`agreement_id`),
  CONSTRAINT `repayment_ibfk_1` FOREIGN KEY (`agreement_id`) REFERENCES `loan_agreement` (`agreement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 6. MESSAGE (chat inside agreement room) ───────────────────────
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `message_id`  INT(11) NOT NULL AUTO_INCREMENT,
  `agreement_id` INT(11) DEFAULT NULL,
  `sender_id`   INT(11) NOT NULL,
  `receiver_id` INT(11) NOT NULL,
  `content`     TEXT    NOT NULL,
  `is_read`     TINYINT(1) DEFAULT 0,
  `sent_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `agreement_id` (`agreement_id`),
  KEY `sender_id`    (`sender_id`),
  KEY `receiver_id`  (`receiver_id`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`agreement_id`) REFERENCES `loan_agreement` (`agreement_id`) ON DELETE SET NULL,
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`sender_id`)    REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `message_ibfk_3` FOREIGN KEY (`receiver_id`)  REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 7. CAMPAIGN ───────────────────────────────────────────────────
DROP TABLE IF EXISTS `campaign`;
CREATE TABLE `campaign` (
  `campaign_id`      INT(11)  NOT NULL AUTO_INCREMENT,
  `creator_id`       INT(11)  NOT NULL,
  `title`            VARCHAR(200) NOT NULL,
  `description`      TEXT     DEFAULT NULL,
  `target_amount`    FLOAT    NOT NULL,
  `collected_amount` FLOAT    DEFAULT 0,
  `category`         VARCHAR(100) DEFAULT NULL,
  `cover_image`      VARCHAR(255) DEFAULT NULL,
  `proof_document`   VARCHAR(255) DEFAULT NULL,
  `status`           ENUM('active','completed','cancelled','paused') DEFAULT 'active',
  `views_count`      INT(11)  DEFAULT 0,
  `deadline`         DATE     DEFAULT NULL,
  `created_at`       DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`campaign_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `campaign_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 8. DONATION ───────────────────────────────────────────────────
DROP TABLE IF EXISTS `donation`;
CREATE TABLE `donation` (
  `donation_id`     INT(11) NOT NULL AUTO_INCREMENT,
  `campaign_id`     INT(11) NOT NULL,
  `donor_id`        INT(11) DEFAULT NULL,
  `amount`          FLOAT   NOT NULL,
  `payment_method`  ENUM('bkash','nagad','bank','cash','other') DEFAULT NULL,
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `message`         TEXT    DEFAULT NULL,
  `is_anonymous`    TINYINT(1) DEFAULT 0,
  `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`donation_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `donor_id`    (`donor_id`),
  CONSTRAINT `donation_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `donation_ibfk_2` FOREIGN KEY (`donor_id`)    REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 9. CAMPAIGN COMMENT ───────────────────────────────────────────
DROP TABLE IF EXISTS `campaign_comment`;
CREATE TABLE `campaign_comment` (
  `comment_id`  INT(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` INT(11) NOT NULL,
  `user_id`     INT(11) NOT NULL,
  `content`     TEXT    NOT NULL,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id`     (`user_id`),
  CONSTRAINT `campaign_comment_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_comment_ibfk_2` FOREIGN KEY (`user_id`)     REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 10. REVIEW ────────────────────────────────────────────────────
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `review_id`   INT(11) NOT NULL AUTO_INCREMENT,
  `reviewer_id` INT(11) NOT NULL,
  `reviewee_id` INT(11) NOT NULL,
  `rating`      TINYINT(1) NOT NULL,
  `comment`     TEXT    DEFAULT NULL,
  `agreement_id` INT(11) DEFAULT NULL,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `reviewer_id`  (`reviewer_id`),
  KEY `reviewee_id`  (`reviewee_id`),
  KEY `agreement_id` (`agreement_id`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`reviewer_id`)  REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`reviewee_id`)  REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_3` FOREIGN KEY (`agreement_id`) REFERENCES `loan_agreement` (`agreement_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 11. NOTIFICATION ──────────────────────────────────────────────
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `notification_id` INT(11)  NOT NULL AUTO_INCREMENT,
  `user_id`         INT(11)  NOT NULL,
  `title`           VARCHAR(200) DEFAULT NULL,
  `body`            TEXT     DEFAULT NULL,
  `type`            ENUM('info','alert','success','warning') DEFAULT NULL,
  `reference_id`    INT(11)  DEFAULT NULL,
  `reference_type`  VARCHAR(50) DEFAULT NULL,
  `is_read`         TINYINT(1) DEFAULT 0,
  `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 12. PAYMENT METHOD ────────────────────────────────────────────
DROP TABLE IF EXISTS `payment_method`;
CREATE TABLE `payment_method` (
  `method_id`      INT(11)  NOT NULL AUTO_INCREMENT,
  `user_id`        INT(11)  NOT NULL,
  `type`           ENUM('bkash','nagad','bank','cash','other') NOT NULL DEFAULT 'bkash',
  `account_number` VARCHAR(100) NOT NULL,
  `account_name`   VARCHAR(100) NOT NULL,
  `is_default`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`method_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payment_method_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 13. REPORT ────────────────────────────────────────────────────
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report` (
  `report_id`    INT(11) NOT NULL AUTO_INCREMENT,
  `reporter_id`  INT(11) NOT NULL,
  `reported_id`  INT(11) DEFAULT NULL,
  `type`         VARCHAR(50) DEFAULT NULL,
  `reason`       TEXT    DEFAULT NULL,
  `reference_id` INT(11) DEFAULT NULL,
  `status`       ENUM('open','reviewed','resolved') DEFAULT 'open',
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `reporter_id` (`reporter_id`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
--  DONE. All 13 tables created in correct dependency order.
--  The existing user (Tanvir Rahaman Pranto) has been restored.
-- ================================================================
