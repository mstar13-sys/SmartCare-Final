<?php
require __DIR__ . '/../../includes/start.php';
if (!$currentUser) {
  header('Location: ../../auth/login.php');
  exit;
}
if ($currentUser['role'] === 'staff') {
  header('Location: ../admin/dashboard.php');
  exit;
}
if ($currentUser['role'] !== 'superadmin') {
  header('Location: ../patient/dashboard.php');
  exit;
}
$displayName = $currentUser['name'] ?? 'System Admin';
$initials = '';
foreach (array_slice(preg_split('/\s+/', trim($displayName)), 0, 2) as $part) {
  $initials .= strtoupper(substr($part, 0, 1));
}
if ($initials === '') $initials = 'SA';

$pageTitle = 'SmartCare - Superadmin Dashboard';
$assetRoot = '../..';
$extraStyles = [$assetRoot . '/css/dashboard-admin.css'];
require __DIR__ . '/../../includes/header.php';
?>
<div class="console-shell">
  <aside class="console-sidebar" aria-label="Superadmin navigation">
    <div class="console-brand"><span class="logo-badge">&#9825;</span><span class="name">SmartCare</span></div>
    <nav class="console-nav">
      <a class="console-nav-item is-active" href="dashboard.php"><span class="dot"></span>Dashboard</a>

      <div class="console-nav-group">
        <a class="console-nav-item" href="#">Staff Management</a>
        <a class="console-nav-sub" href="#">View Staff</a>
        <a class="console-nav-sub" href="#">Create Staff</a>
        <a class="console-nav-sub" href="#">Edit Staff</a>
      </div>

      <a class="console-nav-item" href="#">Patients</a>
      <a class="console-nav-item" href="#">Appointments</a>
      <a class="console-nav-item" href="#">Schedules</a>
      <a class="console-nav-item" href="#">Services</a>
      <a class="console-nav-item" href="#">Notifications</a>
      <a class="console-nav-item" href="#">Reports</a>

      <div class="console-nav-divider"></div>
      <a class="console-nav-item" href="#">Settings</a>
    </nav>
  </aside>

  <div class="console-main">
    <header class="console-topbar">
      <h1>Superadmin Dashboard</h1>
      <div class="console-user">
        <a class="console-logout" href="../../index.php?logout=1">Log out</a>
        <span><?php echo htmlspecialchars($displayName); ?></span>
        <span class="console-avatar"><?php echo htmlspecialchars($initials); ?></span>
      </div>
    </header>

    <main class="console-content">
      <section class="console-stats" aria-label="Clinic-wide totals">
        <div class="console-stat">
          <p class="label">Total Staff</p>
          <p class="value">22</p>
        </div>
        <div class="console-stat">
          <p class="label">Total Patients</p>
          <p class="value">1,204</p>
        </div>
        <div class="console-stat">
          <p class="label">Appointments Today</p>
          <p class="value">37</p>
        </div>
        <div class="console-stat">
          <p class="label">Pending Approvals</p>
          <p class="value">4</p>
        </div>
      </section>

      <section class="console-panel">
        <div class="console-panel-title">
          Staff Management
          <button type="button" class="console-cta" data-dashboard-action="Create staff account">+ Create Staff</button>
        </div>

        <div class="console-row">
          <div><p class="who">Dr. L. Ramirez</p><p class="meta">Physician &middot; role = staff</p></div>
          <span class="console-pill active">Active</span>
        </div>
        <div class="console-row">
          <div><p class="who">A. Reyes</p><p class="meta">Nurse &middot; role = staff</p></div>
          <span class="console-pill active">Active</span>
        </div>
        <div class="console-row">
          <div><p class="who">M. Santos</p><p class="meta">Front Desk &middot; role = staff</p></div>
          <span class="console-pill pending">Temp password set</span>
        </div>
      </section>

      <section class="console-panel">
        <div class="console-panel-title">Clinic Reports</div>

        <button type="button" class="console-row-btn console-row" data-dashboard-action="Monthly appointment summary">
          <div><p class="who">Monthly appointment summary</p><p class="meta">Auto-generated &middot; Aug 2026</p></div>
        </button>
        <button type="button" class="console-row-btn console-row" data-dashboard-action="Audit log">
          <div><p class="who">Audit log &mdash; admin actions</p><p class="meta">Updated continuously</p></div>
        </button>
      </section>
    </main>
  </div>
</div>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
