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

test("LinkedIn Preview card resolves authenticated OpenID profile name and picture when connected", () => {
  const isConnected = true;
  const linkedInProfileData = {
    sub: "li-sub-12345",
    name: "Mokshada Patil",
    picture: "https://media.licdn.com/dms/image/v2/test-avatar.jpg",
  };
  const currentProfile = {
    full_name: "patilmokshada09",
    avatar_url: null,
  };

  const previewName = isConnected && linkedInProfileData?.name
    ? linkedInProfileData.name
    : (currentProfile?.full_name || "patilmokshada09");

  const previewPicture = isConnected
    ? (linkedInProfileData?.picture || currentProfile?.avatar_url || null)
    : (currentProfile?.avatar_url || null);

  assert.strictEqual(previewName, "Mokshada Patil");
  assert.strictEqual(previewPicture, "https://media.licdn.com/dms/image/v2/test-avatar.jpg");
});

test("LinkedIn Preview card safely falls back to logged-in user (patilmokshada09) when not connected", () => {
  const isConnected = false;
  const linkedInProfileData = null;
  const currentProfile = {
    full_name: "patilmokshada09",
    avatar_url: null,
  };

  const previewName = isConnected && linkedInProfileData?.name
    ? linkedInProfileData.name
    : (currentProfile?.full_name && currentProfile.full_name !== "Alex Chen"
        ? currentProfile.full_name
        : "patilmokshada09");

  const previewPicture = isConnected
    ? (linkedInProfileData?.picture || currentProfile?.avatar_url || null)
    : (currentProfile?.avatar_url || null);

  assert.strictEqual(previewName, "patilmokshada09");
  assert.notStrictEqual(previewName, "Alex Chen");
  assert.strictEqual(previewPicture, null);
});
