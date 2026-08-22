<?php
require __DIR__ . '/includes/bootstrap.php';

if ($currentUser) {
    $dashboard = $currentUser['role'] === 'staff'
        ? 'dashboard/admin/dashboard.php'
        : 'dashboard/patient/dashboard.php';
    header('Location: ' . $dashboard);
    exit;
}

header('Location: auth/login.php');
exit;