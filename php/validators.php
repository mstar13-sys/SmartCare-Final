<?php
/* =========================================================================
   Validators
   -------------------------------------------------------------------------
   Server-side twin of js/validators.js. Same three rules, same names,
   just in PHP — because the JS checks only give a nice UI hint, and can
   always be skipped (devtools, curl, a disabled script). Nothing here
   should be trusted to run alone on the client; this is the copy that
   actually decides whether a signup is accepted.
   ========================================================================= */

function is_valid_email(string $value): bool {
    // filter_var(FILTER_VALIDATE_EMAIL) alone is too permissive here — it
    // happily accepts junk domains like "user@abc.c" (1-character TLD) or
    // "user@abc" without a real TLD at all. This regex is the same one
    // used client-side in js/validators.js: it requires a proper domain
    // ending in a letters-only TLD of at least 2 characters, without
    // limiting which domain it has to be (gmail.com, smartcare.com,
    // yahoo.co.uk, and so on all still pass).
    return (bool) preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/', $value);
}

function is_valid_phone(string $value): bool {
    // Same fix as js/validators.js: only allow phone-ish characters, but
    // also require a real number of digits, not just 7+ characters total
    // (the old regex let a string of nothing but dashes/spaces through).
    if (!preg_match('/^[+()\-.\s0-9]+$/', $value)) {
        return false;
    }
    $digitCount = strlen(preg_replace('/[^0-9]/', '', $value));
    return $digitCount >= 7 && $digitCount <= 15;
}

function check_password_rules(string $value): array {
    return [
        'len'     => strlen($value) >= 8,
        'upper'   => (bool) preg_match('/[A-Z]/', $value),
        'num'     => (bool) preg_match('/[0-9]/', $value),
        'special' => (bool) preg_match('/[^A-Za-z0-9]/', $value),
    ];
}

function password_rules_passed(array $checks): bool {
    return !in_array(false, $checks, true);
}

/**
 * Strip common formatting characters (spaces, dashes, dots, parentheses)
 * from a phone number so "0917 123 4567", "0917-123-4567", and
 * "(0917) 123.4567" all compare as the same number. Used both to check
 * for duplicates and, ideally, on the SQL side via the matching
 * normalize_phone_sql() expression below.
 */
function normalize_phone(string $value): string {
    return preg_replace('/[\s\-\.\(\)]+/', '', $value);
}

/**
 * SQL expression that applies the same normalization as normalize_phone()
 * directly inside a query, so "already registered?" checks catch numbers
 * saved with different punctuation/spacing than what's being typed now.
 */
function normalize_phone_sql(string $column): string {
    return "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($column, ' ', ''), '-', ''), '.', ''), '(', ''), ')', '')";
}
