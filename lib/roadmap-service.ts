import { getGeminiModel } from "@/lib/gemini";
import { getProfile } from "@/lib/profile-service";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  timeframe: z.string(),
  category: z.string(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export type CareerMilestone = z.infer<typeof MilestoneSchema>;

export const RoadmapAnalysisSchema = z.object({
  targetRole: z.string(),
  targetIndustry: z.string(),
  skillsGap: z.array(z.string()),
  milestones: z.array(MilestoneSchema),
});

export type RoadmapAnalysis = z.infer<typeof RoadmapAnalysisSchema>;

const milestonesStore = new Map<string, CareerMilestone[]>();

export async function generateCareerRoadmap(userId: string): Promise<RoadmapAnalysis> {
  const profile = await getProfile(userId);
  const targetRole = profile?.target_roles?.[0] || "Staff Software Engineer";
  const targetIndustry = profile?.target_industry || "AI Infrastructure";
  const currentSkills = profile?.skills?.join(", ") || "Go, Python, PostgreSQL, Docker";

  const prompt = `You are a Principal Technical Career Strategist and Engineering Executive Mentor.
Analyze this engineer's profile against their target senior role: "${targetRole}" in "${targetIndustry}".

Current Profile:
- Current Status: ${profile?.current_status || 'Professional'}
- Headline: ${profile?.headline || 'Senior Software Engineer'}
- Verified Skills: ${currentSkills}
- Career Goals: ${profile?.career_goals?.join("; ") || 'Transition to Staff/Principal level'}

Tasks:
1. Identify 3-4 specific technical or leadership skill gaps required to cross the gap to ${targetRole}.
2. Build 5 prioritized, chronological milestones for the next 3 to 12 months.
   Each milestone must have:
   - id: unique string (e.g. "ms-1")
   - title: concise actionable milestone
   - description: what proof of work or benchmark needs to be demonstrated
   - priority: "high" | "medium" | "low"
   - timeframe: "Month 1-2", "Month 3-4", etc.
   - category: "Technical Mastery" | "System Architecture" | "Public Thought Leadership" | "Executive Visibility"
   - status: "pending"

Return ONLY valid JSON matching this schema:
{
  "targetRole": string,
  "targetIndustry": string,
  "skillsGap": string[],
  "milestones": [
    {
      "id": string,
      "title": string,
      "description": string,
      "priority": "high" | "medium" | "low",
      "timeframe": string,
      "category": string,
      "status": "pending"
    }
  ]
}`;

  const model = getGeminiModel("gemini-1.5-flash");

  if (model) {
    try {
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.response.text();
      const parsed = JSON.parse(text);
      const validated = RoadmapAnalysisSchema.parse(parsed);

      milestonesStore.set(userId, validated.milestones);

      // Sync to Supabase
      try {
        const supabase = createClient();
        for (const m of validated.milestones) {
          await supabase.from("career_milestones").insert({
            user_id: userId,
            title: m.title,
            description: m.description,
            priority: m.priority,
            status: m.status,
          });
        }
      } catch {
        // In-memory fallback
      }

      return validated;
    } catch (err) {
      console.warn("Gemini Roadmap generation error, using heuristic roadmap:", err);
    }
  }

  // Realistic fallback roadmap calibrated to target role
  const fallbackAnalysis: RoadmapAnalysis = {
    targetRole,
    targetIndustry,
    skillsGap: [
      "Distributed Consensus & Multi-Region Replication (Raft/Paxos)",
      "Cross-functional Architectural RFC Ownership & Engineering Vision",
      "Cloud Infrastructure FinOps & Large-scale Cost Optimization",
      "External Industry Brand & Conference Speaking Visibility"
    ],
    milestones: [
      {
        id: "ms-1",
        title: "Publish RFC for Cross-Service Distributed Tracing",
        description: "Author and drive an engineering design proposal standardizing OpenTelemetry across all backend microservices.",
        priority: "high",
        timeframe: "Month 1-2",
        category: "System Architecture",
        status: "in_progress",
      },
      {
        id: "ms-2",
        title: "Deliver 40% Query Latency Optimization on Core Sharded DB",
        description: "Benchmark and redesign PostgreSQL indexing and partition strategy, documenting p99 latency improvements.",
        priority: "high",
        timeframe: "Month 3-4",
        category: "Technical Mastery",
        status: "pending",
      },
      {
        id: "ms-3",
        title: "Author 6 In-Depth Technical Breakdowns in Content Studio",
        description: "Publish bi-weekly thought leadership posts dissecting trade-offs in distributed systems and consensus protocols.",
        priority: "medium",
        timeframe: "Month 4-6",
        category: "Public Thought Leadership",
        status: "pending",
      },
      {
        id: "ms-4",
        title: "Conduct 15 Informational Chats with Staff+ Engineers & Directors",
        description: "Use Networking Assistant to engage with engineering leadership at Tier-1 companies in your target industry.",
        priority: "medium",
        timeframe: "Month 6-8",
        category: "Executive Visibility",
        status: "pending",
      },
      {
        id: "ms-5",
        title: "Complete Staff Engineer Interview Loop & Secure Offer",
        description: "Prepare system design case studies and leadership behavioral stories focused on organizational impact.",
        priority: "high",
        timeframe: "Month 9-12",
        category: "Executive Visibility",
        status: "pending",
      }
    ]
  };

  milestonesStore.set(userId, fallbackAnalysis.milestones);
  return fallbackAnalysis;
}

export async function getMilestones(userId: string): Promise<CareerMilestone[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("career_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description || "",
        priority: d.priority || "medium",
        timeframe: "Quarterly Target",
        category: "Engineering Progression",
        status: d.status || "pending",
      }));
    }
  } catch {
    // Memory fallback
  }

  const stored = milestonesStore.get(userId);
  if (stored && stored.length > 0) {
    return stored;
  }

  // Generate initial if not yet generated
  const init = await generateCareerRoadmap(userId);
  return init.milestones;
}

export async function updateMilestoneStatus(
  userId: string,
  milestoneId: string,
  status: "pending" | "in_progress" | "completed"
) {
  const list = milestonesStore.get(userId) || [];
  const updated = list.map(m => m.id === milestoneId ? { ...m, status } : m);
  milestonesStore.set(userId, updated);

  try {
    const supabase = createClient();
    await supabase
      .from("career_milestones")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", milestoneId)
      .eq("user_id", userId);
  } catch {
    // Memory fallback
  }

  return true;
}

export async function addCustomMilestone(
  userId: string,
  data: Partial<CareerMilestone>
): Promise<CareerMilestone> {
  const milestone: CareerMilestone = {
    id: data.id || `custom-ms-${Date.now()}`,
    title: data.title || "Custom Milestone",
    description: data.description || "",
    priority: data.priority || "medium",
    timeframe: data.timeframe || "Month 1-3",
    category: data.category || "Technical Growth",
    status: data.status || "pending",
  };

  const list = milestonesStore.get(userId) || [];
  list.push(milestone);
  milestonesStore.set(userId, list);

  try {
    const supabase = createClient();
    await supabase.from("career_milestones").insert({
      user_id: userId,
      title: milestone.title,
      description: milestone.description,
      priority: milestone.priority,
      status: milestone.status,
    });
  } catch {
    // Memory fallback
  }

  return milestone;
}
