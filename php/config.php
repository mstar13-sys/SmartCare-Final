<?php

session_start([
    'cookie_httponly' => true,   // JS can't read the session cookie
    'cookie_samesite' => 'Lax',  // basic CSRF protection at the cookie level
]);

header('Content-Type: application/json');

// One CSRF token per session. php/csrf.php hands this to the page on load;
// every form submission sends it back and we compare the two.
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

/**
 * Send a JSON response and stop. Every endpoint ends with one of these.
 */
function json_response(bool $success, string $message, array $extra = []): void
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

//  * Reject the request if the csrf_token field doesn't match the session's.
function check_csrf(): void
{
    $sent = $_POST['csrf_token'] ?? '';
    if ($sent === '' || !hash_equals($_SESSION['csrf_token'], $sent)) {
        json_response(false, 'Your session expired. Please refresh the page and try again.');
    }
}
