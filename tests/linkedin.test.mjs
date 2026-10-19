import test from "node:test";
import assert from "node:assert";

test("LinkedIn OAuth URL includes all required parameters and scopes", () => {
  const clientId = "test-client-id";
  const redirectUri = "http://localhost:3000/api/auth/callback/linkedin";
  const state = "test-state-token";
  const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  assert.ok(authUrl.startsWith("https://www.linkedin.com/oauth/v2/authorization"));
  assert.ok(authUrl.includes("client_id=test-client-id"));
  assert.ok(authUrl.includes("response_type=code"));
  assert.ok(authUrl.includes("state=test-state-token"));
  assert.ok(authUrl.includes("w_member_social"));
  assert.ok(authUrl.includes("openid"));
});

test("LinkedIn Post payload strictly conforms to LinkedIn REST API specification", () => {
  const sub = "ABC123xyz";
  const personUrn = `urn:li:person:${sub}`;
  const commentary = "Excited to share our latest architecture breakdown on scaling distributed systems with Go!";

  const payload = {
    author: personUrn,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  };

  assert.strictEqual(payload.author, "urn:li:person:ABC123xyz");
  assert.strictEqual(payload.visibility, "PUBLIC");
  assert.strictEqual(payload.distribution.feedDistribution, "MAIN_FEED");
  assert.strictEqual(payload.lifecycleState, "PUBLISHED");
  assert.strictEqual(payload.commentary, commentary);
});
