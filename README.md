# SmartCare Auth Portal — README

This is the Log In / Sign Up screen for SmartCare. It's plain HTML, CSS,
JavaScript, and now a small PHP backend — no frameworks, no build step.
Since PHP needs to run server-side, start a PHP server from this folder
and open the page through it, not by double-clicking the file:

```
php -S localhost:8000
```

...then visit `http://localhost:8000`.

This README explains **how the JavaScript and PHP are wired together**
so it's easy to follow even if you're still learning both.

---

## 1. The big idea: plain events, plain functions

Every interactive thing on this page — clicking a button, typing in a
field, submitting a form — uses the **same two building blocks** you
learn early on in JavaScript:

1. `element.addEventListener('event-name', function)` to *listen* for
   something the user does.
2. A normal function call, like `showToast(...)`, to *react* to it.

There is no custom event system, no "pub/sub bus", no `emit()` — just
listeners and function calls, the same pattern you'd use in any
beginner JS tutorial. If you've ever written:

```js
button.addEventListener('click', () => {
  alert('clicked!');
});
```

...then you already know everything you need to read this codebase.

---

## 2. Files and what each one is responsible for

| File | What it does |
|---|---|
| `js/validators.js` | Plain functions that check if an email/phone/password is valid. No DOM, no events — just `if` statements and regular expressions. |
| `js/form-helpers.js` | Small shared helpers (`showError`, `clearFieldStates`) used by both forms to show/hide the little red error messages under each field. |
| `js/password-toggle.js` | Listens for clicks on the little "eye" icon next to a password field and toggles it between hidden (`••••`) and visible text. |
| `js/password-strength.js` | Listens for typing (`input` event) in the sign-up password field and updates the strength meter + checklist (8+ characters, uppercase, number, special character) live. |
| `js/toast.js` | Defines one function, `showToast({ type, title, body })`, that pops up the little notification card in the bottom-right corner. Any file can call it whenever it needs to tell the user something. |
| `js/notification-center.js` | A tiny publish/subscribe hub used only for login events (`login:attempt`, `login:success`, `login:failed`). `login-form.js` publishes; this file's own subscribers call `showToast(...)` in response. See section 7. |
| `js/login-form.js` | Listens for the login form being submitted, validates it, demonstrates event propagation, sends the request synchronously, and publishes login events. |
| `js/signup-form.js` | Validates the sign-up form and posts it to PHP **asynchronously** (`fetch()`), so the page stays responsive. On success it redirects to `login.php`. |
| `js/dashboard.js` | Adds simple click handlers for the authenticated dashboard quick actions. |

Everything except the login form's event flow (see section 7) is still
just plain `addEventListener` calls and direct function calls — no
"event bus" for the rest of the app.

---

## 3. The events used (all native browser events)

These are the only event types in the whole app — all of them are
built into the browser, nothing custom:

| Event | Fired when... | Used on |
|---|---|---|
| `click` | The user clicks a button, tab, link, or icon | Tab buttons, "Sign up"/"Log in" links, "Forgot password?" link, eye icons |
| `input` | The user types/edits a text field | Email, password, name, phone fields (to clear errors and, for the sign-up password, update the strength meter) |
| `change` | A checkbox or radio button's checked state changes | The "I agree to the Terms" checkbox |
| `submit` | A `<form>` is submitted (e.g. clicking the submit button) | The login form and sign-up form |

Every one of these is wired up with `addEventListener` right where it's
used — you can open any file, search for `addEventListener`, and see
exactly what happens when that event fires. No hidden indirection.

---

## 4. How a login attempt actually flows, step by step

This is the easiest way to see the whole system in action:

1. User clicks in the email field and types → `input` event fires on
   that field → `login-form.js` calls `SmartCareFormHelpers.showError(el, false)`
   to clear any old error styling.
2. User clicks **Log In** — the button is the **event source**, its
   `click` is the **event**, and (further up, see section 6) three
   separate **listeners** react to that one click.
