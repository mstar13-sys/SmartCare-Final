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

   Submission posts to php/login.php with fetch() — non-blocking, so the
   spinner in the button (.submit-btn.loading .spinner) actually gets to
   animate while php/login.php does its work, instead of the page
   freezing solid for a couple of seconds with no visual feedback at all.
   The quick checks below still run first purely for instant feedback —
   php/login.php re-checks everything server-side regardless, since a
   request can always skip the browser. The CSRF token doesn't need any
   JS at all: it's a hidden field already inside the form, so
   FormData(form) picks it up automatically.
   ========================================================================= */
(function () {
  const form        = document.getElementById('loginForm');
  const pane        = document.getElementById('paneLogin') || form;
  const email       = document.getElementById('loginEmail');
  const password    = document.getElementById('loginPassword');
  const forgotLink  = document.getElementById('forgotLink');
  const submitBtn   = form.querySelector('.submit-btn');

  // ---- Clear inline errors as the user types ----
  [email, password].forEach((el) => {
    el.addEventListener('input', () => SmartCareFormHelpers.showError(el, false));
  });

  // ---- "Forgot password?" click ----
  if (forgotLink) forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Check your inbox',
      body: 'If an account exists, a reset link is on its way.'
    });
  });

  /* =======================================================================
     Event propagation demo (capturing vs. bubbling)
     -----------------------------------------------------------------------
     Purely for demonstration — these just log to the console and don't
     affect the actual login logic below. Click the Login button and
     check the console (F12):
       1. paneLogin's CAPTURING listener fires first (it's registered
          with `true`, so it runs on the way down to the button).
       2. The button's own click listener fires next (the target phase).
       3. paneLogin's BUBBLING listener fires last (the default phase,
          on the way back up).
     ========================================================================= */
  pane.addEventListener('click', () => {
    console.log('[Propagation] paneLogin — CAPTURING phase');
  }, true);

  submitBtn.addEventListener('click', () => {
    console.log('[Propagation] Login button — target phase');
  });

  pane.addEventListener('click', () => {
    console.log('[Propagation] paneLogin — BUBBLING phase');
  }, false);

  // ---- Form submission ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (submitBtn.classList.contains('loading')) return; // guard against double submits

    let valid = true;
    if (email.value.trim() === '')    { SmartCareFormHelpers.showError(email, true, 'Enter your email or username.'); valid = false; }
    if (password.value.trim() === '') { SmartCareFormHelpers.showError(password, true, 'Enter your password.');       valid = false; }

    if (!valid) return;

    NotificationCenter.publish('login:attempt', { email: email.value.trim() });

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const body = new FormData(form); // includes the hidden csrf_token field automatically
    submitAsync(body);
  });

  /* =======================================================================
     Submission — fetch() is non-blocking, so the browser keeps painting
     (and the button's spinner keeps spinning) the whole time php/login.php
     is working, instead of the page locking up with no feedback.
     ========================================================================= */
  function submitAsync(body) {
    fetch('../php/login.php', { method: 'POST', body })
      .then((res) => res.json())
      .then((data) => {
        finishSubmit();
        handleLoginResponse(data);
      })
      .catch(() => {
        finishSubmit();
        NotificationCenter.publish('login:failed', { message: "Couldn't reach the server. Please try again." });
      });
  }

  function finishSubmit() {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }

  function handleLoginResponse(data) {
    if (data.success) {
      form.reset();
      SmartCareFormHelpers.clearFieldStates([email, password]);
      NotificationCenter.publish('login:success', { message: data.message });
    } else {
      if (data.errors) {
        Object.keys(data.errors).forEach((id) => {
          const el = document.getElementById(id);
          if (el) SmartCareFormHelpers.showError(el, true, data.errors[id]);
        });
      } else {
        // No field-level detail from the server (e.g. wrong credentials) —
        // mark both fields so the mistake is still visible on the inputs
        // themselves, and put the server's own message under the password
        // field since that's the more natural place to read it.
        SmartCareFormHelpers.showError(email, true);
        SmartCareFormHelpers.showError(password, true, data.message);
      }
      password.value = '';
      password.focus();
      NotificationCenter.publish('login:failed', { message: data.message });
    }
  }
})();
