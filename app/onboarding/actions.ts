"use server";

import { getCurrentUser } from "@/lib/auth";
import { updateProfile, getProfile } from "@/lib/profile-service";
import { redirect } from "next/navigation";

export async function saveOnboardingStep(stepData: Record<string, any>) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Authentication required" };
  }

  const result = await updateProfile(user.id, stepData);
  return result;
}

export async function completeOnboardingAction(finalData: Record<string, any>) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Authentication required" };
  }

  await updateProfile(user.id, {
    ...finalData,
    onboarding_completed: true,
  });

  redirect("/dashboard");
}

export async function loadCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return await getProfile(user.id);
}
