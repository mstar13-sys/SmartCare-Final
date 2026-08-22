-- =========================================================================
-- SmartCare database schema
-- -------------------------------------------------------------------------
-- Run this once to create the database and its one table. From a terminal:
--
--   mysql -u root -p < database/smartcare.sql
--
-- ...or paste it into phpMyAdmin / Adminer / your MySQL client of choice.
-- One table is all this app needs: `users`, matching exactly the fields
-- already collected by the sign-up form (full name, email, phone,
-- password, role).
-- =========================================================================

CREATE DATABASE IF NOT EXISTS smartcare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartcare;

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL,
    phone         VARCHAR(30)         NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    role          ENUM('patient','staff') NOT NULL DEFAULT 'patient',
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Already have this table from an older version of this file? ----
-- The phone UNIQUE constraint above only applies to fresh installs.
-- Run this once against an existing database to add it retroactively
-- (it will fail loudly if duplicate phone numbers already exist —
-- clean those up first, then re-run it):
--   ALTER TABLE users ADD UNIQUE KEY uq_users_phone (phone);

-- ---- Seed the same demo account the README and login form mention ----
-- Password is "Demo1234!" — already hashed with PHP's password_hash(),
-- the same function php/signup.php uses for every new account.
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES (
    'Demo Patient',
    'demo@smartcare.com',
    '0917 123 4567',
    '$2y$10$iM4w4CwGpJipFuoI8IusceeRm.t5Hd3sgwsIsQQXJuOaqUObl21PC',
    'patient'
)
ON DUPLICATE KEY UPDATE email = email;
