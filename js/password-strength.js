
(function () {
  const signupPassword = document.getElementById("signupPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const strengthBars = document.querySelectorAll("#strengthBlock .bars i");
  const strengthLabel = document.getElementById("strengthLabel");

  const STRENGTH_COLORS = ["#ba1a1a", "#e08a2c", "#2c9ee0", "#1fb5ad", "#51d8d1"];
  const STRENGTH_NAMES = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  function evaluate(value) {
    const checks = SmartCareValidators.checkPasswordRules(value);
    const metCount = Object.values(checks).filter(Boolean).length;

    Object.keys(checks).forEach((rule) => {
      const li = document.querySelector(`.req-list li[data-rule="${rule}"]`);
      if (li) li.classList.toggle("met", checks[rule]);
    });

    strengthBars.forEach((bar, i) => {
      const isFilled = value.length > 0 && i < metCount;
      bar.classList.toggle("filled", isFilled);
      bar.style.setProperty(
        "--dot-color",
        isFilled ? STRENGTH_COLORS[metCount - 1] : "",
      );
    });

    strengthLabel.textContent =
      value.length === 0
        ? "Password strength"
        : STRENGTH_NAMES[Math.max(metCount - 1, 0)];
    strengthLabel.style.color =
      value.length === 0 ? "" : STRENGTH_COLORS[Math.max(metCount - 1, 0)];

    // Keep the strength indicator visible once the user enters a password.
    // if (value.length === 0) {
    //   strengthLabel.textContent = "Password strength";
    //   strengthLabel.style.color = "";
    // } else {
    //   strengthLabel.textContent = STRENGTH_NAMES[Math.max(metCount - 1, 0)];
    //   strengthLabel.style.color = STRENGTH_COLORS[Math.max(metCount - 1, 0)];
    // }

    return checks;
  }

  function reset() {
    strengthBars.forEach((bar) => {
      bar.classList.remove("filled");
      bar.style.removeProperty("--dot-color");
    });
    strengthLabel.textContent = "Password strength";
    strengthLabel.style.color = "";
    document
      .querySelectorAll(".req-list li")
      .forEach((li) => li.classList.remove("met"));
  }

  // ---- Event source: keystrokes in the password field ----
  signupPassword.addEventListener("input", () => {
    evaluate(signupPassword.value);
    SmartCareFormHelpers.showError(signupPassword, false);

    if (confirmPassword.value) {
      const mismatch = confirmPassword.value !== signupPassword.value;
      SmartCareFormHelpers.showError(
        confirmPassword,
        mismatch,
        mismatch ? "Passwords don't match." : "",
      );
    }
  });

  // ---- Exposed so signup-form.js can reuse this logic at submit time ----
  window.SmartCarePasswordStrength = { evaluate, reset };
})();
