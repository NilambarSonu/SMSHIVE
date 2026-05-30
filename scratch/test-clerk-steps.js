async function testClerk() {
  const publishableKey = "pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk";
  
  const stripped = publishableKey.replace('pk_test_', '').replace('pk_live_', '');
  const decoded = Buffer.from(stripped, 'base64').toString('utf-8').replace(/\$$/, '');
  const frontendApiBase = `https://${decoded}`;

  console.log("Step 1: Creating sign-in attempt (URL-encoded)...");
  const params1 = new URLSearchParams();
  params1.append('identifier', 'nilambarsonubehera@gmail.com');

  const res1 = await fetch(`${frontendApiBase}/v1/client/sign_ins`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publishableKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params1.toString()
  });

  const json1 = await res1.json();
  console.log("Step 1 status:", res1.status);
  console.log(JSON.stringify(json1, null, 2));

  const clientToken = res1.headers.get('authorization');
  console.log("Client Token (from Authorization header):", clientToken);

  const attemptId = json1.response?.id || json1.client?.sign_in?.id;
  if (!attemptId) {
    console.error("No attempt ID found!");
    return;
  }

  console.log(`\nStep 2: Attempting first factor for attempt ${attemptId} (URL-encoded)...`);
  const params2 = new URLSearchParams();
  params2.append('strategy', 'password');
  params2.append('password', 'Nilambar@2006');

  const res2 = await fetch(`${frontendApiBase}/v1/client/sign_ins/${attemptId}/attempt_first_factor`, {
    method: 'POST',
    headers: {
      'Authorization': clientToken || `Bearer ${publishableKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params2.toString()
  });

  const json2 = await res2.json();
  console.log("Step 2 status:", res2.status);
  console.log(JSON.stringify(json2, null, 2));
}

testClerk();
