/* Login notification event hub.
   login-form.js publishes status events; the subscribers below update the
   inline message and display the appropriate toast notification. */
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

let loginMessageTimer;

function clearLoginMessage() {
  window.clearTimeout(loginMessageTimer);
  loginMessageTimer = undefined;

  const area = document.getElementById("loginMessage");
  if (!area) return;
  area.textContent = "";
  area.className = "message-area";
}

function writeLoginMessage(text, type = "info") {
  const area = document.getElementById("loginMessage");
  if (!area) return;

  window.clearTimeout(loginMessageTimer);
  area.textContent = text;
  area.className = `message-area ${type}`;

  if (type === "error") {
    loginMessageTimer = window.setTimeout(clearLoginMessage, 5000);
  }
}

NotificationCenter.subscribe("login:attempt", (data) => {
  console.log(`[NotificationCenter] login:attempt - ${data.email}`);
  writeLoginMessage("Validating credentials...", "info");
});

NotificationCenter.subscribe("login:success", (data) => {
  writeLoginMessage(data.message, "success");
  showToast({
    type: "success",
    title: "Logged in!",
    body: data.message,
    onClose: () => {
      window.location.href = data.redirect || "../index.php";
    },
  });
});

NotificationCenter.subscribe("login:failed", (data) => {
  writeLoginMessage(data.message, "error");
  showToast({ type: "error", title: "Login failed", body: data.message });
});

NotificationCenter.subscribe("login:editing", clearLoginMessage);
