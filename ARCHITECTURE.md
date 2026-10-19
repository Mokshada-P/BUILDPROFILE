# BUILDPROFILE — ARCHITECTURAL BLUEPRINT & AGENT SPEC

## 1. System Overview & Core Stack
BuildProfile is an AI-powered LinkedIn growth and career optimization web platform.
- **Framework:** Next.js 14+ (App Router), React, TypeScript.
- **Styling & UI:** Tailwind CSS, shadcn/ui component library, Lucide React icons.
- **Form Management & Validation:** React Hook Form, Zod.
- **Database & Storage:** Supabase PostgreSQL with strict Row Level Security (RLS), Supabase Storage for assets/resumes.
- **Authentication:** Supabase Auth (Email/Password, Session cookies, Protected Route Middleware).
- **AI Core:** Google Gemini API (`@google/genai` or `@ai-sdk/google` via Vercel AI SDK).
  - Primary text/reasoning model: `gemini-1.5-pro` (or `gemini-2.5-pro` if available).
  - Fast task model: `gemini-1.5-flash`.
  - Image generation: Imagen API via Google GenAI SDK (or Unsplash API fallback).

## 2. Strict Engineering Guardrails
1. **Zero Mocked Production Features:** Never represent a hardcoded response or mock template as a working external integration.
2. **Server-Side API Security:** All Gemini API calls, Supabase privileged admin actions, and external integrations MUST reside in Server Actions or Next.js Route Handlers (`/api/*`). Never expose `GEMINI_API_KEY` or service-role keys to the browser.
3. **LinkedIn Integration Reality:** LinkedIn's anti-scraping policy prevents arbitrary profile URL scraping. Default to **manual structured profile entry** or **user-uploaded profile exports/PDF resumes** parsed safely on the server. Never claim automated profile scraping without authorized LinkedIn Partner API credentials.
4. **Structured LLM Outputs:** All Gemini outputs for Profile Audits, Roadmaps, and Content must use strict structured outputs via Zod schema enforcement (`generateObject` or Gemini structured JSON schema).
5. **No Hallucinated User Facts:** The AI must never invent internships, metrics, certifications, or past employers not provided in the user's profile context.

## 3. Database Schema (Supabase PostgreSQL)
All user-owned tables must have `user_id uuid references auth.users(id) on delete cascade` and RLS enabled.

- `profiles`: id, user_id, full_name, avatar_url, location, linkedin_url, current_status, headline, education (jsonb), experience (jsonb), projects (jsonb), certifications (jsonb), skills (text[]), current_industry, target_industry, target_roles (text[]), career_goals (text[]), preferences (jsonb), onboarding_completed (boolean), created_at, updated_at.
- `profile_audits`: id, user_id, overall_score (int), category_scores (jsonb), strengths (text[]), recommendations (jsonb), action_plan (jsonb), raw_input_data (jsonb), created_at.
- `content_conversations`: id, user_id, title, created_at, updated_at.
- `content_messages`: id, conversation_id, user_id, role, content, metadata (jsonb), created_at.
- `post_drafts`: id, user_id, title, hook, body, hashtags (text[]), cta, image_url, image_source, status (draft/scheduled/archived), topic, scheduled_at, created_at, updated_at.
- `connection_suggestions`: id, user_id, full_name, professional_title, organisation, location, profile_url, relevance_score (int), relevance_explanation, suggested_message, status (saved/contacted/dismissed), created_at.
- `career_milestones`: id, user_id, title, description, due_date, status (pending/in_progress/completed), priority, created_at, updated_at.
- `user_activity`: id, user_id, event_type, event_metadata (jsonb), created_at.

## 4. Workflows & Agent Architecture
- **Workflow A: AI Profile Audit:** Validates user-submitted profile data -> Calls Gemini with scoring rubric -> Produces structured 100-point audit with category breakdowns and side-by-side rewrite suggestions -> Saves to `profile_audits`.
- **Workflow B: Content Studio:** Conversational workspace -> Injects user's career context and target industry into system prompt -> Generates LinkedIn posts with custom hooks, body, CTAs, and hashtags -> Triggers Imagen prompt or licensed image fallback -> Persists to `post_drafts`.
- **Workflow C: Networking Assistant:** Accepts target role/industry filters -> Generates targeted Boolean LinkedIn search queries -> Permits manual contact entry and generates highly personalized connection cold outreach messages -> Persists to `connection_suggestions`.
- **Workflow D: Career Roadmap:** Analyzes user skills vs. target role -> Identifies gaps -> Builds chronological milestones with status toggles -> Persists to `career_milestones`.
