<?php
/* =========================================================================
   Config / Bootstrap
   -------------------------------------------------------------------------
   Every PHP endpoint in this folder starts with `require __DIR__ . '/config.php';`
   It does three small things:
     1. Starts the session with a couple of safer cookie defaults.
     2. Makes sure a CSRF token exists for this session.
     3. Defines two tiny helpers (json_response, check_csrf) used everywhere
        else, so each endpoint file stays short and focused on its own form.
   Nothing in this file talks to the database — that's php/db.php, which
   every endpoint requires separately.
   ========================================================================= */

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
function json_response(bool $success, string $message, array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

/**
 * Reject the request if the csrf_token field doesn't match the session's.
 */
function check_csrf(): void {
    $sent = $_POST['csrf_token'] ?? '';
    if ($sent === '' || !hash_equals($_SESSION['csrf_token'], $sent)) {
        json_response(false, 'Your session expired. Please refresh the page and try again.');
    }
}
