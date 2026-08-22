/* =========================================================================
   Validators
   -------------------------------------------------------------------------
   Pure functions only: no DOM access, no events. Keeping validation logic
   free of side effects makes it trivial to unit test on its own and to
   reuse from any form module.
   ========================================================================= */
const SmartCareValidators = (() => {
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
