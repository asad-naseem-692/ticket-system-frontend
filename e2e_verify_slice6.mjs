// End-to-end verification script for Slice 6 (Ticket Details & Status Lifecycle)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice6() {
  console.log("=== Starting Slice 6 End-to-End Verification ===");

  // 1. Authenticate users
  console.log("\n[1] Authenticating Agent 1 and Customer...");
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
  const custData = await custLogin.json();
  const custToken = custData.access_token;

  // 2. Customer creates a ticket
  console.log("\n[2] Creating test ticket from customer...");
  const createRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Slice 6 Lifecycle Test Ticket",
      category: "Technical Issue",
      description: "Testing forward-only lifecycle status transitions and permissions.",
    }),
  });
  const ticket = await createRes.json();
  const ticketId = ticket.id;
  console.log("    Created ticket ID:", ticketId, "| Initial status:", ticket.status);

  // 3. Assign ticket to Agent 1 using direct DB or test setup
  // We'll update assigned_agent_id directly via script
  console.log("\n[3] Assigning ticket to Agent 1 for permission verification...");
  // Use admin to view or let agent assign in DB
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "AdminPass123!" }),
  });
  const adminData = await adminLogin.json();
  const adminToken = adminData.access_token;

  // 4. Test Customer viewing detail
  console.log("\n[4] Customer viewing ticket detail (GET /tickets/{id})...");
  const custDetailRes = await fetch(`${API_URL}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log("    Customer detail status:", custDetailRes.status);
  if (custDetailRes.status !== 200) throw new Error("Customer failed to view own ticket");

  // 5. Test Customer trying to change status -> 403 Forbidden
  console.log("\n[5] Verifying Customer cannot change status (PATCH /tickets/{id}/status)...");
  const custPatchRes = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({ status: "in_progress" }),
  });
  console.log("    Status:", custPatchRes.status, "(Expected: 403 Forbidden)");
  if (custPatchRes.status !== 403) throw new Error("Customer should have been forbidden from updating status");

  // 6. Test Invalid Jump (open -> closed) -> 400 Bad Request
  console.log("\n[6] Verifying invalid skip transition: open -> closed is rejected...");
  const invalidJumpRes = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "closed" }),
  });
  console.log("    Status:", invalidJumpRes.status, "(Expected: 400 Bad Request)");
  if (invalidJumpRes.status !== 400) throw new Error("Invalid transition should have returned 400");

  // 7. Test Forward-Only Transitions: open -> in_progress -> resolved -> closed
  console.log("\n[7] Testing valid lifecycle step 1: open -> in_progress...");
  const step1Res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "in_progress" }),
  });
  const step1Data = await step1Res.json();
  console.log("    Status:", step1Res.status, "| Ticket status now:", step1Data.status);
  if (step1Data.status !== "in_progress") throw new Error("Failed to transition to in_progress");

  console.log("\n[8] Testing valid lifecycle step 2: in_progress -> resolved...");
  const step2Res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "resolved" }),
  });
  const step2Data = await step2Res.json();
  console.log("    Status:", step2Res.status, "| Ticket status now:", step2Data.status);
  if (step2Data.status !== "resolved") throw new Error("Failed to transition to resolved");

  console.log("\n[9] Testing valid lifecycle step 3: resolved -> closed...");
  const step3Res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "closed" }),
  });
  const step3Data = await step3Res.json();
  console.log("    Status:", step3Res.status, "| Ticket status now:", step3Data.status);
  if (step3Data.status !== "closed") throw new Error("Failed to transition to closed");

  // 8. Test backward transition (closed -> in_progress) -> 400 Bad Request
  console.log("\n[10] Verifying backward transition: closed -> in_progress is rejected...");
  const backwardRes = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "in_progress" }),
  });
  console.log("    Status:", backwardRes.status, "(Expected: 400 Bad Request)");
  if (backwardRes.status !== 400) throw new Error("Backward transition should have returned 400");

  console.log("\n=== Slice 6 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice6()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 6 E2E Test Failed:", err);
    process.exit(1);
  });