3. Clicking the submit button also triggers the form's `submit` event.
   `login-form.js`'s submit handler runs:
   - Calls `event.preventDefault()` so the page doesn't reload.
   - Checks the email/password aren't empty. If something's missing,
     it calls `SmartCareFormHelpers.showError(...)` to show the red
     error message and **stops here**.
   - Otherwise it publishes `login:attempt` (see section 7), shows the
     loading spinner, and sends the request to `php/login.php` using a
     synchronous `XMLHttpRequest` — the page freezes until PHP responds.
     Sign-up always uses an asynchronous `fetch()` request instead, and
     stays responsive the whole time. See section 8.
4. When PHP responds:
   - If the demo credentials match, `login-form.js` publishes
     `login:success`, which is what actually triggers the success toast.
   - If not, it publishes `login:failed`, which triggers the error toast
     and clears the password field.

Nothing in `login-form.js` calls `showToast()` directly anymore — it
publishes what happened, and `notification-center.js` decides to turn
that into a toast. That's the one place in the app that works this way;
see section 7 for why.

---

## 5. What happens after a successful sign-up

1. User fills in and submits the sign-up form.
2. `signup-form.js` validates every field (name, email, phone, password
   rules, confirm-password match, terms checkbox).
3. It posts to `php/signup.php` with `fetch()` (asynchronously — the
   page stays responsive while this runs). Once that succeeds, it:
   - Resets the form and the password-strength meter.
   - Shows a success dialog, and on confirm, redirects the browser to
     `login.php` with `window.location.href`.

---

## 6. Event propagation on the login form (capturing vs. bubbling)

One click on the **Log In** button actually passes through three
listeners, in a specific order, because of how DOM events travel through
their ancestors. `login-form.js` sets these up purely to demonstrate it —
open the console (F12) and click Login to see:

1. **Capturing phase** — `#loginPanel`'s listener registered with
   `addEventListener('click', fn, true)` fires first, on the way *down*
   from the document to the button.
2. **Target phase** — the Login button's own `click` listener fires next.
3. **Bubbling phase** — `#loginPanel`'s other listener (registered without
   `true`, the default) fires last, on the way back *up*.

`#loginPanel` is the actual login card element (`<section id="loginPanel">`
in `auth/login.php`) — a real container that wraps the whole form, not
just an alias for the form itself.

```js
pane.addEventListener('click', fn, true);  // capturing — runs 1st
button.addEventListener('click', fn);      // target — runs 2nd
pane.addEventListener('click', fn, false); // bubbling — runs 3rd (default)
```

These three listeners only log to the console; they don't affect the
actual submit logic.

---

## 7. Why the login form uses a tiny pub/sub, and nothing else does

An earlier version of this app routed *everything* through a custom
event bus, where clicking any button fired a custom event that some
*other* file was separately listening for. That added a layer of
indirection that's hard to trace when you're still learning: to find
out what a button does, you'd have to search the whole project for
whoever's listening to that event name. So the rest of the app (tabs,
password toggle, sign-up) still avoids that — buttons call functions
directly, and you can trace what happens by reading top to bottom.

The login form is the one exception, and it's intentional:
`notification-center.js` defines a minimal **Observer / publish-subscribe**
hub —

```js
NotificationCenter.subscribe('login:success', callback);
NotificationCenter.publish('login:success', { message: '...' });
```

`login-form.js` publishes `login:attempt`, `login:success`, and
`login:failed` at the right points; `notification-center.js`'s own
subscribers turn those into `showToast(...)` calls and a console log.
It's the same event-driven pattern real apps use to decouple "something
happened" from "here's what we do about it" — kept small enough that
you can read the whole thing in one file.

---

## 8. Synchronous vs. asynchronous processing

Each form deliberately uses a different processing mode, so the two can
be compared directly:

- **Login (`js/login-form.js`)** uses a **synchronous** `XMLHttpRequest`
  (`xhr.open('POST', url, false)`), and `php/login.php` deliberately
  `sleep(2)`s. Because the request is synchronous, `xhr.send()` doesn't
  return until PHP responds — the whole page is frozen for those ~2
  seconds. Try typing in another field while logging in: nothing happens
  until the request finishes.
