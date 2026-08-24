// End-to-end verification script for Slice 7 (Assignment, Reassignment & Priority Override)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice7() {
  console.log("=== Starting Slice 7 End-to-End Verification ===");

  // 1. Authenticate users
  console.log("\n[1] Authenticating Customer, Agents, and Admin...");
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "AdminPass123!" }),
  });
  const adminData = await adminLogin.json();
  const adminToken = adminData.access_token;

  const agent1Login = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent1@example.com", password: "AgentPass123!" }),
  });
  const agent1Data = await agent1Login.json();
  const agent1Token = agent1Data.access_token;
  const agent1Id = agent1Data.user.id;

  const agent2Login = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "agent2@example.com", password: "AgentPass123!" }),
  });
  const agent2Data = await agent2Login.json();
  const agent2Token = agent2Data.access_token;
  const agent2Id = agent2Data.user.id;

  const custLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seed-customer@example.com", password: "CustomerPass123!" }),
  });
  const custData = await custLogin.json();
  const custToken = custData.access_token;

  // 2. Fetch list of agents (GET /users/agents)
  console.log("\n[2] Testing GET /users/agents...");
  const agentsRes = await fetch(`${API_URL}/users/agents`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const agentsList = await agentsRes.json();
  console.log("    Total agents found:", agentsList.length);
  if (agentsRes.status !== 200 || agentsList.length < 2) {
    throw new Error("Failed to retrieve agent list");
  }

  // 3. Customer creates an initial low-priority ticket
  console.log("\n[3] Customer creating a low-priority ticket...");
  const createRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      title: "Slice 7 Priority & Assignment Test Ticket",
      category: "General Inquiry",
      description: "Initial ticket with low priority to test admin override and assignment.",
    }),
  });
  const ticket = await createRes.json();
  const ticketId = ticket.id;
  console.log("    Ticket created:", ticketId, "| Initial priority:", ticket.priority);
  if (ticket.priority !== "low") throw new Error("Expected initial priority to be low");

  // 4. Test unauthorized priority override (Customer & Agent receive 403)
  console.log("\n[4] Verifying Customer and Agent cannot override priority...");
  const custOverrideRes = await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });
  console.log("    Customer override status:", custOverrideRes.status, "(Expected 403)");
  if (custOverrideRes.status !== 403) throw new Error("Customer should be forbidden from overriding priority");

  const agentOverrideRes = await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agent1Token}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });
  console.log("    Agent override status:", agentOverrideRes.status, "(Expected 403)");
  if (agentOverrideRes.status !== 403) throw new Error("Agent should be forbidden from overriding priority");

  // 5. Admin overrides priority to critical
  console.log("\n[5] Admin overriding priority to 'critical'...");
  const adminOverrideRes = await fetch(`${API_URL}/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ priority: "critical" }),
  });
  const updatedTicket = await adminOverrideRes.json();
  console.log("    Admin override status:", adminOverrideRes.status, "| New priority:", updatedTicket.priority);
  if (updatedTicket.priority !== "critical") throw new Error("Priority was not updated to critical");

  // Check SLA deadline recalculated to ~2h
  const created = new Date(updatedTicket.created_at).getTime();
  const deadline = new Date(updatedTicket.deadline_at).getTime();
  const diffHours = Math.round((deadline - created) / (1000 * 60 * 60));
  console.log(`    Recalculated SLA duration: ${diffHours} hours (Expected: 2 hours)`);
  if (diffHours !== 2) throw new Error(`Expected recalculated SLA duration to be 2h, got ${diffHours}h`);

  // 6. Admin assigns ticket to Agent 1 (POST /tickets/{id}/assign)
  console.log("\n[6] Admin assigning ticket to Agent 1...");
  const assignRes = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agent1Id }),
  });
  const assignedData = await assignRes.json();
  console.log("    Assignment status:", assignRes.status, "| Assigned Agent ID:", assignedData.assigned_agent_id);
  if (assignedData.assigned_agent_id !== agent1Id) throw new Error("Failed to assign ticket to Agent 1");

  // 7. Admin reassigns ticket to Agent 2 (PATCH /tickets/{id}/reassign)
  console.log("\n[7] Admin reassigning ticket to Agent 2...");
  const reassignRes = await fetch(`${API_URL}/tickets/${ticketId}/reassign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agent2Id }),
  });
  const reassignedData = await reassignRes.json();
  console.log("    Reassignment status:", reassignRes.status, "| Assigned Agent ID:", reassignedData.assigned_agent_id);
  if (reassignedData.assigned_agent_id !== agent2Id) throw new Error("Failed to reassign ticket to Agent 2");

  // 8. Verify Agent 2 queue receives ticket and Agent 1 queue does not
  console.log("\n[8] Verifying Agent queues reflection...");
  const agent2QueueRes = await fetch(`${API_URL}/tickets/assigned`, {
    headers: { Authorization: `Bearer ${agent2Token}` },
  });
  const agent2Tickets = await agent2QueueRes.json();
  const foundInAgent2 = agent2Tickets.some((t) => t.id === ticketId);
  console.log("    Found in Agent 2 assigned queue:", foundInAgent2, "(Expected: true)");
  if (!foundInAgent2) throw new Error("Ticket not found in Agent 2 queue");

  const agent1QueueRes = await fetch(`${API_URL}/tickets/assigned`, {
    headers: { Authorization: `Bearer ${agent1Token}` },
  });
  const agent1Tickets = await agent1QueueRes.json();
  const foundInAgent1 = agent1Tickets.some((t) => t.id === ticketId);
  console.log("    Found in Agent 1 assigned queue:", foundInAgent1, "(Expected: false)");
  if (foundInAgent1) throw new Error("Ticket should not be in Agent 1 queue after reassignment");

  console.log("\n=== Slice 7 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice7()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 7 E2E Test Failed:", err);
    process.exit(1);
  });
