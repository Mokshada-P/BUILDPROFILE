import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile-service";
import { publishLinkedInPost } from "@/lib/linkedin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const commentary = body.commentary || body.text;
    const draftId = body.draftId;

    if (!commentary || typeof commentary !== "string" || !commentary.trim()) {
      return NextResponse.json(
        { error: "Post commentary text is required." },
        { status: 400 }
      );
    }

    // Retrieve user's stored LinkedIn access token and author URN
    const profile = await getProfile(user.id);
    const accessToken = profile?.linkedin_access_token;
    const personUrn = profile?.linkedin_member_urn;

    if (!accessToken || !personUrn) {
      return NextResponse.json(
        {
          error: "LinkedIn account is not connected. Please connect your LinkedIn profile first via the dashboard.",
          requiresAuth: true,
        },
        { status: 400 }
      );
    }

    // Publish to LinkedIn REST API
    const result = await publishLinkedInPost(accessToken, personUrn, commentary.trim());

    // Update draft status if draftId is supplied
    if (draftId) {
      try {
        const supabase = createClient();
        await supabase
          .from("post_drafts")
          .update({
            status: "published",
            updated_at: new Date().toISOString(),
          })
          .eq("id", draftId)
          .eq("user_id", user.id);
      } catch {
        // ignore offline fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: "Post successfully published to LinkedIn!",
      postId: result.postId,
      author: personUrn,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in /api/linkedin/post:", error);
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred while publishing to LinkedIn.",
      },
      { status: 500 }
    );
  }
}