- **Sign-up (`js/signup-form.js`)** uses **asynchronous** `fetch()`. The
  page stays fully responsive while `php/signup.php` runs — you can keep
  typing, and the submit button's spinner keeps animating.

Both forms show progress and result messages in their message area and use
SweetAlert2 when the CDN is available, with the built-in toast as a fallback.

## 9. Authenticated dashboard

After a successful login, PHP stores the user in the session and the page
reloads into a simple dashboard. It displays the user's name, next
appointment, queue status, care reminders, quick-action buttons, and a logout
link. The dashboard is rendered by `index.php` only when a valid PHP session
exists.

## 10. Where PHP lives, and what it actually does

`index.php` (not `index.html` — it needs to run through PHP now) starts
the session and creates a CSRF token at the very top, before any HTML is
sent, then embeds that token as a hidden `csrf_token` field in **both**
forms. Because it's a real form field, `new FormData(form)` on the JS
side picks it up automatically — no separate fetch just to get a token.

| File | What it does |
|---|---|
| `index.php` | Starts the session, creates/reuses the CSRF token, handles `?logout=1`, and shows a "Logged in as…" banner when `$_SESSION['user']` is set. |
| `php/request.php` | Starts the endpoint session and defines the shared `json_response()` / `check_csrf()` request helpers. |
| `php/config.php` | Contains the database settings and opens the shared PDO connection. |
| `php/validators.php` | Server-side twin of `js/validators.js` — same email/phone/password rules, same names, just in PHP. |
| `php/login.php` | Checks the CSRF token, validates the fields, looks the account up by email, verifies the password with `password_verify()`, and stores `$_SESSION['user']` on success. |
| `php/signup.php` | Checks the CSRF token, validates every field server-side, rejects the email if it's already taken, and inserts the new account with `password_hash()`. |

**How a submission is checked, step by step:**

1. `index.php` embeds the session's CSRF token as a hidden field in
   each form when the page is rendered.
2. When either form submits, `new FormData(form)` already includes that
   token — no extra JS needed — and the handler sends it to
   `php/login.php` or `php/signup.php`.
3. The PHP endpoint calls `check_csrf()` first. If the token doesn't
   match `$_SESSION['csrf_token']`, it rejects the request immediately
   with "Your session expired."
4. It then re-validates every field (using `php/validators.php` for
   signup) and talks to the database through `$pdo` (from `php/config.php`) —
   a `SELECT` + `password_verify()` for login, or a duplicate-email
   check + `INSERT` with `password_hash()` for signup.
5. It replies with JSON: `{ success, message, errors? }`.
6. On a successful login, PHP calls `session_regenerate_id(true)` and
   sets `$_SESSION['user']` — reload `index.php` afterward and you'll
   see the "Logged in as…" banner, with a **Log out** link that clears
   the session via `?logout=1`.

---

## 11. Database setup

The app needs one MySQL database with one table, `users`. To create it:

```
mysql -u root -p < database.sql
```

`database.sql` creates the `smartcare` database, the `users`
table (`full_name`, `email`, `phone`, `password_hash`, `role`,
`created_at`), and seeds a demo account so the credentials below still
work out of the box:

```
email:    demo@smartcare.com
password: Demo1234!
```

`php/config.php` is where the connection details live:

```php
$host = "127.0.0.1";
$port = 3306;
$db   = "smartcare";
$user = "root";
$pass = "";
```

These defaults match a typical local install (XAMPP/MAMP/Laragon —
`root` user, no password). If your setup is different, that's the only
file you need to edit. Every endpoint that touches the database does
`require __DIR__ . '/config.php';` and then just uses `$pdo` — prepared
statements throughout, so user input never gets concatenated into SQL.

If the connection fails (wrong credentials, or the database/table don't
exist yet), `php/config.php` replies with the same `{ success: false,
message }` JSON shape as every other endpoint, so the form shows a
clear error toast instead of a blank PHP error page.
