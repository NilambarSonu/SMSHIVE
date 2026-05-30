async function testClerk() {
  const publishableKey = "pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk";
  
  const stripped = publishableKey.replace('pk_test_', '').replace('pk_live_', '');
  const decoded = Buffer.from(stripped, 'base64').toString('utf-8').replace(/\$$/, '');
  const frontendApiBase = `https://${decoded}`;

  console.log("Step 1: Creating sign-in attempt...");
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
  const attemptId = json1.response?.id || json1.client?.sign_in?.id;
  const clientToken = res1.headers.get('authorization');

  console.log("Attempt ID:", attemptId);

  console.log("\nStep 2: Authenticating with password...");
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
  console.log("Step 2 status:", res2.status, json2.response?.status);

  const clientToken2 = res2.headers.get('authorization') || clientToken;

  console.log("\nStep 3: Preparing second factor (email_code)...");
  const params3 = new URLSearchParams();
  params3.append('strategy', 'email_code');

  const res3 = await fetch(`${frontendApiBase}/v1/client/sign_ins/${attemptId}/prepare_second_factor`, {
    method: 'POST',
    headers: {
      'Authorization': clientToken2 || `Bearer ${publishableKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params3.toString()
  });

  const json3 = await res3.json();
  console.log("Step 3 status:", res3.status);
  console.log(JSON.stringify(json3, null, 2));
}

testClerk();
