import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  isDemo?: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // 1. Check demo/sandbox session cookie
  const cookieStore = cookies();
  const demoCookie = cookieStore.get("buildprofile_demo_user");
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      return {
        id: parsed.id || "demo-user-uuid-12345",
        email: parsed.email || "alex.chen@example.com",
        full_name: parsed.full_name || "Alex Chen",
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
      return {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        isDemo: false,
      };
    }
  } catch {
    // If Supabase is unconfigured or unreachable
  }

  return null;
}
