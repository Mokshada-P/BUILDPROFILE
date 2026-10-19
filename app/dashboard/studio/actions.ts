"use server";

import { getCurrentUser } from "@/lib/auth";
import { generateLinkedInPost, savePostDraft, getPostDrafts, LinkedInPost, PostDraftRecord } from "@/lib/studio-service";

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
