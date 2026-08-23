// E2E test for Slice 3 Password Reset
const API_URL = "http://localhost:8000";

async function runTest() {
  console.log("=== Testing Slice 3: Password Reset End-to-End ===");
  const testEmail = `reset_flow_${Date.now()}@example.com`;
  const initialPassword = "InitialPassword123!";
  const newPassword = "NewResetPassword456!";

  // 1. Create a test account
  console.log("\n[1] Creating temporary test user:", testEmail);
  const signupRes = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Reset Flow Tester",
      email: testEmail,
      password: initialPassword,
      role: "customer",
    }),
  });
  if (signupRes.status !== 201) throw new Error("Failed to create test user");
  console.log("    User created successfully (201 Created)");

  // 2. Request password reset
  console.log("\n[2] Requesting password reset token (POST /auth/request-reset)...");
  const requestRes = await fetch(`${API_URL}/auth/request-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const requestData = await requestRes.json();
  console.log("    Status:", requestRes.status, "| Response:", requestData);
  if (requestRes.status !== 200 || !requestData.reset_token) {
    throw new Error("Failed to obtain reset token");
  }

  // 3. Confirm password reset with token
  console.log("\n[3] Confirming password reset with token (POST /auth/confirm-reset)...");
  const confirmRes = await fetch(`${API_URL}/auth/confirm-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: requestData.reset_token,
      new_password: newPassword,
    }),
  });
  const confirmData = await confirmRes.json();
  console.log("    Status:", confirmRes.status, "| Response:", confirmData);
  if (confirmRes.status !== 200) {
    throw new Error("Failed to confirm password reset");
  }

  // 4. Test old password fails
  console.log("\n[4] Verifying old password fails at login...");
  const oldLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: initialPassword }),
  });
  console.log("    Old password login status:", oldLoginRes.status, "(Expected 401)");
  if (oldLoginRes.status !== 401) throw new Error("Old password should have been rejected");

  // 5. Test new password succeeds
  console.log("\n[5] Verifying new password succeeds at login...");
  const newLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  const newLoginData = await newLoginRes.json();
  console.log("    New password login status:", newLoginRes.status, "| Token received:", !!newLoginData.access_token);
  if (newLoginRes.status !== 200 || !newLoginData.access_token) {
    throw new Error("New password login failed");
  }

  console.log("\n=== Slice 3 End-to-End Verification PASSED! ===");
}

runTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
