// End-to-end verification script for Slice 8 (Comments, Public Replies & Attachments)
const API_URL = "http://127.0.0.1:8000";

async function runE2ESlice8() {
  console.log("=== Starting Slice 8 End-to-End Verification ===");

  // 1. Authenticate users
  console.log("\n[1] Authenticating Customer, Agent, and Admin...");
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

  const cust1Login = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seed-customer@example.com", password: "CustomerPass123!" }),
  });
  const cust1Token = (await cust1Login.json()).access_token;

  // 2. Customer creates a ticket
  console.log("\n[2] Customer creating a test ticket...");
  const createRes = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cust1Token}`,
    },
    body: JSON.stringify({
      title: "Slice 8 Communication Verification Ticket",
      category: "Technical Issue",
      description: "Testing notes, replies, and attachment uploads.",
    }),
  });
  const ticket = await createRes.json();
  const ticketId = ticket.id;
  console.log("    Ticket created:", ticketId);

  // Admin assigns ticket to Agent 1
  await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ agent_id: agentId }),
  });

  // 3. Customer posts public reply
  console.log("\n[3] Customer posting a public reply...");
  const custReplyRes = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cust1Token}`,
    },
    body: JSON.stringify({
      content: "Hello agent, here is additional context regarding the issue.",
      visibility: "public",
    }),
  });
  console.log("    Public reply status:", custReplyRes.status);
  if (custReplyRes.status !== 201) throw new Error("Failed to post public reply");

  // 4. Agent posts internal note
  console.log("\n[4] Agent posting an internal staff note...");
  const agentNoteRes = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({
      content: "Internal note: Checked database logs, indexing was delayed.",
      visibility: "internal",
    }),
  });
  console.log("    Internal note status:", agentNoteRes.status);
  if (agentNoteRes.status !== 201) throw new Error("Failed to post internal note");

  // 5. Customer attempts to post internal note -> 403 Forbidden
  console.log("\n[5] Verifying customer is forbidden from posting internal notes...");
  const custInternalFail = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cust1Token}`,
    },
    body: JSON.stringify({
      content: "Sneaky internal note attempt",
      visibility: "internal",
    }),
  });
  console.log("    Customer internal note attempt status:", custInternalFail.status, "(Expected: 403)");
  if (custInternalFail.status !== 403) throw new Error("Customer should have received 403");

  // 6. Verify Customer views only public comments
  console.log("\n[6] Customer fetching ticket details & verifying internal note isolation...");
  const custTicketDetailRes = await fetch(`${API_URL}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${cust1Token}` },
  });
  const custTicketData = await custTicketDetailRes.json();
  const custComments = custTicketData.comments || [];
  console.log("    Total comments visible to customer:", custComments.length);
  const hasInternal = custComments.some((c) => c.visibility === "internal");
  if (hasInternal) throw new Error("CRITICAL SECURITY VIOLATION: Customer can see internal notes!");
  console.log("    Internal notes hidden from customer: verified ✅");

  // 7. Verify Agent views all comments including internal notes
  console.log("\n[7] Agent fetching ticket details & verifying full thread visibility...");
  const agentTicketDetailRes = await fetch(`${API_URL}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  const agentTicketData = await agentTicketDetailRes.json();
  const agentComments = agentTicketData.comments || [];
  console.log("    Total comments visible to agent:", agentComments.length);
  const agentHasInternal = agentComments.some((c) => c.visibility === "internal");
  if (!agentHasInternal) throw new Error("Agent should be able to see internal notes");
  console.log("    Internal notes visible to staff: verified ✅");

  // 8. Test Attachment Upload (multipart form-data)
  console.log("\n[8] Customer uploading a log file attachment...");
  const formBoundary = "----WebKitFormBoundaryE2ETest";
  const fileContent = "Diagnostic log trace 12345";
  const body = [
    `--${formBoundary}`,
    'Content-Disposition: form-data; name="file"; filename="debug_trace.log"',
    "Content-Type: text/plain",
    "",
    fileContent,
    `--${formBoundary}--`,
  ].join("\r\n");

  const uploadRes = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formBoundary}`,
      Authorization: `Bearer ${cust1Token}`,
    },
    body: body,
  });
  const uploadData = await uploadRes.json();
  console.log("    Upload status:", uploadRes.status, "| Attachment ID:", uploadData.id);
  if (uploadRes.status !== 201) throw new Error("Attachment upload failed");

  // 9. Test Attachment Download
  console.log("\n[9] Customer downloading the uploaded attachment...");
  const downloadRes = await fetch(`${API_URL}/attachments/${uploadData.id}`, {
    headers: { Authorization: `Bearer ${cust1Token}` },
  });
  const downloadedText = await downloadRes.text();
  console.log("    Download status:", downloadRes.status, "| Content match:", downloadedText === fileContent);
  if (downloadedText !== fileContent) throw new Error("Downloaded attachment content did not match");

  console.log("\n=== Slice 8 End-to-End Verification PASSED Successfully! ===");
}

runE2ESlice8()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Slice 8 E2E Test Failed:", err);
    process.exit(1);
  });
