/* =========================================================================
   Login Form
   -------------------------------------------------------------------------
   Owns every DOM event on the login form (submit, typing, clicking
   "Forgot password?"). When something needs to happen as a result — show
   a toast, clear an error — this file either calls that function
   directly (SmartCareFormHelpers.showError()) or publishes an event
   through NotificationCenter (login:attempt / login:success /
   login:failed), which is what actually triggers the toast.

   Event source  → the submit button (.submit-btn) inside #loginForm
   Event listener → the form's 'submit' event, below
   Event handler  → the function attached to that listener, which checks
                     the inputs and then calls PHP to do the real check.

   Processing mode: SYNCHRONOUS. Submission uses a synchronous
   XMLHttpRequest (see submitSync() below), so the browser can't do
   anything else — repaint, respond to clicks, accept typing — until
   php/login.php finishes (it deliberately sleeps for ~2 seconds so the
   freeze is actually visible). This is the intentional contrast with
   the sign-up form, which uses async fetch() and stays responsive the
   whole time — compare js/signup-form.js.
   ========================================================================= */
(function () {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const passwordHint = document.getElementById("passwordHint");
  const submitBtn = form.querySelector(".submit-btn");

  // ---- Clear inline errors as the user types ----
  [email, password].forEach((el) => {
    el.addEventListener("input", () =>
      SmartCareFormHelpers.showError(el, false),
    );
  });

  // ---- "Forgot password?" click ----
  // Now a real page (auth/forgot-password.php) with its own form, so this
  // link just navigates there normally — nothing to intercept here anymore.

  /* =======================================================================
     Focus / Blur event demo
     -----------------------------------------------------------------------
     Event source  → the password field
     Event listener → 'focus' and 'blur'
     Event handler  → show/hide a small hint while the field is focused.
     ========================================================================= */
  password.addEventListener("focus", () => {
    if (passwordHint) passwordHint.style.display = "block";
  });
  password.addEventListener("blur", () => {
    if (passwordHint) passwordHint.style.display = "none";
  });

  password.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      form.requestSubmit();
    }
  });

  /* =======================================================================
     Event propagation demo (capturing vs. bubbling)
     -----------------------------------------------------------------------
     Purely for demonstration — these just log to the console and don't
     affect the actual login logic below. Click the Login button and
     check the console (F12):
       1. #loginPanel's CAPTURING listener fires first (it's registered
          with `true`, so it runs on the way down to the button).
       2. The button's own click listener fires next (the target phase).
       3. #loginPanel's BUBBLING listener fires last (the default phase,
          on the way back up).
     ========================================================================= */
  const loginPanel = document.getElementById("loginPanel");

  loginPanel.addEventListener(
    "click",
    () => {
      console.log("[Propagation] #loginPanel — CAPTURING phase");
    },
    true,
  );

  submitBtn.addEventListener("click", () => {
    console.log("[Propagation] Login button — target phase");
  });

  loginPanel.addEventListener(
    "click",
    () => {
      console.log("[Propagation] #loginPanel — BUBBLING phase");
    },
    false,
  );

  // ---- Form submission ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (submitBtn.classList.contains("loading")) return; // guard against double submits

    let valid = true;
    if (email.value.trim() === "") {
      SmartCareFormHelpers.showError(email, true, "Enter your email address.");
      valid = false;
    } else if (!SmartCareValidators.isValidEmail(email.value.trim())) {
      SmartCareFormHelpers.showError(
        email,
        true,
        "Enter a valid email address.",
      );
      valid = false;
    }
    if (password.value.trim() === "") {
      SmartCareFormHelpers.showError(password, true, "Enter your password.");
      valid = false;
    }

    if (!valid) return;

    NotificationCenter.publish("login:attempt", { email: email.value.trim() });

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    const body = new FormData(form); // includes the hidden csrf_token field automatically
    submitSync(body);
  });

  /* =======================================================================
     Submission — SYNCHRONOUS mode.
     -----------------------------------------------------------------------
     xhr.open(..., false) is what makes this synchronous: xhr.send() does
     not return until the whole request/response cycle is done. While it's
     blocked, the browser cannot repaint or handle any other input — the
     spinner won't spin, clicks won't register, and typing in another
     field won't show up until this function returns. That "everything
     stops" behavior is the whole point of this demo (contrast with
     signup-form.js, which uses non-blocking fetch()).
     ========================================================================= */
  function submitSync(body) {
    const xhr = new XMLHttpRequest();
    xhr.open(form.method, form.action, false); // false = synchronous

    try {
      xhr.send(body);
      finishSubmit();

      const data = JSON.parse(xhr.responseText);
      handleLoginResponse(data);
    } catch (err) {
      finishSubmit();
      NotificationCenter.publish("login:failed", {
        message: "Couldn't reach the server. Please try again.",
      });
    }
  }

  function finishSubmit() {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }

  function handleLoginResponse(data) {
    if (data.success) {
      form.reset();
      SmartCareFormHelpers.clearFieldStates([email, password]);
      NotificationCenter.publish("login:success", {
        message: data.message,
        redirect: data.redirect,
      });
    } else {
      if (data.errors) {
        Object.keys(data.errors).forEach((id) => {
          const el = document.getElementById(id);
          if (el) SmartCareFormHelpers.showError(el, true, data.errors[id]);
        });
      }
      // Wrong credentials (no field-level detail from the server) is
      // reported through NotificationCenter's toast + message area only —
      // no inline field marking, since it'd just repeat the same message.
      password.value = "";
      password.focus();
      NotificationCenter.publish("login:failed", { message: data.message });
    }
  }
})();
