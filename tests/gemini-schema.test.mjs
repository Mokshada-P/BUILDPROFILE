import test from "node:test";
import assert from "node:assert";
import { z } from "zod";

// Schema definitions matching lib/gemini.ts and lib/studio-service.ts
const ProfileAuditSchema = z.object({
  overall_score: z.number().min(0).max(100),
  category_scores: z.object({
    headline: z.number().min(0).max(100),
    about: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    skills_keywords: z.number().min(0).max(100),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      original: z.string(),
      rewritten: z.string(),
      rationale: z.string(),
      impact_rating: z.enum(["High", "Medium", "Low"]),
    })
  ),
  action_plan: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
      timeframe: z.string(),
    })
  ),
});

const LinkedInPostSchema = z.object({
  title: z.string(),
  hooks: z.array(z.string()).min(1),
  activeHook: z.string(),
  body: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
});

const OutreachNoteSchema = z.object({
  connectionNote: z.string().max(300),
  inMailFollowUp: z.string(),
  relevanceScore: z.number().min(0).max(100),
});

test("Gemini ProfileAuditSchema accepts valid structured audit output", () => {
  const validAudit = {
    overall_score: 88,
    category_scores: {
      headline: 85,
      about: 80,
      experience: 92,
      skills_keywords: 90,
    },
    strengths: ["Strong technical foundation", "Quantified latency reduction"],
    weaknesses: ["Headline needs higher-level positioning"],
    recommendations: [
      {
        id: "rec-1",
        category: "Headline",
        original: "Software Engineer at Tech Corp",
        rewritten: "Staff Systems Engineer | Distributed Systems & High-Throughput Pipelines",
        rationale: "Positions at Staff level with explicit architecture keywords",
        impact_rating: "High",
      },
    ],
    action_plan: [
      {
        step: 1,
        title: "Update Headline",
        description: "Adopt 3-part formula",
        timeframe: "Immediate",
      },
    ],
  };

  const parsed = ProfileAuditSchema.parse(validAudit);
  assert.strictEqual(parsed.overall_score, 88);
  assert.strictEqual(parsed.category_scores.experience, 92);
});

test("Gemini ProfileAuditSchema rejects score out of bounds", () => {
  const invalidAudit = {
    overall_score: 150, // Out of bounds
    category_scores: { headline: 85, about: 80, experience: 90, skills_keywords: 90 },
    strengths: [],
    weaknesses: [],
    recommendations: [],
    action_plan: [],
  };

  assert.throws(() => {
    ProfileAuditSchema.parse(invalidAudit);
  }, /Number must be less than or equal to 100/);
});

test("LinkedInPostSchema enforces 3-stage hooks and image prompt", () => {
  const validPost = {
    title: "Event-Driven Architecture Trade-offs",
    hooks: [
      "Why we ditched synchronous HTTP for Go routines:",
      "The hidden cost of microservices at scale:",
      "How we cut latency by 45%:",
    ],
    activeHook: "Why we ditched synchronous HTTP for Go routines:",
    body: "Over the last 2 years scaling systems...",
    cta: "What is your approach to handling event idempotency?",
    hashtags: ["#SystemDesign", "#Go", "#DistributedSystems"],
    imagePrompt: "Architectural blueprint showing distributed queue and message brokers in dark mode.",
  };

  const parsed = LinkedInPostSchema.parse(validPost);
  assert.strictEqual(parsed.hooks.length, 3);
  assert.ok(parsed.imagePrompt.length > 10);
});

test("OutreachNoteSchema strictly enforces 300 character limit for LinkedIn connection note", () => {
  const validNote = {
    connectionNote: "Hi Elena, loved your recent talk on distributed edge caching architectures. As a fellow systems engineer working with Go and Rust, would love to connect and follow your work!",
    inMailFollowUp: "Hi Elena, thanks for connecting...",
    relevanceScore: 94,
  };

  assert.ok(validNote.connectionNote.length <= 300);
  const parsed = OutreachNoteSchema.parse(validNote);
  assert.strictEqual(parsed.relevanceScore, 94);

  // Exceeds 300 chars should fail
  const overLimit = {
    ...validNote,
    connectionNote: "a".repeat(305),
  };

  assert.throws(() => {
    OutreachNoteSchema.parse(overLimit);
  }, /String must contain at most 300 character/);
});
