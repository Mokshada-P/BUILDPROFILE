import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exchangeCodeForToken, getLinkedInUserInfo } from "@/lib/linkedin";
import { updateProfile } from "@/lib/profile-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const targetRedirect = new URL("/dashboard/studio", request.url);

  // Check for OAuth error response
  if (errorParam) {
    targetRedirect.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(targetRedirect);
  }

  // Validate state
  const storedState = request.cookies.get("linkedin_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    targetRedirect.searchParams.set("error", "OAuth state mismatch. Please try connecting again.");
    return NextResponse.redirect(targetRedirect);
  }

  if (!code) {
    targetRedirect.searchParams.set("error", "Missing authorization code from LinkedIn.");
    return NextResponse.redirect(targetRedirect);
  }

  // Verify user is authenticated
  const user = await getCurrentUser(request);
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/dashboard/studio");
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    // 2. Fetch member identity from userinfo endpoint
    const userInfo = await getLinkedInUserInfo(accessToken);
    const authorUrn = `urn:li:person:${userInfo.sub}`;

    // Calculate token expiry timestamp
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000).toISOString();

    // 3. Store the access token and author URN linked to the authenticated user
    await updateProfile(user.id, {
      linkedin_access_token: accessToken,
      linkedin_member_urn: authorUrn,
      linkedin_token_expires_at: expiresAt,
      linkedin_profile_data: {
        sub: userInfo.sub,
        name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
        email: userInfo.email,
        picture: userInfo.picture,
      },
    });

    targetRedirect.searchParams.set("linkedin_connected", "true");
    targetRedirect.searchParams.set("member_name", userInfo.name || "LinkedIn User");

    const response = NextResponse.redirect(targetRedirect);
    // Clear state cookie
    response.cookies.delete("linkedin_oauth_state");
    return response;
  } catch (err: any) {
    console.error("LinkedIn OAuth callback error:", err);
    targetRedirect.searchParams.set("error", err?.message || "Failed to complete LinkedIn connection.");
    const response = NextResponse.redirect(targetRedirect);
    response.cookies.delete("linkedin_oauth_state");
    return response;
  }
}
