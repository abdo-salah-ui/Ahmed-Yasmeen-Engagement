// Public site settings. The publishable key is safe to expose; row-level policies below are the actual access control.
const adminConfig = {
  supabaseUrl: "https://xeusojhztxlriswqbngf.supabase.co",
  publishableKey: "sb_publishable_WYqNvpd2sGCWKLrcZzH9eg_cBD3XPhL",
  username: "ayadmin",
  authEmail: "ayadmin@engagement.example.com"
};

const $ = (id) => document.getElementById(id);
const apiBase = adminConfig.supabaseUrl.replace(/\/$/, "");
const sessionKey = "ay-admin-session-v1";
let currentSession = null;
let rsvps = [];
let messages = [];

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(sessionKey) || "null"); }
  catch { return null; }
}

function saveSession(session) {
  currentSession = session;
  if (session) sessionStorage.setItem(sessionKey, JSON.stringify(session));
  else sessionStorage.removeItem(sessionKey);
}

async function authRequest(path, body) {
  const response = await fetch(`${apiBase}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: adminConfig.publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Sign in failed.");
  return data;
}

async function changeAuthPassword(password) {
  const session = await ensureFreshSession();
  const response = await fetch(`${apiBase}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: adminConfig.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "The password could not be changed.");
  return data;
}

async function ensureFreshSession() {
  if (!currentSession?.access_token) throw new Error("Please sign in again.");
  if (currentSession.expires_at && Date.now() < currentSession.expires_at - 45_000) return currentSession;
  if (!currentSession.refresh_token) throw new Error("Your session expired. Please sign in again.");
  const renewed = await authRequest("token?grant_type=refresh_token", { refresh_token: currentSession.refresh_token });
  saveSession({ ...renewed, expires_at: Date.now() + Number(renewed.expires_in || 3600) * 1000 });
  return currentSession;
}

async function api(path, options = {}) {
  const session = await ensureFreshSession();
  const response = await fetch(`${apiBase}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: adminConfig.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  if (response.status === 401) throw new Error("Your session expired. Please sign in again.");
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "The request could not be completed.");
  }
  return response.status === 204 ? null : response.json();
}

function setStatus(message, isError = false) {
  $("dashboardStatus").textContent = message;
  $("dashboardStatus").classList.toggle("is-error", isError);
}

function showDashboard(isSignedIn) {
  $("loginPanel").hidden = isSignedIn;
  $("dashboardPanel").hidden = !isSignedIn;
  $("signOutButton").hidden = !isSignedIn;
}

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-EG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" }).format(date);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function actionButton(label, className, callback) {
  const button = el("button", `action-button ${className || ""}`, label);
  button.type = "button";
  button.addEventListener("click", callback);
  return button;
}

function updateSummary() {
  const attending = rsvps.filter((row) => row.attendance === "joyfully accepts").length;
  const unable = rsvps.length - attending;
  const pending = messages.filter((row) => !row.approved).length;
  $("rsvpTotal").textContent = String(rsvps.length);
  $("rsvpYesNo").textContent = `${attending} attending · ${unable} unable`;
  $("guestbookTotal").textContent = String(messages.length);
  $("pendingTotal").textContent = String(pending);
  $("rsvpTabCount").textContent = String(rsvps.length);
  $("guestbookTabCount").textContent = String(pending);
}

function renderRsvps() {
  const list = $("rsvpList");
  list.replaceChildren();
  if (!rsvps.length) {
    list.append(el("p", "empty-state", "No RSVP replies yet."));
    return;
  }
  for (const row of rsvps) {
    const card = el("article", "response-card");
    const top = el("div", "response-card-top");
    top.append(el("h3", "guest-name", row.guest_name), el("time", "guest-date", formatDate(row.created_at)));
    const meta = el("div", "response-meta");
    const attendanceLabel = row.attendance === "joyfully accepts" ? "Joyfully accepts" : "Regretfully declines";
    meta.append(el("span", "pill", attendanceLabel), el("span", "pill", `${row.guest_count} ${Number(row.guest_count) === 1 ? "guest" : "guests"}`));
    card.append(top, meta);
    if (row.note) card.append(el("p", "response-note", row.note));
    const actions = el("div", "response-actions");
    actions.append(actionButton("Delete reply", "is-delete", () => removeRow("engagement_rsvps", row.id, "RSVP reply")));
    card.append(actions);
    list.append(card);
  }
}

function renderMessages() {
  const list = $("guestbookList");
  list.replaceChildren();
  const waitingOnly = $("showApprovedOnly").checked;
  const rows = waitingOnly ? messages.filter((row) => !row.approved) : messages;
  if (!rows.length) {
    list.append(el("p", "empty-state", waitingOnly ? "There are no messages waiting for approval." : "No guestbook messages yet."));
    return;
  }
  for (const row of rows) {
    const card = el("article", "response-card");
    const top = el("div", "response-card-top");
    top.append(el("h3", "guest-name", row.name), el("time", "guest-date", formatDate(row.created_at)));
    const pill = el("span", `pill ${row.approved ? "is-approved" : "is-pending"}`, row.approved ? "Approved · Public" : "Waiting for approval");
    const actions = el("div", "response-actions");
    if (!row.approved) actions.append(actionButton("Accept & publish", "", () => approveMessage(row.id)));
    actions.append(actionButton("Delete message", "is-delete", () => removeRow("guestbook_messages", row.id, "Guestbook message")));
    card.append(top, pill, el("p", "response-note", row.message), actions);
    list.append(card);
  }
}

async function loadData() {
  setStatus("Loading saved replies…");
  $("refreshButton").disabled = true;
  try {
    const [replyRows, messageRows] = await Promise.all([
      api("engagement_rsvps?select=id,guest_name,attendance,guest_count,note,created_at&order=created_at.desc&limit=500"),
      api("guestbook_messages?select=id,name,message,approved,created_at&order=created_at.desc&limit=500")
    ]);
    rsvps = replyRows;
    messages = messageRows;
    updateSummary();
    renderRsvps();
    renderMessages();
    setStatus("Everything is up to date.");
  } catch (error) {
    setStatus(error.message, true);
    if (/sign in again|session expired/i.test(error.message)) await signOut(false);
  } finally {
    $("refreshButton").disabled = false;
  }
}

async function approveMessage(id) {
  const button = [...$("guestbookList").querySelectorAll("button")].find((item) => item.textContent === "Accept & publish");
  if (button) button.disabled = true;
  try {
    await api(`guestbook_messages?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ approved: true })
    });
    messages = messages.map((row) => row.id === id ? { ...row, approved: true } : row);
    updateSummary();
    renderMessages();
    setStatus("Message approved and now visible on the invitation.");
  } catch (error) {
    setStatus(error.message, true);
    if (button) button.disabled = false;
  }
}

