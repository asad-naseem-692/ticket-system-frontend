// End-to-end verification script for Slice 5 (Ticket Lists & Badges)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice5() {
  console.log("=== Starting Slice 5 End-to-End Verification ===");

  // 1. Customer Login and /tickets/mine
  console.log("\n[1] Testing Customer ticket retrieval (GET /tickets/mine)...");
  const custLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "seed-customer@example.com",
      password: "CustomerPass123!",
    }),
  });
  const custData = await custLogin.json();
  if (custLogin.status !== 200) throw new Error("Customer login failed");

  const custTicketsRes = await fetch(`${API_URL}/tickets/mine`, {
    headers: { Authorization: `Bearer ${custData.access_token}` },
  });
  const custTickets = await custTicketsRes.json();
  console.log("    Status:", custTicketsRes.status, "| Total customer tickets:", custTickets.length);
  if (custTicketsRes.status !== 200 || !Array.isArray(custTickets)) {
    throw new Error("Failed to fetch customer tickets");
  }
  for (const t of custTickets) {
    if (t.customer_id !== custData.user.id) {
      throw new Error(`Customer received ticket belonging to someone else: ${t.id}`);
    }
  }

  // 2. Agent Login and /tickets/assigned
  console.log("\n[2] Testing Agent assigned tickets (GET /tickets/assigned)...");
  const agentLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "agent1@example.com",
      password: "AgentPass123!",
    }),
  });
  const agentData = await agentLogin.json();
  if (agentLogin.status !== 200) throw new Error("Agent login failed");

  const agentTicketsRes = await fetch(`${API_URL}/tickets/assigned`, {
    headers: { Authorization: `Bearer ${agentData.access_token}` },
  });
  const agentTickets = await agentTicketsRes.json();
  console.log("    Status:", agentTicketsRes.status, "| Total assigned tickets:", agentTickets.length);
  if (agentTicketsRes.status !== 200 || !Array.isArray(agentTickets)) {
    throw new Error("Failed to fetch agent assigned tickets");
  }

  // 3. Customer forbidden from /tickets/assigned
  console.log("\n[3] Verifying Customer is forbidden from GET /tickets/assigned...");
  const forbiddenRes = await fetch(`${API_URL}/tickets/assigned`, {
    headers: { Authorization: `Bearer ${custData.access_token}` },
  });
  console.log("    Status:", forbiddenRes.status, "(Expected: 403 Forbidden)");
  if (forbiddenRes.status !== 403) {
    throw new Error(`Customer should be 403 forbidden, got: ${forbiddenRes.status}`);
  }

  // 4. Admin Login and /tickets (All)
  console.log("\n[4] Testing Admin all tickets overview (GET /tickets)...");
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "AdminPass123!",
    }),
  });
  const adminData = await adminLogin.json();
  if (adminLogin.status !== 200) throw new Error("Admin login failed");

  const allTicketsRes = await fetch(`${API_URL}/tickets`, {
    headers: { Authorization: `Bearer ${adminData.access_token}` },
  });
  const allTickets = await allTicketsRes.json();
  console.log("    Status:", allTicketsRes.status, "| Total system tickets:", allTickets.length);
  if (allTicketsRes.status !== 200 || !Array.isArray(allTickets)) {
    throw new Error("Failed to fetch all tickets as admin");
  }

  // 5. Admin filtering
  console.log("\n[5] Testing Admin filtering by status (GET /tickets?status=open)...");
  const openFilterRes = await fetch(`${API_URL}/tickets?status=open`, {
    headers: { Authorization: `Bearer ${adminData.access_token}` },
  });
  const openTickets = await openFilterRes.json();
  console.log("    Status:", openFilterRes.status, "| Open tickets:", openTickets.length);
  for (const t of openTickets) {
    if (t.status !== "open") {
      throw new Error(`Filter error: ticket status is ${t.status}, expected open`);
    }
  }

  console.log("\n=== Slice 5 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice5()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 5 E2E Test Failed:", err);
    process.exit(1);
  });
