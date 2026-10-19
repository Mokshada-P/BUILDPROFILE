"use server";

import { getCurrentUser } from "@/lib/auth";
import { runProfileAudit, ProfileAuditResult } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

// Fallback in-memory audit store
const auditsStore = new Map<string, ProfileAuditResult[]>();

export async function submitProfileAudit(input: {
  headline?: string;
  about?: string;
  experience?: string;
  skills?: string[];
  targetRole?: string;
  rawFileName?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const auditResult = await runProfileAudit(input);

  // Save to in-memory store
  const userAudits = auditsStore.get(user.id) || [];
  userAudits.unshift(auditResult);
  auditsStore.set(user.id, userAudits);

  // Persist to Supabase if available
  try {
    const supabase = createClient();
    await supabase.from("profile_audits").insert({
      user_id: user.id,
      overall_score: auditResult.overall_score,
      category_scores: auditResult.category_scores,
      strengths: auditResult.strengths,
      recommendations: auditResult.recommendations,
      action_plan: auditResult.action_plan,
      raw_input_data: input,
    });

    // Log to user_activity
    await supabase.from("user_activity").insert({
      user_id: user.id,
      event_type: "profile_audit_completed",
      event_metadata: {
        score: auditResult.overall_score,
        targetRole: input.targetRole,
      },
    });
  } catch (err) {
    // If Supabase table is unreachable, memory store handles it
  }

  return auditResult;
}

export async function getLatestAudit(): Promise<ProfileAuditResult | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profile_audits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return {
        overall_score: data.overall_score,
        category_scores: data.category_scores,
        strengths: data.strengths || [],
        weaknesses: data.recommendations?.map((r: any) => r.rationale) || [],
        recommendations: data.recommendations || [],
        action_plan: data.action_plan || [],
      };
    }
  } catch {
    // Fall back to memory store
  }

  const userAudits = auditsStore.get(user.id);
  if (userAudits && userAudits.length > 0) {
    return userAudits[0];
  }

  return null;
}
