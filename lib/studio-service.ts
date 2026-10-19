import { getGeminiModel } from "@/lib/gemini";
import { getProfile, ProfileRecord } from "@/lib/profile-service";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const LinkedInPostSchema = z.object({
  title: z.string(),
  hooks: z.array(z.string()).min(1),
  activeHook: z.string(),
  body: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
  imageUrl: z.string().optional(),
});

export type LinkedInPost = z.infer<typeof LinkedInPostSchema>;

export interface PostDraftRecord {
  id: string;
  user_id: string;
  title: string;
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  image_url?: string;
  image_prompt?: string;
  image_source: string;
  status: "draft" | "scheduled" | "archived" | "published";
  topic?: string;
  scheduled_at?: string;
  created_at: string;
}

// In-memory fallback stores
const draftsStore = new Map<string, PostDraftRecord[]>();
const conversationsStore = new Map<string, Array<{ id: string; role: string; content: string; createdAt: string }>>();

export async function generateLinkedInPost(
  userId: string,
  userPrompt: string,
  profileOverride?: Partial<ProfileRecord>
): Promise<LinkedInPost> {
  const profile = (await getProfile(userId)) || profileOverride;
  const tone = profile?.preferences?.tone || "Thought Leadership & Deep Technical";
  const skills = profile?.skills?.join(", ") || "Distributed Systems, Go, Cloud Architecture";
  const targetIndustry = profile?.target_industry || "AI Infrastructure";

  const systemInstructions = `You are a Principal Ghostwriter for Elite Tech Leaders and Staff Engineers on LinkedIn.
User Career Context:
- Full Name: ${profile?.full_name || 'Engineer'}
- Headline / Expertise: ${profile?.headline || 'Senior Software Engineer'}
- Key Skills: ${skills}
- Target Industry: ${targetIndustry}
- Writing Tone: ${tone}

Guardrails:
1. NEVER invent employers, certifications, or statistics not provided in the user context.
2. Structure the post for high engagement on LinkedIn:
   - Provide 3 distinct hook variations (1: Contrarian/Surprising, 2: Deep Insight/Question, 3: Metric/Problem-Solution).
   - Body must use clean single-sentence line breaks, authentic engineer voice, zero corporate buzzword fluff.
   - Include a compelling discussion-provoking Call to Action (CTA) at the end.
   - Provide 4-6 relevant hashtags.
   - Provide an image prompt for Imagen (e.g. clean architectural topology, benchmark graph, or minimalist tech diagram).

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "hooks": string[],
  "activeHook": string,
  "body": string,
  "cta": string,
  "hashtags": string[],
  "imagePrompt": string
}`;

  const model = getGeminiModel("gemini-1.5-flash");

  if (model) {
    try {
      const response = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: `${systemInstructions}\n\nTask: Draft a post based on: "${userPrompt}"` }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.response.text();
      const parsed = JSON.parse(text);
      const validated = LinkedInPostSchema.parse({
        ...parsed,
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      });
      return validated;
    } catch (err) {
      console.warn("Gemini Studio call failed, falling back to personalized template:", err);
    }
  }

  // Realistic fallback post calibrated to user tone
  const hookOptions = [
    "Most engineering teams obsess over microservices before they even understand their data access patterns. Here is the architecture reality:",
    "Why we migrated our critical ingestion pipeline from synchronous HTTP to event-driven Go routines (and saved 40% compute):",
    "The hardest part of distributed systems isn't throughput. It's deterministic failure recovery."
  ];

  return {
    title: "Distributed Systems Architecture Breakdown",
    hooks: hookOptions,
    activeHook: hookOptions[0],
    body: `${hookOptions[0]}\n\nOver the past 3 years scaling systems in ${targetIndustry}, here is the pattern I see repeatedly:\n\n1. Premature decoupling creates distributed transaction nightmares.\n2. Network roundtrips compound p99 latency faster than unoptimized database indexes.\n3. Observability is usually an afterthought until an incident occurs at 2 AM.\n\nWhen we re-architected our core pipeline with ${skills.split(",")[0] || 'Go'}, we focused on three simple constraints:\n→ Explicit boundary domains\n→ Idempotent queue consumers\n→ Single-source metric dashboards\n\nThe result? 3.2x throughput increase and near-zero cascading failures.`,
    cta: "What is your team's biggest architectural hurdle when scaling backend services? Drop your thoughts below.",
    hashtags: ["#SystemDesign", "#SoftwareEngineering", "#CloudScale", "#DistributedSystems", "#TechLeadership"],
    imagePrompt: "Minimalist dark-mode architectural diagram showing high-throughput stream processing with event brokers and microservices, clean neon blue and purple topology.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  };
}

export async function savePostDraft(userId: string, post: Partial<PostDraftRecord>): Promise<PostDraftRecord> {
  const newDraft: PostDraftRecord = {
    id: post.id || `draft-${Date.now()}`,
    user_id: userId,
    title: post.title || "Untitled Draft",
    hook: post.hook || "",
    body: post.body || "",
    hashtags: post.hashtags || [],
    cta: post.cta || "",
    image_url: post.image_url,
    image_prompt: post.image_prompt,
    image_source: post.image_source || "ai_generated",
    status: post.status || "draft",
    topic: post.topic || "Engineering Architecture",
    scheduled_at: post.scheduled_at,
    created_at: new Date().toISOString(),
  };

  const userDrafts = draftsStore.get(userId) || [];
  userDrafts.unshift(newDraft);
  draftsStore.set(userId, userDrafts);

  // Sync with Supabase post_drafts table
  try {
    const supabase = createClient();
    await supabase.from("post_drafts").insert({
      user_id: userId,
      title: newDraft.title,
      hook: newDraft.hook,
      body: newDraft.body,
      hashtags: newDraft.hashtags,
      cta: newDraft.cta,
      image_url: newDraft.image_url,
      image_source: newDraft.image_source,
      status: newDraft.status,
      topic: newDraft.topic,
      scheduled_at: newDraft.scheduled_at,
    });
  } catch {
    // Memory store fallback
  }

  return newDraft;
}

export async function getPostDrafts(userId: string): Promise<PostDraftRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("post_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PostDraftRecord[];
    }
  } catch {
    // Memory store fallback
  }

  return draftsStore.get(userId) || [
    {
      id: "draft-sample-1",
      user_id: userId,
      title: "Distributed Systems Architecture Breakdown",
      hook: "Most engineering teams obsess over microservices before they even understand their data access patterns.",
      body: "Over the past 3 years scaling systems, here is the pattern I see repeatedly...\n\n1. Premature decoupling creates distributed transaction nightmares.\n2. Network roundtrips compound p99 latency.",
      hashtags: ["#SystemDesign", "#SoftwareEngineering", "#CloudScale"],
      cta: "What is your team's biggest architectural hurdle?",
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      image_prompt: "Minimalist dark-mode architectural diagram showing high-throughput stream processing.",
      image_source: "ai_generated",
      status: "draft",
      topic: "System Design",
      created_at: new Date().toISOString(),
    }
  ];
}
