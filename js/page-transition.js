/* =========================================================================
   Page Transition (DEPRECATED — no longer loaded)
   -------------------------------------------------------------------------
   login.php and signup.php used to be two separate PHP pages, so switching
   between them was a real browser navigation, and this file made that
   navigation feel like a smooth in-place transition instead of an abrupt
   reload. They've since been merged into one page (auth/login.php, with
   both panes switched client-side by js/auth-switch.js), so there's no
   navigation left for this file to smooth over. Kept only for reference /
   in case anything else in the project still expects it to exist.

   Original behavior, for context:

     - On load, the page fades/slides in (see the .page-enter keyframes
       in css/animations.css).
     - Clicking any link that swaps login <-> signup (the pill switcher at
       the top, or the "Sign up" / "Log in" link at the bottom) fades the
       page out first, then navigates once the animation finishes.

   Browsers that support the CSS `@view-transition` rule (Chrome/Edge 126+)
   already get a native cross-fade between the two documents; this script
   is the fallback that gives every other browser the same smooth feel.
   ========================================================================= */
(function () {
  const nav = document.querySelectorAll('.switcher a[href], .switch-foot a[href]');
  if (!nav.length) return;

  const EXIT_MS = 200;

  nav.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Let modified clicks (new tab, etc.) behave normally.
      if (!href || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (document.body.classList.contains('page-leaving')) return; // already navigating

      e.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => { window.location.href = href; }, EXIT_MS);
    });
  });
})();
