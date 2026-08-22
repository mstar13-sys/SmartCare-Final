/* =========================================================================
   Validators
   -------------------------------------------------------------------------
   Pure functions only: no DOM access, no events. Keeping validation logic
   free of side effects makes it trivial to unit test on its own and to
   reuse from any form module.
   ========================================================================= */
const SmartCareValidators = (() => {
  // Requires a real-looking domain: at least one label, then a final
  // TLD made of letters only, at least 2 characters (e.g. .com, .co,
  // .ph). This is what rejects domains like "abc" (no dot at all) or
  // "abc.c" (1-character TLD), while still accepting any properly
  // formed domain — @gmail.com, @smartcare.com, @yahoo.co.uk, etc. —
  // without needing a hardcoded list of allowed domains.
  function isValidEmail(value) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    // Allow common formatting characters (spaces, dashes, dots, parens,
    // a leading +), but — unlike the old regex — actually require a
    // sane number of real digits. Something like "-------" (seven
    // dashes, zero digits) used to slip through as "valid" because the
    // old check only counted total characters, not digits.
    if (!/^[+()\-.\s0-9]+$/.test(value)) return false;
    const digitCount = (value.match(/[0-9]/g) || []).length;
    return digitCount == 11;
  }

  function checkPasswordRules(value) {
    return {
      len:      value.length >= 8,
      upper:    /[A-Z]/.test(value),
      num:      /[0-9]/.test(value),
      special:  /[^A-Za-z0-9]/.test(value)
    };
  }

  function passwordRulesPassed(checks) {
    return Object.values(checks).every(Boolean);
  }

  return { isValidEmail, isValidPhone, checkPasswordRules, passwordRulesPassed };
})();
