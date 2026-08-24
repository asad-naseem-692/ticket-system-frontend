// Master End-to-End System Verification across Customer, Agent, and Admin roles against live Railway PostgreSQL
const API_URL = "http://127.0.0.1:8000";

async function runMasterE2E() {
  console.log("================================================================================");
  console.log("       STARTING MASTER COMPREHENSIVE END-TO-END SYSTEM VERIFICATION             ");
  console.log("================================================================================\n");

  const testEmail = `cust_master_${Date.now()}@example.com`;
  const testPassword = "MasterPass123!";

  // 1. Customer Signup & Authentication Flow
  console.log("[STEP 1] Customer Registration, Login & Session Validation...");
  const signupRes = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Master Test Customer",
      email: testEmail,
      password: testPassword,
    }),
  });
  if (signupRes.status !== 201) throw new Error(`Signup failed with status ${signupRes.status}`);
  console.log("  ✅ Customer registered successfully (Status 201).");

  const custLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const custAuth = await custLoginRes.json();
  const custToken = custAuth.access_token;
  const custId = custAuth.user.id;
  console.log("  ✅ Customer authenticated; JWT issued.");

  // Admin & Agent Login
  const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "AdminPass123!" }),
  });
  const adminAuth = await adminLoginRes.json();
  const adminToken = adminAuth.access_token;

  const agentLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent1@example.com", password: "AgentPass123!" }),
  });
  const agentAuth = await agentLoginRes.json();
  const agentToken = agentAuth.access_token;
  const agentId = agentAuth.user.id;
  console.log("  ✅ Admin & Support Agent authenticated.");

  // 2. Customer Ticket Submission
  console.log("\n[STEP 2] Customer Ticket Submission & Auto-Priority Scoring...");
  const createTicketRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Master E2E Production Outage & Billing Error",
      category: "Billing",
      description: "Critical payment server crash and charge dispute. System completely down.",
    }),
  });
  const createdTicket = await createTicketRes.json();
  const ticketId = createdTicket.id;
  console.log(`  ✅ Ticket #${ticketId.slice(0, 8)} created.`);
  console.log(`     Auto-scored Priority: "${createdTicket.priority}" | SLA Deadline: ${createdTicket.deadline_at}`);

  // 3. Admin All Tickets & Filters
  console.log("\n[STEP 3] Admin Dashboard & Filter Inspection...");
  const adminAllRes = await fetch(`${API_URL}/tickets?category=Billing`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminTickets = await adminAllRes.json();
  const foundTicket = adminTickets.find((t) => t.id === ticketId);
  if (!foundTicket) throw new Error("Ticket not found in admin filtered list");
  console.log("  ✅ Admin successfully queried tickets with category filter.");

  // 4. Admin Priority Override
  console.log("\n[STEP 4] Admin Manual Priority Override (FEAT-15)...");
  const overrideRes = await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });
  const overriddenTicket = await overrideRes.json();
  console.log(`  ✅ Priority manually overridden to "${overriddenTicket.priority}". New Deadline: ${overriddenTicket.deadline_at}`);

  // 5. Admin Agent Assignment
  console.log("\n[STEP 5] Admin Assigns Ticket to Agent 1 (FEAT-18)...");
  const assignRes = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agentId }),
  });
  if (assignRes.status !== 200) throw new Error("Assignment failed");
  console.log(`  ✅ Ticket assigned to Agent 1 (${agentId}).`);

  // 6. Agent Assigned Queue
  console.log("\n[STEP 6] Support Agent Assigned Queue Verification (FEAT-10)...");
  const agentQueueRes = await fetch(`${API_URL}/tickets/assigned`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const agentQueue = await agentQueueRes.json();
  if (!agentQueue.some((t) => t.id === ticketId)) throw new Error("Ticket missing from agent queue");
  console.log("  ✅ Ticket confirmed present in Agent 1's assigned queue.");

  // 7. Multi-Participant Communication & Staff Isolation
  console.log("\n[STEP 7] Multi-Participant Communication & RBAC Isolation...");
  // Public Reply
  const pubReplyRes = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      content: "Here is additional context regarding the issue.",
      visibility: "public",
    }),
  });
  if (pubReplyRes.status !== 201) throw new Error("Public comment failed");
  console.log("  ✅ Customer posted public reply (Status 201).");

  // Staff Internal Note
  const intNoteRes = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      content: "CONFIDENTIAL: Internal engineering note. Investigation underway.",
      visibility: "internal",
    }),
  });
  if (intNoteRes.status !== 201) throw new Error("Internal note failed");
  console.log("  ✅ Agent posted internal staff note (Status 201).");

  // Customer Forbidden from Internal Note
  const breachAttemptRes = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      content: "Malicious attempt to post internal note",
      visibility: "internal",
    }),
  });
  if (breachAttemptRes.status !== 403) throw new Error("Customer internal comment must return 403");
  console.log("  ✅ Security verified: Customer internal comment rejected with 403 Forbidden.");

  // Customer Data Isolation Check
  const custDetailRes = await fetch(`${API_URL}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custDetail = await custDetailRes.json();
  const leakedNotes = custDetail.comments.filter((c) => c.visibility === "internal");
  if (leakedNotes.length > 0) throw new Error("SECURITY LEAK: Customer saw internal note!");
  console.log(`  ✅ Data isolation verified: 0 internal notes visible to customer (${custDetail.comments.length} public visible).`);

  // 8. Attachments Upload & Download
  console.log("\n[STEP 8] Secure File Attachment Upload & Authenticated Stream (FEAT-25/26)...");
  const boundary = "----MasterBoundary12345";
  const dummyLog = "DEBUG LOG: [2026-08-24] Transaction failure code: 504_GATEWAY_TIMEOUT";
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="server_error.log"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${dummyLog}\r\n` +
    `--${boundary}--\r\n`;

  const uploadRes = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${custToken}`,
    },
    body: multipartBody,
  });
  if (uploadRes.status !== 201) throw new Error("Attachment upload failed");
  const attachmentData = await uploadRes.json();
  const attachmentId = attachmentData.id;
  console.log(`  ✅ Attachment uploaded: "${attachmentData.filename}" (${attachmentData.size_bytes} bytes).`);

  const downloadRes = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  if (downloadRes.status !== 200) throw new Error("Attachment download failed");
  const downloadedText = await downloadRes.text();
  if (!downloadedText.includes("504_GATEWAY_TIMEOUT")) throw new Error("Corrupted attachment stream");
  console.log("  ✅ Attachment stream downloaded & verified by Support Agent.");

  // 9. Forward-Only Status Lifecycle Progression
  console.log("\n[STEP 9] Forward-Only Status Lifecycle Progression (FEAT-12)...");
  // open -> in_progress
  const s1 = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({ status: "in_progress" }),
  });
  if (s1.status !== 200) throw new Error("Move to in_progress failed");
  console.log("  ✅ Transition: 'open' -> 'in_progress' succeeded.");

  // Invalid backward transition: in_progress -> open
  const invalidBackward = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({ status: "open" }),
  });
  if (invalidBackward.status !== 400) throw new Error("Backward status transition should be rejected with 400");
  console.log("  ✅ Lifecycle verified: Backward hop 'in_progress' -> 'open' rejected with 400 Bad Request.");

  // in_progress -> resolved
  const s2 = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({ status: "resolved" }),
  });
  if (s2.status !== 200) throw new Error("Move to resolved failed");
  console.log("  ✅ Transition: 'in_progress' -> 'resolved' succeeded.");

  // resolved -> closed
  const s3 = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: "closed" }),
  });
  if (s3.status !== 200) throw new Error("Move to closed failed");
  console.log("  ✅ Transition: 'resolved' -> 'closed' succeeded.");

  // 10. Background SLA Monitoring & Alerting
  console.log("\n[STEP 10] SLA Breach Monitoring & Alerts (FEAT-27/28/29)...");
  const slaCheckRes = await fetch(`${API_URL}/notifications/sla-check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("  ✅ Triggered SLA check. Status:", slaCheckRes.status);

  const notifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const notifs = await notifsRes.json();
  console.log(`  ✅ Agent notification feed retrieved (${notifs.length} total notifications).`);

  // 11. Executive Reporting & RBAC Enforcement
  console.log("\n[STEP 11] Executive Analytics & RBAC Protection (FEAT-30/31/32)...");
  const custForbiddenRes = await fetch(`${API_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (custForbiddenRes.status !== 403) throw new Error("Customer must receive 403 on reports");
  console.log("  ✅ Customer forbidden from reports (403 Forbidden).");

  const summaryRes = await fetch(`${API_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const summary = await summaryRes.json();
  console.log(`  ✅ Summary Report: ${summary.total_tickets} tickets total | Breach Rate: ${summary.breach_rate_percent}%.`);

  const perfRes = await fetch(`${API_URL}/reports/agent-performance`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const agentPerf = await perfRes.json();
  console.log(`  ✅ Agent Performance Leaderboard: Analyzed ${agentPerf.length} agents.`);

  const breachRes = await fetch(`${API_URL}/reports/sla-breaches`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const breachList = await breachRes.json();
  console.log(`  ✅ SLA Breach Report: ${breachList.length} breached tickets logged.`);

  // 12. Full Lifecycle Audit Trail Inspection
  console.log("\n[STEP 12] Tamper-Evident Chronological Audit Log Inspection (FEAT-33)...");
  const auditRes = await fetch(`${API_URL}/tickets/${ticketId}/audit-log`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const logs = await auditRes.json();
  console.log(`  ✅ Retrieved ${logs.length} audit entries:`);
  logs.forEach((log) => {
    console.log(`     - [${log.action.toUpperCase()}] at ${log.timestamp} by ${log.actor?.name || log.actor_id}: ${log.details}`);
  });
  if (logs.length < 5) throw new Error("Audit log incomplete");

  console.log("\n================================================================================");
  console.log("       MASTER E2E VERIFICATION COMPLETED WITH 100% SUCCESS ACROSS ALL ROLES     ");
  console.log("================================================================================\n");

  return { ticketId, custId };
}

runMasterE2E()
  .then((res) => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MASTER E2E VERIFICATION FAILED:", err);
    process.exit(1);
  });
