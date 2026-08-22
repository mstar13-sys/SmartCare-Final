/* =========================================================================
   Tab Switcher
   -------------------------------------------------------------------------
   switchTab('login' | 'signup') shows the right pane and updates the tab
   buttons. It's a plain function, so anything that needs to change tabs —
   the tab buttons themselves, the "Sign up" / "Log in" links at the
   bottom of each form, or signup-form.js after a successful signup —
   just calls switchTab(...) directly.
   ========================================================================= */

function switchTab(tabName) {
  const switcher = document.getElementById("switcher");
  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  const paneLogin = document.getElementById("paneLogin");
  const paneSignup = document.getElementById("paneSignup");

  const isLogin = tabName === "login";

  switcher.dataset.active = tabName;
  tabLogin.setAttribute("aria-selected", isLogin ? "true" : "false");
  tabSignup.setAttribute("aria-selected", !isLogin ? "true" : "false");
  paneLogin.classList.toggle("active", isLogin);
  paneSignup.classList.toggle("active", !isLogin);

  const focusTarget = document.getElementById(
    isLogin ? "loginEmail" : "fullName",
  );
  if (focusTarget) focusTarget.focus({ preventScroll: true });
}

// ---- Simple click listeners: every button that should switch tabs ----
document
  .getElementById("tabLogin")
  .addEventListener("click", () => switchTab("login"));
document
  .getElementById("tabSignup")
  .addEventListener("click", () => switchTab("signup"));

document.querySelectorAll("[data-switch]").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.switch));
});
