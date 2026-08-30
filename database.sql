-- SmartCare database setup
-- Import this file in phpMyAdmin, Adminer, or MySQL.

CREATE DATABASE IF NOT EXISTS smartcare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartcare;

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('patient', 'staff', 'superadmin') NOT NULL DEFAULT 'patient',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Already have this table without the 'superadmin' role? ----
-- Run this once against an existing database, then promote an account:
--   ALTER TABLE users MODIFY role ENUM('patient','staff','superadmin') NOT NULL DEFAULT 'patient';
--   UPDATE users SET role = 'superadmin' WHERE email = 'the-account@example.com';


-- Demo login: demo@smartcare.com / Demo1234!
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES (
    'Demo Patient',
    'demo@smartcare.com',
    '0917 123 4567',
    '$2y$10$iM4w4CwGpJipFuoI8IusceeRm.t5Hd3sgwsIsQQXJuOaqUObl21PC',
    'patient'
)
ON DUPLICATE KEY UPDATE email = email;
