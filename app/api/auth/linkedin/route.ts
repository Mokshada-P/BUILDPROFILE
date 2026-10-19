import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLinkedInAuthUrl, getLinkedInConfig } from "@/lib/linkedin";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  // If not logged in, redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/dashboard/studio");
    return NextResponse.redirect(loginUrl);
  }

  const { isConfigured } = getLinkedInConfig();
  if (!isConfigured) {
    const errorUrl = new URL("/dashboard/studio", request.url);
    errorUrl.searchParams.set("error", "LinkedIn OAuth is not configured in .env.local");
    return NextResponse.redirect(errorUrl);
  }

  // Generate a cryptographically secure random state
  const state = crypto.randomBytes(24).toString("hex");

  try {
    const authUrl = getLinkedInAuthUrl(state);
    const response = NextResponse.redirect(authUrl);

    // Save state in secure cookie for CSRF validation during callback
    response.cookies.set("linkedin_oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    const redirectUrl = new URL("/dashboard/studio", request.url);
    redirectUrl.searchParams.set("error", error?.message || "Failed to initiate LinkedIn OAuth");
    return NextResponse.redirect(redirectUrl);
  }
}
