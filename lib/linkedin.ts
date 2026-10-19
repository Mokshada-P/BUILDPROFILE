export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

export interface LinkedInUserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export interface LinkedInPostPayload {
  author: string; // e.g., urn:li:person:<sub_id>
  commentary: string;
  visibility?: "PUBLIC" | "CONNECTIONS";
  distribution?: {
    feedDistribution: "MAIN_FEED" | "NONE";
    targetEntities: any[];
    thirdPartyDistributionChannels: any[];
  };
  lifecycleState?: "PUBLISHED" | "DRAFT";
}

export function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/callback/linkedin";

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

export function getLinkedInAuthUrl(state: string): string {
  const { clientId, redirectUri } = getLinkedInConfig();
  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID is not configured in environment variables.");
  }

  const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getLinkedInConfig();

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn Client credentials are not configured.");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorDetail = parsed.error_description || parsed.error || errorText;
    } catch {
      // ignore
    }
    throw new Error(`LinkedIn token exchange failed (${response.status}): ${errorDetail}`);
  }

  return (await response.json()) as LinkedInTokenResponse;
}

export async function getLinkedInUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch LinkedIn user info (${response.status}): ${errorText}`);
  }

  return (await response.json()) as LinkedInUserInfo;
}

export async function publishLinkedInPost(
  accessToken: string,
  personUrn: string,
  commentary: string
): Promise<{ success: boolean; postId?: string; data?: any }> {
  // Ensure personUrn is properly prefixed with urn:li:person:
  const formattedUrn = personUrn.startsWith("urn:li:person:")
    ? personUrn
    : `urn:li:person:${personUrn}`;

  const payload: LinkedInPostPayload = {
    author: formattedUrn,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  };

  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202601",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // LinkedIn returns 201 Created with x-restli-id header containing the post URN
  const postId =
    response.headers.get("x-restli-id") ||
    response.headers.get("x-linkedin-id") ||
    undefined;

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.message || parsed.error || errorText;
    } catch {
      // ignore
    }
    throw new Error(`LinkedIn post publication failed (${response.status}): ${message}`);
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // empty response is common on 201
    }
  }

  return {
    success: true,
    postId: postId || (data?.id ? String(data.id) : undefined),
    data,
  };
}
