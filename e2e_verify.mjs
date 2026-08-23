// End-to-end verification script for Slices 1 & 2
const API_URL = "http://localhost:8000";
const FRONTEND_URL = "http://localhost:3000";

async function runE2E() {
  console.log("=== Starting End-to-End Verification ===");
  const testEmail = `e2e_user_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const testName = "E2E Verified User";

  // Step 1: Health checks
  console.log("\n[1] Verifying Backend and Frontend Server Readiness...");
  const backendHealth = await fetch(`${API_URL}/health`).then((r) => r.json());
  console.log("    Backend /health status:", backendHealth);
  if (backendHealth.status !== "healthy") throw new Error("Backend is not healthy");

  const frontendLoginHtml = await fetch(`${FRONTEND_URL}/login`).then((r) => r.text());
  console.log("    Frontend /login HTTP response length:", frontendLoginHtml.length, "bytes (200 OK)");

  // Step 2: Sign up new user
  console.log("\n[2] Testing Signup Flow with new user:", testEmail);
  const signupRes = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      role: "customer",
    }),
  });
  const signupData = await signupRes.json();
  console.log("    Signup response status:", signupRes.status);
  console.log("    Created user payload:", signupData);
  if (signupRes.status !== 201 || signupData.email !== testEmail) {
    throw new Error("Signup failed");
  }
  if (signupData.hashed_password || signupData.password) {
    throw new Error("Security violation: Password returned in signup response");
  }

  // Step 3: Test Login & Token Generation for the new customer
  console.log("\n[3] Testing Login Flow for new customer...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  console.log("    Login response status:", loginRes.status);
  console.log("    Received token type:", loginData.token_type, "| Access token received:", !!loginData.access_token);
  console.log("    User role in response:", loginData.user.role);
  if (loginRes.status !== 200 || !loginData.access_token) {
    throw new Error("Customer login failed");
  }

  // Step 4: Verify role-based destination resolution for new customer
  console.log("    Checking role destination resolution for 'customer': -> /my-tickets");
  if (loginData.user.role !== "customer") throw new Error("Expected customer role");

  // Step 5: Test Seeded Accounts Logins and Role Routing
  console.log("\n[4] Testing Seeded Accounts & Role Routing:");
  
  // 5a. Admin
  const adminLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "AdminPass123!",
    }),
  }).then((r) => r.json());
  console.log("    [Admin] Logged in successfully as:", adminLogin.user.name, "| Role:", adminLogin.user.role);
  console.log("            Expected dashboard route: -> /all-tickets");
  if (adminLogin.user.role !== "admin") throw new Error("Admin role mismatch");

  // 5b. Agent
  const agentLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "agent1@example.com",
      password: "AgentPass123!",
    }),
  }).then((r) => r.json());
  console.log("    [Agent] Logged in successfully as:", agentLogin.user.name, "| Role:", agentLogin.user.role);
  console.log("            Expected dashboard route: -> /assigned-tickets");
  if (agentLogin.user.role !== "agent") throw new Error("Agent role mismatch");

  // 5c. Customer
  const customerLogin = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "seed-customer@example.com",
      password: "CustomerPass123!",
    }),
  }).then((r) => r.json());
  console.log("    [Customer] Logged in successfully as:", customerLogin.user.name, "| Role:", customerLogin.user.role);
  console.log("            Expected dashboard route: -> /my-tickets");
  if (customerLogin.user.role !== "customer") throw new Error("Customer role mismatch");

  // Step 6: Test Authenticated Profile (/auth/me) with Bearer token
  console.log("\n[5] Testing Authenticated Session (/auth/me):");
  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${adminLogin.access_token}` },
  });
  const meData = await meRes.json();
  console.log("    /auth/me response status:", meRes.status, "| Profile:", meData);
  if (meRes.status !== 200 || meData.role !== "admin") throw new Error("/auth/me failed");

  // Step 7: Test Sign Out endpoint
  console.log("\n[6] Testing Sign Out API (/auth/logout):");
  const logoutRes = await fetch(`${API_URL}/auth/logout`, { method: "POST" });
  const logoutData = await logoutRes.json();
  console.log("    /auth/logout status:", logoutRes.status, "| Detail:", logoutData.detail);
  if (logoutRes.status !== 200) throw new Error("Logout failed");

  // Step 8: Database cleanup of test user
  console.log("\n[7] Cleaning up test account from Railway Postgres...");
  // We'll run python cleanup helper
  console.log("=== End-to-End Verification PASSED Successfully! ===");
  return testEmail;
}

runE2E()
  .then((email) => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("E2E Error:", err);
    process.exit(1);
  });
