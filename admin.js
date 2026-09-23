let messages = [];
const $ = (selector) => document.querySelector(selector);

async function loadMessages() {
  const response = await fetch("/api/admin/messages");
  if (!response.ok) throw new Error("Your admin session is no longer active.");
  messages = await response.json(); renderDashboard();
}
function renderDashboard() {
  const replied = messages.filter((message) => message.replied).length;
  $("#total-count").textContent = messages.length;
  $("#new-count").textContent = messages.length - replied;
  $("#replied-count").textContent = replied;
  $("#reply-rate").textContent = messages.length ? `${Math.round(replied / messages.length * 100)}%` : "0%";
  const filter = $("#message-filter").value;
  const visible = messages.filter((message) => filter === "all" || (filter === "new" ? !message.replied : message.replied));
  $("#messages-list").innerHTML = visible.length ? visible.map((message) => `<article class="message-card"><div class="section-heading"><h3>${escapeHtml(message.firstName)} ${escapeHtml(message.lastName)}</h3><span class="status-pill ${message.replied ? "replied" : ""}">${message.replied ? "Replied" : "New"}</span></div><p>${escapeHtml(message.email)} · ${escapeHtml(message.reason)} · ${new Date(message.submittedAt).toLocaleString()}</p><p>${escapeHtml(message.message)}</p>${message.replied ? "" : `<button data-reply-id="${message.id}">Mark as replied</button>`}</article>`).join("") : `<p class="muted">No messages in this view.</p>`;
  $("#reason-chart").innerHTML = renderChart();
  document.querySelectorAll("[data-reply-id]").forEach((button) => button.addEventListener("click", () => markReplied(button.dataset.replyId)));
}
function renderChart() {
  const counts = Object.fromEntries(["Comment","Question","Partnership","Opportunity","For Fun","Other"].map((reason) => [reason, 0]));
  messages.forEach((message) => { if (counts[message.reason] !== undefined) counts[message.reason]++; });
  const max = Math.max(1, ...Object.values(counts));
  return Object.entries(counts).map(([reason, count]) => `<div class="bar-row"><label>${reason}</label><div class="bar" style="width:${count / max * 100}%"></div><strong>${count}</strong></div>`).join("");
}
async function markReplied(id) {
  const response = await fetch(`/api/admin/messages/${encodeURIComponent(id)}/replied`, {method:"PATCH"});
  if (response.ok) await loadMessages();
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({'&':"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[character])); }
document.addEventListener("DOMContentLoaded", () => {
  $("#message-filter")?.addEventListener("change", renderDashboard);
  $("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault(); const status = $("#login-status");
    const response = await fetch("/api/admin/login", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:new FormData(event.currentTarget).get("password")})});
    if (response.ok) { $("#admin-login").hidden = true; $("#dashboard").hidden = false; await loadMessages(); }
    else { status.textContent = "Incorrect password or admin password is not configured."; status.className = "form-status error"; }
  });
});