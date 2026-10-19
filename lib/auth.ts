import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  isDemo?: boolean;
}

export async function getCurrentUser(req?: Request | NextRequest): Promise<CurrentUser | null> {
  // 1. Check demo/sandbox session cookie
  let rawCookieValue: string | undefined;

  // If passed from a Route Handler
  if (req && "cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    rawCookieValue = (req as NextRequest).cookies.get("buildprofile_demo_user")?.value;
  }

  if (!rawCookieValue && req) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)buildprofile_demo_user=([^;]+)/);
      if (match) {
        rawCookieValue = match[1];
      }
    }
  }

  // Fallback to next/headers cookies() in Server Components / Actions
  if (!rawCookieValue) {
    try {
      const cookieStore = cookies();
      rawCookieValue = cookieStore.get("buildprofile_demo_user")?.value;
    } catch {
      // ignore
    }
  }

  if (rawCookieValue) {
    try {
      let rawVal = rawCookieValue;
      try {
        rawVal = decodeURIComponent(rawVal);
      } catch {
        // ignore
      }
      const parsed = JSON.parse(rawVal);
      const name = parsed.full_name || parsed.name || (parsed.email ? parsed.email.split("@")[0] : null);
      return {
        id: parsed.id || "demo-user-uuid-12345",
        email: parsed.email || "patilmokshada09@gmail.com",
        full_name: (!name || name === "Alex Chen") ? "patilmokshada09" : name,
        isDemo: true,
      };
    } catch {
      // ignore
    }
  }

  // 2. Check Supabase server session
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];
      return {
        id: user.id,
        email: user.email || "",
        full_name: (!name || name === "Alex Chen") ? "patilmokshada09" : name,
        isDemo: false,
      };
    }
  } catch {
    // If Supabase is unconfigured or unreachable
  }

  return null;
}
