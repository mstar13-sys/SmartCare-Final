(function () {
  "use strict";

  const STRENGTH_COLORS = ["#ba1a1a", "#e08a2c", "#2c9ee0", "#1fb5ad", "#51d8d1"];
  const STRENGTH_NAMES = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  function create(passwordInput, strengthBlock, confirmInput = null) {
    if (!passwordInput || !strengthBlock || typeof SmartCareValidators === "undefined") return null;

    const strengthBars = strengthBlock.querySelectorAll(".bars i");
    const strengthLabel = strengthBlock.querySelector(".label");

    function evaluate(value) {
      const checks = SmartCareValidators.checkPasswordRules(value);
      const metCount = Object.values(checks).filter(Boolean).length;

      Object.keys(checks).forEach((rule) => {
        const item = strengthBlock.querySelector(`.req-list li[data-rule="${rule}"]`);
        if (item) item.classList.toggle("met", checks[rule]);
      });

      strengthBars.forEach((bar, index) => {
        const isFilled = value.length > 0 && index < metCount;
        bar.classList.toggle("filled", isFilled);
        bar.style.setProperty("--dot-color", isFilled ? STRENGTH_COLORS[metCount - 1] : "");
      });

      strengthLabel.textContent = value.length === 0 ? "Password strength" : STRENGTH_NAMES[Math.max(metCount - 1, 0)];
      strengthLabel.style.color = value.length === 0 ? "" : STRENGTH_COLORS[Math.max(metCount - 1, 0)];
      return checks;
    }

    function reset() {
      strengthBars.forEach((bar) => {
        bar.classList.remove("filled");
        bar.style.removeProperty("--dot-color");
      });
      strengthLabel.textContent = "Password strength";
      strengthLabel.style.color = "";
      strengthBlock.querySelectorAll(".req-list li").forEach((item) => item.classList.remove("met"));
    }

    passwordInput.addEventListener("input", () => {
      evaluate(passwordInput.value);
      if (window.SmartCareFormHelpers) SmartCareFormHelpers.showError(passwordInput, false);

      if (confirmInput?.value && window.SmartCareFormHelpers) {
        const mismatch = confirmInput.value !== passwordInput.value;
        SmartCareFormHelpers.showError(confirmInput, mismatch, mismatch ? "Passwords don't match." : "");
      }
    });
    passwordInput.form?.addEventListener("reset", () => window.setTimeout(reset, 0));

    return { evaluate, reset };
  }

  const signupPassword = document.getElementById("signupPassword");
  const signupStrength = document.getElementById("strengthBlock");
  const signupInstance = create(signupPassword, signupStrength, document.getElementById("confirmPassword"));
  if (signupInstance) window.SmartCarePasswordStrength = signupInstance;

  document.querySelectorAll("[data-password-strength-for]").forEach((block) => {
    if (block === signupStrength) return;
    create(document.getElementById(block.dataset.passwordStrengthFor), block);
  });

  window.SmartCarePasswordStrengthFactory = { create };
})();
