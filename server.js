const express = require("express");
const crypto = require("crypto");
const path = require("path");
const { Client } = require("@replit/object-storage");

const app = express();
const port = Number(process.env.PORT || 5000);
const storagePath = "data/contactReceived.json";
let storage;
const sessions = new Map();
const allowedReasons = new Set(["Comment", "Question", "Partnership", "Opportunity", "Other"]);

app.use(express.json({ limit: "100kb" }));
app.use(express.static(__dirname));

async function readMessages() {
  storage ??= new Client();
  const result = await storage.downloadAsText(storagePath);
  if (result.ok) {
    const parsed = JSON.parse(result.value);
    if (!Array.isArray(parsed)) throw new Error("Stored contacts must be a JSON array.");
    return parsed;
  }
  const initialize = await storage.uploadFromText(storagePath, "[]", {contentType: "application/json"});
  if (!initialize.ok) throw new Error("Unable to initialize App Storage.");
  return [];
}
async function writeMessages(messages) {
  storage ??= new Client();
  const result = await storage.uploadFromText(storagePath, JSON.stringify(messages, null, 2), {contentType: "application/json"});
  if (!result.ok) throw new Error("Unable to write App Storage.");
}
function clean(value) { return typeof value === "string" ? value.trim() : ""; }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function isAdmin(request) {
  const token = request.headers.cookie?.match(/admin_session=([^;]+)/)?.[1];
  return Boolean(token && sessions.has(token) && sessions.get(token) > Date.now());
}
function requireAdmin(request, response, next) { if (!isAdmin(request)) return response.status(401).json({error:"Admin authentication required."}); next(); }
function cookieFor(token) { return `admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`; }

app.post("/api/contact", async (request, response) => {
  const firstName = clean(request.body.firstName), lastName = clean(request.body.lastName), email = clean(request.body.email), reason = clean(request.body.reason), message = clean(request.body.message);
  if (!firstName || !lastName || !validEmail(email) || !allowedReasons.has(reason) || !message) return response.status(400).json({error:"Please complete every required field with valid information."});
  try {
    const record = {id: crypto.randomUUID(), firstName, lastName, email, reason, message, submittedAt:new Date().toISOString(), replied:false, repliedAt:null};
    const messages = await readMessages(); messages.push(record); await writeMessages(messages);
    response.status(201).json(record);
  } catch (error) { console.error(error); response.status(500).json({error:"The message could not be saved. Please try again."}); }
});
app.post("/api/admin/login", (request, response) => {
  const password = process.env.ADMIN_PASSWORD;
  const supplied = Buffer.from(String(request.body.password || ""));
  const expected = password ? Buffer.from(String(password)) : Buffer.alloc(0);
  const matches = expected.length === supplied.length && expected.length > 0 && crypto.timingSafeEqual(expected, supplied);
  if (!matches) return response.status(401).json({error:"Invalid credentials."});
  const token = crypto.randomBytes(24).toString("hex"); sessions.set(token, Date.now() + 8 * 60 * 60 * 1000); response.setHeader("Set-Cookie", cookieFor(token)); response.json({ok:true});
});
app.get("/api/admin/messages", requireAdmin, async (request, response) => {
  try { response.json((await readMessages()).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))); } catch (error) { response.status(500).json({error:"Unable to read messages."}); }
});
app.patch("/api/admin/messages/:id/replied", requireAdmin, async (request, response) => {
  try {
    const messages = await readMessages(), index = messages.findIndex((message) => message.id === request.params.id);
    if (index < 0) return response.status(404).json({error:"Message not found."});
    messages[index].replied = true; messages[index].repliedAt = new Date().toISOString(); await writeMessages(messages); response.json(messages[index]);
  } catch (error) { response.status(500).json({error:"Unable to update message."}); }
});
app.listen(port, "0.0.0.0", () => console.log(`Stavros H. website listening on port ${port}`));