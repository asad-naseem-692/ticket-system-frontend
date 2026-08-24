// Master End-to-End System Verification across Customer, Agent, and Admin roles against live Railway PostgreSQL
const API_URL = "http://127.0.0.1:8000";

async function runMasterE2E() {
  console.log("================================================================================");
  console.log("       STARTING RIGOROUS MASTER END-TO-END SYSTEM VERIFICATION                  ");
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

  // 2. Customer Ticket Submission (Low Priority)
  console.log("\n[STEP 2] Customer Ticket Submission & Auto-Priority Scoring...");
  const createTicketRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Simple documentation question",
      category: "General Inquiry",
      description: "How can I update my notification preferences in the dashboard?",
    }),
  });
  const createdTicket = await createTicketRes.json();
  const ticketId = createdTicket.id;
  const initialPriority = createdTicket.priority;
  const initialDeadline = new Date(createdTicket.deadline_at).getTime();

  console.log(`  ✅ Ticket #${ticketId.slice(0, 8)} created.`);
  console.log(`     Auto-scored Initial Priority: "${initialPriority}" (Expected: low)`);
  console.log(`     Initial SLA Deadline (72h): ${createdTicket.deadline_at}`);

  if (initialPriority !== "low") {
    throw new Error(`Expected initial priority to be 'low', but got '${initialPriority}'`);
  }

  // 3. Admin All Tickets & Filters
  console.log("\n[STEP 3] Admin Dashboard & Filter Inspection...");
  const adminAllRes = await fetch(`${API_URL}/tickets?category=General%20Inquiry`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminTickets = await adminAllRes.json();
  const foundTicket = adminTickets.find((t) => t.id === ticketId);
  if (!foundTicket) throw new Error("Ticket not found in admin filtered list");
  console.log("  ✅ Admin successfully queried tickets with category filter.");

  // 4. Rigorous Priority Override (Low -> Critical)
  console.log("\n[STEP 4] Rigorous Priority Override Verification (FEAT-15: low -> critical)...");
  const overrideRes = await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });
  const overriddenTicket = await overrideRes.json();
  const newPriority = overriddenTicket.priority;
  const newDeadline = new Date(overriddenTicket.deadline_at).getTime();

  console.log(`     Old Priority: "${initialPriority}" -> New Priority: "${newPriority}"`);
  console.log(`     Old Deadline (72h): ${new Date(initialDeadline).toISOString()}`);
  console.log(`     New Deadline (2h):  ${new Date(newDeadline).toISOString()}`);

  if (newPriority !== "critical") {
    throw new Error(`Priority override failed: expected 'critical', got '${newPriority}'`);
  }
  if (newDeadline >= initialDeadline) {
    throw new Error("SLA deadline was not properly reduced upon priority escalation to critical!");
  }

  const hoursReduced = Math.round((initialDeadline - newDeadline) / (1000 * 60 * 60));
  console.log(`  ✅ Priority and SLA deadline successfully recalculated (reduced by ~${hoursReduced} hours).`);

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
      content: "Here is additional context regarding the documentation request.",
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
      content: "CONFIDENTIAL: Internal staff note for troubleshooting.",
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
  const dummyLog = "DEBUG LOG: [2026-08-24] Preference settings documentation";
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="preferences.txt"\r\n` +
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
  if (!downloadedText.includes("Preference settings documentation")) throw new Error("Corrupted attachment stream");
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

  // 10. Rigorous SLA Breach & Notification Verification
  console.log("\n[STEP 10] Rigorous SLA Breach Detection & Notification Alert Verification...");
  // Create an explicit ticket to breach
  const breachTicketRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      title: "Overdue SLA Test Case Ticket",
      category: "Technical Issue",
      description: "Dedicated test ticket to verify background breach detection.",
    }),
  });
  const breachTicket = await breachTicketRes.json();
  const breachTicketId = breachTicket.id;

  // Assign to Agent 1
  await fetch(`${API_URL}/tickets/${breachTicketId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ agent_id: agentId }),
  });

  // Verify before check: sla_breached is false
  if (breachTicket.sla_breached !== false) {
    throw new Error("Initial sla_breached should be false!");
  }

  // Set the deadline to 2 hours in the past in the database directly
  const { execSync } = await import("child_process");
  execSync(
    `python -c "from app.core.database import SessionLocal; from app.models import Ticket; from datetime import datetime, timezone, timedelta; db = SessionLocal(); t = db.query(Ticket).filter(Ticket.id == '${breachTicketId}').first(); t.deadline_at = datetime.now(timezone.utc) - timedelta(hours=2); db.commit(); db.close()"`,
    { cwd: "d:/customer-support-ticket/backend" }
  );

  console.log(`     Manually simulated overdue deadline for ticket #${breachTicketId.slice(0, 8)}`);

  // Run the background SLA check
  const slaTriggerRes = await fetch(`${API_URL}/notifications/sla-check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const scanResult = await slaTriggerRes.json();
  console.log("     SLA Monitor Scan Result:", scanResult);

  // Fetch updated ticket and verify sla_breached flipped to true
  const updatedBreachedRes = await fetch(`${API_URL}/tickets/${breachTicketId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const updatedBreachedTicket = await updatedBreachedRes.json();
  console.log(`     Updated Ticket sla_breached flag: ${updatedBreachedTicket.sla_breached}`);
  if (updatedBreachedTicket.sla_breached !== true) {
    throw new Error(`Expected sla_breached to flip to true, but remained ${updatedBreachedTicket.sla_breached}`);
  }

  // Fetch Agent 1 notifications and confirm real sla_breach notification was created
  const agentNotifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const agentNotifs = await agentNotifsRes.json();
  const breachNotif = agentNotifs.find(
    (n) => n.ticket_id === breachTicketId && n.type === "sla_breach"
  );
  if (!breachNotif) {
    throw new Error(`No 'sla_breach' notification found for ticket #${breachTicketId} in Agent 1's feed!`);
  }
  console.log(`  ✅ Confirmed: sla_breached flipped to true AND real alert dispatched to Agent: "${breachNotif.message}"`);

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
  console.log("       RIGOROUS MASTER E2E VERIFICATION COMPLETED WITH 100% SUCCESS             ");
  console.log("================================================================================\n");

  return { ticketId, breachTicketId, custId };
}

runMasterE2E()
  .then((res) => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MASTER E2E VERIFICATION FAILED:", err);
    process.exit(1);
  });
