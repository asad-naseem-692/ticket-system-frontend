// End-to-end verification script for Slice 10 (Reporting, Analytics & Audit Trail)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice10() {
  console.log("=== Starting Slice 10 End-to-End Verification ===");

  // 1. Authenticate users
  console.log("\n[1] Authenticating Admin, Agent, and Customer...");
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "AdminPass123!" }),
  });
  const adminToken = (await adminLogin.json()).access_token;

  const agentLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent1@example.com", password: "AgentPass123!" }),
  });
  const agentData = await agentLogin.json();
  const agentToken = agentData.access_token;
  const agent1Id = agentData.user.id;

  const custLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seed-customer@example.com", password: "CustomerPass123!" }),
  });
  const custToken = (await custLogin.json()).access_token;

  // 2. Test Reports RBAC & Summaries
  console.log("\n[2] Testing Reports RBAC & Analytics endpoints...");
  const custSummaryRes = await fetch(`${API_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log("    Customer access /reports/summary status:", custSummaryRes.status, "(Expected: 403)");
  if (custSummaryRes.status !== 403) throw new Error("Customer should be forbidden from reports");

  const agentSummaryRes = await fetch(`${API_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  console.log("    Agent access /reports/summary status:", agentSummaryRes.status, "(Expected: 403)");
  if (agentSummaryRes.status !== 403) throw new Error("Agent should be forbidden from reports");

  const adminSummaryRes = await fetch(`${API_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const summaryData = await adminSummaryRes.json();
  console.log("    Admin summary report:", summaryData);
  if (adminSummaryRes.status !== 200) throw new Error("Admin summary fetch failed");

  const adminPerfRes = await fetch(`${API_URL}/reports/agent-performance`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const perfData = await adminPerfRes.json();
  console.log(`    Agent performance report: ${perfData.length} agents analyzed.`);
  if (adminPerfRes.status !== 200) throw new Error("Agent performance fetch failed");

  const adminBreachRes = await fetch(`${API_URL}/reports/sla-breaches`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const breachData = await adminBreachRes.json();
  console.log(`    SLA breaches report: ${breachData.length} breached tickets listed.`);
  if (adminBreachRes.status !== 200) throw new Error("SLA breach report fetch failed");

  // 3. Test Full Lifecycle Audit Trail Generation
  console.log("\n[3] Testing Tamper-Evident Closure and Lifecycle Audit Trail...");
  const createRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Slice 10 Audit Trail Verification Ticket",
      category: "Billing",
      description: "Full end-to-end lifecycle actions for audit logging.",
    }),
  });
  const ticket = await createRes.json();
  const ticketId = ticket.id;
  console.log("    Created ticket:", ticketId);

  // Assign to Agent 1
  await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agent1Id }),
  });

  // Priority override to critical
  await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });

  // Move in_progress -> resolved
  await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ status: "in_progress" }),
  });

  await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ status: "resolved" }),
  });

  // Close ticket
  await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "closed" }),
  });

  // Fetch Audit Log
  const auditRes = await fetch(`${API_URL}/tickets/${ticketId}/audit-log`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const logs = await auditRes.json();
  console.log(`    Retrieved ${logs.length} audit log entries for ticket:`);
  logs.forEach((log) => {
    console.log(`      - [${log.action}] by ${log.actor?.name || log.actor_id}: ${log.details}`);
  });

  if (logs.length < 5) throw new Error("Expected at least 5 audit log entries for full lifecycle");

  console.log("\n=== Slice 10 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice10()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 10 E2E Test Failed:", err);
    process.exit(1);
  });
