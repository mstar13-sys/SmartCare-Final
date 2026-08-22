<?php
require __DIR__ . '/../includes/bootstrap.php';
if ($currentUser) {
    header('Location: ../dashboard/' . ($currentUser['role'] === 'staff' ? 'admin' : 'patient') . '/dashboard.php');
    exit;
}
$pageTitle = 'SmartCare - Log In';
$assetRoot = '..';
require __DIR__ . '/../includes/header.php';
?>
<div class="shell">
  <?php require __DIR__ . '/../includes/brand-panel.php'; ?>
  <main class="form-panel"><section class="form-card auth-card">
    <div class="mobile-mark"><span class="logo-badge">+</span><span>SmartCare</span></div>
    <div class="switcher" data-active="login"><div class="thumb"></div><a href="login.php">Log In</a><a href="signup.php">Sign Up</a></div>
    <div class="head-block"><h2>Welcome back to SmartCare</h2><p>Securely access your patient dashboard.</p></div>
    <form id="loginForm" novalidate>
      <div class="message-area" id="loginMessage" role="status" aria-live="polite"></div>
      <div class="field"><label class="flabel" for="loginEmail">Email or username</label><div class="input-wrap"><span class="ic-left"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span><input id="loginEmail" name="loginEmail" type="text" placeholder="you@example.com" autocomplete="username" required /></div></div>
      <div class="field"><div class="row-between"><label class="flabel" for="loginPassword">Password</label><a href="#" id="forgotLink">Forgot password?</a></div><div class="input-wrap"><span class="ic-left"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><input id="loginPassword" name="loginPassword" type="password" placeholder="••••••••" autocomplete="current-password" required /><button type="button" class="toggle-eye" data-target="loginPassword" aria-label="Show password"><svg class="eye-open" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button></div></div>
      <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken); ?>" />
      <button class="submit-btn" type="submit"><span class="spinner"></span><span class="btn-label">Log In</span></button>
    </form><p class="switch-foot">Don't have an account?<a href="signup.php"> Sign up</a></p><div class="secure-note">Secure portal</div>
  </section></main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
<script src="../js/form-helpers.js" defer></script>
<script src="../js/notification-center.js" defer></script>
<script src="../js/password-toggle.js" defer></script>
<script src="../js/login-form.js" defer></script>
<script src="../js/clear-auth-fields.js" defer></script>
<script src="../js/page-transition.js" defer></script>
