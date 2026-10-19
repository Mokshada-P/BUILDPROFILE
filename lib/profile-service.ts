import { createClient } from "@/lib/supabase/server";

export interface ProfileRecord {
  id?: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  location?: string;
  linkedin_url?: string;
  current_status?: "Student" | "Fresher" | "Professional" | "Switcher" | string;
  headline?: string;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  skills?: string[];
  current_industry?: string;
  target_industry?: string;
  target_roles?: string[];
  career_goals?: string[];
  preferences?: {
    tone: string;
    targetAudience?: string;
    postingFrequency?: string;
    contentPillars?: string[];
  };
  linkedin_access_token?: string;
  linkedin_member_urn?: string;
  linkedin_token_expires_at?: string;
  linkedin_profile_data?: any;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback cache for development/demo sandbox sessions
const sandboxProfileStore = new Map<string, Partial<ProfileRecord>>();

// Initialize with a rich default profile for demo user
sandboxProfileStore.set("demo-user-uuid-12345", {
  user_id: "demo-user-uuid-12345",
  full_name: "Alex Chen",
  headline: "Senior Distributed Systems Engineer | ex-Stripe | Rust & Go Enthusiast",
  location: "San Francisco, CA",
  linkedin_url: "https://linkedin.com/in/alexchen-cloud",
  current_status: "Professional",
  current_industry: "Fintech & Cloud Infrastructure",
  target_industry: "AI Infrastructure & Next-Gen Cloud",
  target_roles: ["Staff Software Engineer", "Principal Systems Architect", "Engineering Director"],
  skills: ["Go", "Rust", "Distributed Systems", "Kubernetes", "Kafka", "PostgreSQL", "System Architecture", "High Concurrency"],
  career_goals: [
    "Transition into Staff / Principal Systems Architect",
    "Establish technical thought leadership on high-throughput distributed databases",
    "Expand executive network among Tier-1 AI infrastructure startups"
  ],
  education: [
    {
      institution: "UC Berkeley",
      degree: "B.S. Electrical Engineering & Computer Science",
      fieldOfStudy: "Computer Science",
      graduationYear: "2019"
    }
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "CloudScale Systems",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      description: "Architected distributed transaction engine handling 120,000 req/sec with p99 latency < 12ms. Led migration from legacy monolith to decoupled event-driven Go microservices."
    },
    {
      title: "Software Engineer II",
      company: "PaymentFlow Tech",
      location: "San Francisco, CA",
      startDate: "2019",
      endDate: "2021",
      description: "Designed core ledger reconciliation service in Go and PostgreSQL, reducing settlement discrepancy rate by 94%."
    }
  ],
  projects: [
    {
      name: "RaftKv",
      description: "High-performance distributed key-value store built in Rust implementing Raft consensus protocol.",
      technologies: ["Rust", "Raft", "Tokio", "gRPC"],
      link: "https://github.com/example/raft-kv"
    }
  ],
  preferences: {
    tone: "Thought Leadership & Deep Technical",
    targetAudience: "Staff Engineers, CTOs, and Infrastructure Tech Leads",
    postingFrequency: "2-3 times per week",
    contentPillars: ["Architecture Breakdowns", "Lessons from Outages", "Distributed Systems Trade-offs"]
  },
  onboarding_completed: true,
});

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  // Check sandbox cache first if userId matches demo
  if (sandboxProfileStore.has(userId)) {
    return sandboxProfileStore.get(userId) as ProfileRecord;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      return data as ProfileRecord;
    }
  } catch {
    // If Supabase is unconfigured
  }

  // Fallback return if present or empty starter
  return (
    (sandboxProfileStore.get(userId) as ProfileRecord) || {
      user_id: userId,
      onboarding_completed: false,
    }
  );
}

export async function updateProfile(
  userId: string,
  updates: Partial<ProfileRecord>
): Promise<{ success: boolean; data?: ProfileRecord; error?: string }> {
  // Always update sandbox store
  const existing = sandboxProfileStore.get(userId) || { user_id: userId };
  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  sandboxProfileStore.set(userId, merged);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return { success: true, data: data as ProfileRecord };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Supabase connection unavailable";
    return { success: true, data: merged as ProfileRecord, error: message };
  }

  return { success: true, data: merged as ProfileRecord };
}
