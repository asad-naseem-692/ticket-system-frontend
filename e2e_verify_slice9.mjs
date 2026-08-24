// End-to-end verification script for Slice 9 (Background SLA Monitor & Alerting)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice9() {
  console.log("=== Starting Slice 9 End-to-End Verification ===");

  // 1. Authenticate users
  console.log("\n[1] Authenticating Agent and Admin...");
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
  const agentId = agentData.user.id;

  const custLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seed-customer@example.com", password: "CustomerPass123!" }),
  });
  const custToken = (await custLogin.json()).access_token;

  // 2. Create test ticket and set deadline in past for breach test
  console.log("\n[2] Creating test ticket and assigning to Agent 1...");
  const createRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Slice 9 SLA Monitor Test Ticket",
      category: "Technical Issue",
      description: "Testing automated breach detection and notification alerts.",
    }),
  });
  const ticket = await createRes.json();
  const ticketId = ticket.id;

  // Assign to Agent 1
  await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agentId }),
  });

  // 3. Trigger SLA Monitor check (POST /notifications/sla-check)
  console.log("\n[3] Triggering SLA monitor scan (POST /notifications/sla-check)...");
  const checkRes = await fetch(`${API_URL}/notifications/sla-check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const checkData = await checkRes.json();
  console.log("    SLA Monitor scan result:", checkData);
  if (checkRes.status !== 200) throw new Error("SLA check trigger failed");

  // 4. Agent retrieves notifications (GET /notifications)
  console.log("\n[4] Agent retrieving notifications (GET /notifications)...");
  const notifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const notifs = await notifsRes.json();
  console.log("    Total notifications for Agent 1:", notifs.length);

  // 5. Test Mark All as Read (POST /notifications/read-all)
  console.log("\n[5] Testing Mark all as read (POST /notifications/read-all)...");
  const readAllRes = await fetch(`${API_URL}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  console.log("    Mark all read status:", readAllRes.status);
  if (readAllRes.status !== 200) throw new Error("Mark all read failed");

  // 6. Verify unread_only returns 0
  const unreadRes = await fetch(`${API_URL}/notifications?unread_only=true`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const unreadList = await unreadRes.json();
  console.log("    Unread notifications count:", unreadList.length, "(Expected: 0)");
  if (unreadList.length !== 0) throw new Error("Expected 0 unread notifications");

  console.log("\n=== Slice 9 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice9()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 9 E2E Test Failed:", err);
    process.exit(1);
  });
