/* =========================================================================
   Notification Center
   -------------------------------------------------------------------------
   A tiny publish/subscribe hub — event-driven design in its simplest
   form. Other files "subscribe" to a named event; anyone can "publish"
   that event with some data, and every subscriber gets called. This
   keeps login-form.js from needing to know anything about toasts — it
   just publishes what happened, and whoever's listening decides what to
   do about it.

   Events used in this app:
     login:attempt  — published as soon as the login form is submitted
                       with non-empty fields (before PHP even answers)
     login:success  — published once php/login.php confirms the login
     login:failed   — published on bad credentials, empty fields, or a
                       network/CSRF error
   ========================================================================= */
const NotificationCenter = (() => {
  const subscribers = {};

  function subscribe(eventName, callback) {
    if (!subscribers[eventName]) subscribers[eventName] = [];
    subscribers[eventName].push(callback);
  }

  function publish(eventName, data) {
    (subscribers[eventName] || []).forEach((callback) => callback(data));
  }

  return { subscribe, publish };
})();

function writeLoginMessage(text, type = "info") {
  const area = document.getElementById("loginMessage");
  if (!area) return;
  area.textContent = text;
  area.className = `message-area ${type}`;
}

// ---- Built-in subscribers: turn login events into console logs / toasts ----
NotificationCenter.subscribe("login:attempt", (data) => {
  console.log(`[NotificationCenter] login:attempt — ${data.email}`);
  writeLoginMessage("Validating credentials...", "info");
});

NotificationCenter.subscribe("login:success", (data) => {
  writeLoginMessage(data.message, "success");
  showSuccessDialog({
    title: "Logged in!",
    text: data.message,
    confirmButtonText: "Okay",
    onConfirm: () => {
      window.location.href = data.redirect || "../index.php";
    },
  });
});

NotificationCenter.subscribe("login:failed", (data) => {
  writeLoginMessage(data.message, "error");
  showToast({ type: "error", title: "Login failed", body: data.message });
});
