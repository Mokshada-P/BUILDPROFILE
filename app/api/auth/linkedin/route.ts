import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLinkedInAuthUrl, getLinkedInConfig } from "@/lib/linkedin";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  let user = await getCurrentUser(request);
  let setDemoCookie = false;

  // If not logged in, auto-initialize demo user session for seamless development / testing
  if (!user) {
    user = {
      id: "demo-user-uuid-12345",
      email: "patilmokshada09@gmail.com",
      full_name: "patilmokshada09",
      isDemo: true,
    };
    setDemoCookie = true;
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

    // Save state in cookie for CSRF validation during callback
    response.cookies.set("linkedin_oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !request.url.includes("localhost"),
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    if (setDemoCookie) {
      response.cookies.set(
        "buildprofile_demo_user",
        JSON.stringify({
          id: "demo-user-uuid-12345",
          email: "patilmokshada09@gmail.com",
          full_name: "patilmokshada09",
          role: "Professional",
          created_at: new Date().toISOString(),
        }),
        {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          httpOnly: false,
        }
      );
    }

    return response;
  } catch (error: any) {
    const redirectUrl = new URL("/dashboard/studio", request.url);
    redirectUrl.searchParams.set("error", error?.message || "Failed to initiate LinkedIn OAuth");
    return NextResponse.redirect(redirectUrl);
  }
}
