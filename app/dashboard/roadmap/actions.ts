"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  generateCareerRoadmap,
  getMilestones,
  updateMilestoneStatus,
  addCustomMilestone,
  CareerMilestone,
  RoadmapAnalysis,
} from "@/lib/roadmap-service";

export async function generateRoadmapAction(): Promise<RoadmapAnalysis> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await generateCareerRoadmap(user.id);
}

export async function loadMilestonesAction(): Promise<CareerMilestone[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return await getMilestones(user.id);
}

export async function toggleMilestoneAction(
  milestoneId: string,
  newStatus: "pending" | "in_progress" | "completed"
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await updateMilestoneStatus(user.id, milestoneId, newStatus);
}

export async function addCustomMilestoneAction(
  data: Partial<CareerMilestone>
): Promise<CareerMilestone> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await addCustomMilestone(user.id, data);
}
