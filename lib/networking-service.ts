import { getGeminiModel } from "@/lib/gemini";
import { getProfile } from "@/lib/profile-service";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const OutreachMessageSchema = z.object({
  connectionNote: z.string().max(300), // Strict LinkedIn connection invite 300-character limit
  inMailFollowUp: z.string(),
  personalizationHook: z.string(),
  relevanceScore: z.number().min(0).max(100),
});

export type OutreachMessage = z.infer<typeof OutreachMessageSchema>;

export interface ConnectionContact {
  id: string;
  user_id: string;
  full_name: string;
  professional_title: string;
  organisation: string;
  location?: string;
  profile_url?: string;
  relevance_score?: number;
  relevance_explanation?: string;
  suggested_message?: string;
  inmail_message?: string;
  status: "saved" | "contacted" | "dismissed";
  created_at: string;
}

const contactsStore = new Map<string, ConnectionContact[]>();

export function generateLinkedInSearchUrl(filters: {
  roles?: string[];
  companies?: string[];
  keywords?: string[];
  location?: string;
}): { searchUrl: string; booleanQuery: string } {
  const parts: string[] = [];

  if (filters.roles && filters.roles.length > 0) {
    const roleQuery = filters.roles.map(r => `"${r.trim()}"`).join(" OR ");
    parts.push(`(${roleQuery})`);
  }

  if (filters.companies && filters.companies.length > 0) {
    const compQuery = filters.companies.map(c => `"${c.trim()}"`).join(" OR ");
    parts.push(`(${compQuery})`);
  }

  if (filters.keywords && filters.keywords.length > 0) {
    const kwQuery = filters.keywords.map(k => `"${k.trim()}"`).join(" OR ");
    parts.push(`(${kwQuery})`);
  }

  const booleanQuery = parts.join(" AND ");
  const encodedKeywords = encodeURIComponent(booleanQuery || "Staff Software Engineer");
  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedKeywords}&origin=GLOBAL_SEARCH_HEADER`;

  return { searchUrl, booleanQuery };
}

export async function generatePersonalizedOutreach(
  userId: string,
  contact: {
    fullName: string;
    title: string;
    company: string;
    sharedInterests?: string;
  }
): Promise<OutreachMessage> {
  const profile = await getProfile(userId);
  const myName = (profile?.full_name && profile.full_name !== "Alex Chen") ? profile.full_name : "patilmokshada09";
  const myHeadline = profile?.headline || "Software Engineer & Builder";
  const mySkills = profile?.skills?.slice(0, 3).join(", ") || "Full-Stack, Cloud Systems";

  const prompt = `You are an Executive Networking Strategist for Senior Tech Professionals.
Generate a hyper-personalized LinkedIn cold connection request and InMail script.

Sender Context:
- Name: ${myName}
- Expertise: ${myHeadline}
- Stack: ${mySkills}

Recipient Context:
- Name: ${contact.fullName}
- Title: ${contact.title}
- Company: ${contact.company}
- Shared Context/Interests: ${contact.sharedInterests || 'Distributed systems scalability and engineering leadership'}

Requirements:
1. "connectionNote": MUST BE UNDER 300 CHARACTERS (including spaces). Do not exceed 300 characters under any circumstance. Authentic, respectful, no sales pitch.
2. "inMailFollowUp": A detailed 2-3 paragraph follow-up after connection is accepted.
3. "personalizationHook": A 1-sentence explanation of why this message converts.
4. "relevanceScore": integer 0-100 indicating alignment score.

Return valid raw JSON:
{
  "connectionNote": string,
  "inMailFollowUp": string,
  "personalizationHook": string,
  "relevanceScore": number
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
      if (parsed.connectionNote && parsed.connectionNote.length > 295) {
        parsed.connectionNote = parsed.connectionNote.slice(0, 290) + "...";
      }
      return OutreachMessageSchema.parse(parsed);
    } catch (err) {
      console.warn("Gemini outreach generation error, falling back to heuristic script:", err);
    }
  }

  // Realistic fallback calibrated to under 300 characters
  const fallbackNote = `Hi ${contact.fullName.split(" ")[0]}, loved your team's work scaling ${contact.company}'s infrastructure. As a fellow engineer working in ${mySkills.split(",")[0] || 'systems'}, would love to connect and follow your architectural insights!`;

  return {
    connectionNote: fallbackNote.slice(0, 298),
    inMailFollowUp: `Hi ${contact.fullName.split(" ")[0]},\n\nThanks for connecting! I've been closely following ${contact.company}'s engineering blog, especially your focus on high-throughput microservices.\n\nAt my current role, we recently tackled similar challenges optimizing latency across our event pipeline. Would love to swap notes on systems architecture or buy you a virtual coffee sometime.\n\nBest,\n${myName}`,
    personalizationHook: `References ${contact.company}'s specific engineering challenges and aligns with ${mySkills.split(",")[0] || 'systems'} expertise.`,
    relevanceScore: 92,
  };
}

