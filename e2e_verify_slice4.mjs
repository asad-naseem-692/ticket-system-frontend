// End-to-end verification script for Slice 4 (Ticket Creation, Auto-Priority & SLA Calculation)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice4() {
  console.log("=== Starting Slice 4 End-to-End Verification ===");

  // 1. Authenticate as demo customer
  console.log("\n[1] Logging in as seed customer (seed-customer@example.com)...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "seed-customer@example.com",
      password: "CustomerPass123!",
    }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.access_token) {
    throw new Error(`Failed to log in as seed customer: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.access_token;
  const customerId = loginData.user.id;
  console.log("    Customer logged in successfully! User ID:", customerId);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const createdTicketIds = [];

  const testCases = [
    {
      name: "Critical Priority (Emergency / Outage)",
      payload: {
        title: "Total production cluster outage",
        category: "Emergency",
        description: "All services in EU region are unreachable and returning 502 bad gateway.",
      },
      expectedPriority: "critical",
      expectedSlaHours: 2,
    },
    {
      name: "High Priority (Billing / Payment Failed)",
      payload: {
        title: "Payment failed during invoice checkout",
        category: "Billing",
        description: "Customer credit card was charged but invoice state remains unpaid.",
      },
      expectedPriority: "high",
      expectedSlaHours: 8,
    },
    {
      name: "Medium Priority (Technical Issue / Bug)",
      payload: {
        title: "Bug in export CSV column alignment",
        category: "Technical Issue",
        description: "The third column is missing headers when exporting report data.",
      },
      expectedPriority: "medium",
      expectedSlaHours: 24,
    },
    {
      name: "Low Priority (General Inquiry)",
      payload: {
        title: "Question regarding team user seats",
        category: "General Inquiry",
        description: "How many active user seats are included in our current tier?",
      },
      expectedPriority: "low",
      expectedSlaHours: 72,
    },
  ];

  for (const tc of testCases) {
    console.log(`\n[Test] Creating ticket: "${tc.payload.title}"...`);
    const res = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(tc.payload),
    });
    const data = await res.json();
    console.log("       Status:", res.status);
    console.log("       Assigned Priority:", data.priority, `(Expected: ${tc.expectedPriority})`);
    console.log("       Ticket Status:", data.status, `(Expected: open)`);
    console.log("       Customer Binding:", data.customer_id, `(Expected: ${customerId})`);
    console.log("       Created At:", data.created_at);
    console.log("       Deadline At:", data.deadline_at);

    if (res.status !== 201) throw new Error(`Failed to create ticket: ${JSON.stringify(data)}`);
    if (data.priority !== tc.expectedPriority) throw new Error(`Priority mismatch: got ${data.priority}, expected ${tc.expectedPriority}`);
    if (data.customer_id !== customerId) throw new Error("Customer ID was not correctly bound from JWT");
    if (data.status !== "open") throw new Error("Ticket status should be open");
    if (data.sla_breached !== false) throw new Error("SLA breached should be false");

    // Verify SLA deadline calculation
    const created = new Date(data.created_at).getTime();
    const deadline = new Date(data.deadline_at).getTime();
    const diffHours = Math.round((deadline - created) / (1000 * 60 * 60));
    console.log(`       Calculated SLA Duration: ${diffHours} hours (Expected: ${tc.expectedSlaHours} hours)`);
    if (diffHours !== tc.expectedSlaHours) {
      throw new Error(`SLA deadline math error: calculated ${diffHours}h, expected ${tc.expectedSlaHours}h`);
    }

    createdTicketIds.push(data.id);
  }

  console.log("\n=== All 4 Ticket Priority and SLA Cases PASSED Successfully! ===");
}

runE2ESlice4()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("E2E Test Failed:", err);
    process.exit(1);
  });