async function removeRow(table, id, label) {
  if (!window.confirm(`Delete this ${label.toLowerCase()} permanently?`)) return;
  try {
    await api(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    if (table === "engagement_rsvps") rsvps = rsvps.filter((row) => row.id !== id);
    else messages = messages.filter((row) => row.id !== id);
    updateSummary();
    renderRsvps();
    renderMessages();
    setStatus(`${label} deleted.`);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function signOut(callServer = true) {
  const session = currentSession || readSession();
  if (callServer && session?.access_token) {
    try {
      await fetch(`${apiBase}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: adminConfig.publishableKey, Authorization: `Bearer ${session.access_token}` }
      });
    } catch { /* Clearing this browser session still signs the dashboard out locally. */ }
  }
  saveSession(null);
  showDashboard(false);
  $("loginForm").reset();
  $("loginStatus").textContent = "";
}

function selectTab(tabName) {
  const isRsvp = tabName === "rsvp";
  $("rsvpTab").classList.toggle("is-active", isRsvp);
  $("guestbookTab").classList.toggle("is-active", !isRsvp);
  $("rsvpTab").setAttribute("aria-selected", String(isRsvp));
  $("guestbookTab").setAttribute("aria-selected", String(!isRsvp));
  $("rsvpPanel").hidden = !isRsvp;
  $("guestbookPanel").hidden = isRsvp;
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = $("username").value.trim().toLowerCase();
  const password = $("password").value;
  const submit = $("loginForm").querySelector("button[type='submit']");
  if (username !== adminConfig.username) {
    $("loginStatus").textContent = "Username or password is incorrect.";
    return;
  }
  submit.disabled = true;
  $("loginStatus").textContent = "Signing in…";
  try {
    const session = await authRequest("token?grant_type=password", { email: adminConfig.authEmail, password });
    const nextSession = { ...session, expires_at: Date.now() + Number(session.expires_in || 3600) * 1000 };
    saveSession(nextSession);
    showDashboard(true);
    await loadData();
  } catch {
    $("loginStatus").textContent = "Username or password is incorrect.";
  } finally {
    submit.disabled = false;
  }
});

$("signOutButton").addEventListener("click", () => signOut());
$("refreshButton").addEventListener("click", loadData);
$("rsvpTab").addEventListener("click", () => selectTab("rsvp"));
$("guestbookTab").addEventListener("click", () => selectTab("guestbook"));
$("showApprovedOnly").addEventListener("change", renderMessages);

$("passwordForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = $("newPassword").value;
  const confirmation = $("confirmPassword").value;
  const button = $("updatePasswordButton");
  const status = $("passwordStatus");
  status.classList.remove("is-error");
  if (password !== confirmation) {
    status.textContent = "The passwords do not match.";
    status.classList.add("is-error");
    return;
  }
  button.disabled = true;
  status.textContent = "Updating password…";
  try {
    await changeAuthPassword(password);
    $("passwordForm").reset();
    status.textContent = "Password updated. Use it the next time you sign in.";
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("is-error");
    if (/sign in again|session expired/i.test(error.message)) await signOut(false);
  } finally {
    button.disabled = false;
  }
});

currentSession = readSession();
if (currentSession?.access_token) {
  showDashboard(true);
  loadData();
} else {
  showDashboard(false);
}