export async function saveContact(userId: string, contactData: Partial<ConnectionContact>): Promise<ConnectionContact> {
  const newContact: ConnectionContact = {
    id: contactData.id || `contact-${Date.now()}`,
    user_id: userId,
    full_name: contactData.full_name || "New Contact",
    professional_title: contactData.professional_title || "Engineering Lead",
    organisation: contactData.organisation || "Tech Corp",
    location: contactData.location || "San Francisco, CA",
    profile_url: contactData.profile_url || "",
    relevance_score: contactData.relevance_score || 88,
    relevance_explanation: contactData.relevance_explanation || "High synergy in distributed systems",
    suggested_message: contactData.suggested_message || "",
    inmail_message: contactData.inmail_message || "",
    status: contactData.status || "saved",
    created_at: new Date().toISOString(),
  };

  const userContacts = contactsStore.get(userId) || [];
  userContacts.unshift(newContact);
  contactsStore.set(userId, userContacts);

  // Sync to Supabase connection_suggestions table
  try {
    const supabase = createClient();
    await supabase.from("connection_suggestions").insert({
      user_id: userId,
      full_name: newContact.full_name,
      professional_title: newContact.professional_title,
      organisation: newContact.organisation,
      location: newContact.location,
      profile_url: newContact.profile_url,
      relevance_score: newContact.relevance_score,
      relevance_explanation: newContact.relevance_explanation,
      suggested_message: newContact.suggested_message,
      status: newContact.status,
    });
  } catch {
    // Memory store fallback
  }

  return newContact;
}

export async function updateContactStatus(
  userId: string,
  contactId: string,
  status: "saved" | "contacted" | "dismissed"
) {
  const userContacts = contactsStore.get(userId) || [];
  const updated = userContacts.map(c => c.id === contactId ? { ...c, status } : c);
  contactsStore.set(userId, updated);

  try {
    const supabase = createClient();
    await supabase
      .from("connection_suggestions")
      .update({ status })
      .eq("id", contactId)
      .eq("user_id", userId);
  } catch {
    // Memory fallback
  }

  return true;
}

export async function getContacts(userId: string): Promise<ConnectionContact[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("connection_suggestions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ConnectionContact[];
    }
  } catch {
    // Memory fallback
  }

  return contactsStore.get(userId) || [
    {
      id: "contact-sample-1",
      user_id: userId,
      full_name: "Elena Rostova",
      professional_title: "Staff Systems Architect",
      organisation: "Cloudflare",
      location: "San Francisco, CA",
      profile_url: "https://linkedin.com/in/elena-rostova",
      relevance_score: 96,
      relevance_explanation: "Direct alignment with high-throughput distributed edge computing",
      suggested_message: "Hi Elena, loved your talk on edge caching architectures. As a fellow engineer working in Go & distributed systems, would love to connect and follow your work!",
      inmail_message: "Hi Elena,\n\nThanks for connecting! I watched your distributed systems breakdown and found your insights on p99 latency reduction fascinating...",
      status: "saved",
      created_at: new Date().toISOString(),
    },
    {
      id: "contact-sample-2",
      user_id: userId,
      full_name: "Marcus Vance",
      professional_title: "Director of Engineering, Core Infrastructure",
      organisation: "Datadog",
      location: "New York, NY",
      profile_url: "https://linkedin.com/in/marcus-vance",
      relevance_score: 91,
      relevance_explanation: "Key hiring manager for Staff-level backend infrastructure teams",
      suggested_message: "Hi Marcus, noticed your team's rapid growth at Datadog. Scaling distributed pipelines is my core focus—would be great to connect!",
      inmail_message: "Hi Marcus,\n\nHope you are having a productive week. I've been tracking Datadog's recent observability platform milestones...",
      status: "contacted",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
}
