"use server";

import { getCurrentUser } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile-service";
import { generateLinkedInPost, savePostDraft, getPostDrafts, LinkedInPost, PostDraftRecord } from "@/lib/studio-service";
import { publishLinkedInPost } from "@/lib/linkedin";
import { createClient } from "@/lib/supabase/server";

export async function generatePostAction(userPrompt: string): Promise<LinkedInPost> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await generateLinkedInPost(user.id, userPrompt);
}

export async function saveDraftAction(draft: Partial<PostDraftRecord>): Promise<PostDraftRecord> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await savePostDraft(user.id, draft);
}

export async function loadDraftsAction(): Promise<PostDraftRecord[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return await getPostDrafts(user.id);
}

export async function getLinkedInStatusAction() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isConnected: false,
      memberUrn: null,
      profileData: null,
      userName: "patilmokshada09",
    };
  }

  const profile = await getProfile(user.id);
  const isConnected = Boolean(profile?.linkedin_access_token && profile?.linkedin_member_urn);

  const rawName = user.full_name || profile?.full_name;
  const userName = (!rawName || rawName === "Alex Chen") ? "patilmokshada09" : rawName;

  return {
    isConnected,
    memberUrn: profile?.linkedin_member_urn || null,
    profileData: profile?.linkedin_profile_data || null,
    userName,
    userEmail: user.email,
  };
}

export async function disconnectLinkedInAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false };
  }

  await updateProfile(user.id, {
    linkedin_access_token: undefined,
    linkedin_member_urn: undefined,
    linkedin_token_expires_at: undefined,
    linkedin_profile_data: undefined,
  });

  return { success: true };
}

export async function publishToLinkedInAction(commentary: string, draftId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const profile = await getProfile(user.id);
  const accessToken = profile?.linkedin_access_token;
  const memberUrn = profile?.linkedin_member_urn;

  if (!accessToken || !memberUrn) {
    throw new Error("LinkedIn account is not connected. Please connect LinkedIn first.");
  }

  const result = await publishLinkedInPost(accessToken, memberUrn, commentary);

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
      // offline fallback
    }
  }

  return result;
}
