/* =========================================================================
   Sign Up Form
   -------------------------------------------------------------------------
   Mirrors login-form.js: owns all DOM events for the signup form. Reuses
   SmartCarePasswordStrength (from password-strength.js) so the pass/fail
   rules used at submit time are guaranteed to match what the user sees
   live in the meter. After a successful signup it redirects to
   login.php.

   Processing mode: ASYNCHRONOUS. Submission uses fetch(), so the browser
   keeps painting and responding to input the whole time php/signup.php
   is working — the spinner keeps spinning, and the page never locks up.
   This is the intentional contrast with the login form, which uses a
   blocking synchronous XMLHttpRequest and freezes while it waits —
   compare js/login-form.js.
   ========================================================================= */
(function () {
  const form = document.getElementById("signupForm");
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("signupEmail");
  const phone = document.getElementById("phone");
  const password = document.getElementById("signupPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");

  // ---- Clear inline errors as the user types / checks the box ----
  [fullName, email, phone].forEach((el) => {
    el.addEventListener("input", () =>
      SmartCareFormHelpers.showError(el, false),
    );
  });
  terms.addEventListener("change", () =>
    SmartCareFormHelpers.showError(terms, false),
  );

  // ---- Confirm-password gets its own live check, not just "clear on type" ----
  // Bug this replaces: the old generic handler wiped the error the moment
  // you typed anything into this field, even while it still didn't match
  // the password above — so the red border would vanish on a mismatched
  // value and only come back at submit. Now it re-checks the match on
  // every keystroke instead of blindly clearing.
  confirmPassword.addEventListener("input", () => {
    if (confirmPassword.value === "") {
      SmartCareFormHelpers.showError(confirmPassword, false);
      return;
    }
    const mismatch = confirmPassword.value !== password.value;
    SmartCareFormHelpers.showError(
      confirmPassword,
      mismatch,
      mismatch ? "Passwords don't match." : "",
    );
  });

  // ---- Form submission ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const btn = form.querySelector(".submit-btn");
    if (btn.classList.contains("loading")) return; // guard against double submits

    let valid = true;

    if (fullName.value.trim().length < 2) {
      SmartCareFormHelpers.showError(
        fullName,
        true,
        "Enter your full name (at least 2 characters).",
      );
      valid = false;
    }
    if (!SmartCareValidators.isValidEmail(email.value.trim())) {
      SmartCareFormHelpers.showError(
        email,
        true,
        "Enter a valid email address.",
      );
      valid = false;
    }
    if (!SmartCareValidators.isValidPhone(phone.value.trim())) {
      SmartCareFormHelpers.showError(
        phone,
        true,
        "Enter a valid phone number (11 digits).",
      );
      valid = false;
    }

    const checks = SmartCarePasswordStrength.evaluate(password.value);
    if (!SmartCareValidators.passwordRulesPassed(checks)) {
      SmartCareFormHelpers.showError(
        password,
        true,
        "Password doesn't meet all the requirements above.",
      );
      valid = false;
    }

    const matchOk =
      confirmPassword.value !== "" && confirmPassword.value === password.value;
    if (!matchOk) {
      const msg =
        confirmPassword.value === ""
          ? "Re-enter your password to confirm it."
          : "Passwords don't match.";
      SmartCareFormHelpers.showError(confirmPassword, true, msg);
      valid = false;
    }

    if (!terms.checked) {
      SmartCareFormHelpers.showError(
        terms,
        true,
        "Please accept the Terms and Privacy Policy to continue.",
      );
      valid = false;
    }

    if (!valid) return;

    btn.classList.add("loading");
    btn.disabled = true;

    const body = new FormData(form); // includes the hidden csrf_token field automatically

    fetch("../php/signup.php", { method: "POST", body })
      .then((res) => res.json())
      .then((data) => {
        btn.classList.remove("loading");
        btn.disabled = false;

        if (data.success) {
          form.reset();
          SmartCareFormHelpers.clearFieldStates(form.querySelectorAll("input"));
          SmartCarePasswordStrength.reset();

          showSuccessDialog({
            title: "Account created!",
            text: data.message,
            confirmButtonText: "Okay",
            onConfirm: () => {
              window.location.href = "login.php";
            },
          });
        } else {
          if (data.errors) {
            Object.keys(data.errors).forEach((id) => {
              const el = document.getElementById(id);
              if (el) SmartCareFormHelpers.showError(el, true, data.errors[id]);
            });
          }
          showToast({
            type: "error",
            title: "Sign up failed",
            body: data.message,
          });
        }
      })
      .catch(() => {
        btn.classList.remove("loading");
        btn.disabled = false;
        showToast({
          type: "error",
          title: "Connection problem",
          body: "Couldn't reach the server. Please try again.",
        });
      });
  });
})();
