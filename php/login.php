<?php
require __DIR__ . '/config.php';
require __DIR__ . '/validators.php';
require __DIR__ . '/db.php'; // gives us $pdo

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method.');
}

check_csrf();

$email    = trim($_POST['loginEmail'] ?? '');
$password = $_POST['loginPassword'] ?? '';

$errors = [];
if ($email === '') {
    $errors['loginEmail'] = 'Enter your email address.';
} elseif (!is_valid_email($email)) {
    $errors['loginEmail'] = 'Enter a valid email address.';
}
if ($password === '') $errors['loginPassword'] = 'Enter your password.';

if ($errors) {
    json_response(false, 'Please fix the highlighted fields.', ['errors' => $errors]);
}

sleep(2);

// ---- Look the account up and verify the password ----
$stmt = $pdo->prepare('SELECT id, full_name, password_hash, role FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => strtolower($email)]);
$account = $stmt->fetch();

if ($account && password_verify($password, $account['password_hash'])) {
    // Regenerate the session ID on privilege change (login) to prevent
    // session fixation — cheap to do, good habit to keep.
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'    => $account['id'],
        'name'  => $account['full_name'],
        'email' => strtolower($email),
        'role'  => $account['role'],
    ];

    json_response(true, "You have been logged in securely. Welcome, {$account['full_name']}.");
}

json_response(false, 'Incorrect email or password. Please try again.');
