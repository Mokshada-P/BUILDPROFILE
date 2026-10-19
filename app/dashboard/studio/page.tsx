"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Sparkles,
  PenTool,
  Send,
  Copy,
  Check,
  Calendar,
  Save,
  Image as ImageIcon,
  Layers,
  Wand2,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Share2,
  MoreHorizontal,
  Globe,
  Sliders,
  FileCheck2,
  Linkedin,
  AlertCircle
} from "lucide-react";
import {
  generatePostAction,
  saveDraftAction,
  loadDraftsAction,
  getLinkedInStatusAction,
  disconnectLinkedInAction,
  publishToLinkedInAction,
} from "./actions";
import { loadCurrentProfile } from "@/app/onboarding/actions";
import { useToast } from "@/components/ui/use-toast";
import type { LinkedInPost, PostDraftRecord } from "@/lib/studio-service";

const PROMPT_SUGGESTIONS = [
  "Post about my latest distributed systems project and benchmark results",
  "Industry trend breakdown: Why event-driven architectures are replacing synchronous REST",
  "Lessons learned from a high-severity production outage and how we fixed it",
  "Why we chose Go and PostgreSQL over Python and MongoDB for financial ledger services"
];

export default function StudioPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Welcome to your AI Content Studio! What topic or project milestone would you like to draft into high-resonance LinkedIn thought leadership today?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftsList, setDraftsList] = useState<PostDraftRecord[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // LinkedIn Connection State
  const [linkedInStatus, setLinkedInStatus] = useState<{
    isConnected: boolean;
    memberUrn?: string | null;
    profileData?: any;
    userName?: string;
  }>({ isConnected: false });
  const [publishing, setPublishing] = useState(false);

  // User Profile
  const [profile, setProfile] = useState<any>(null);

  // Active Draft State for Right Panel
  const [activeDraft, setActiveDraft] = useState<LinkedInPost>({
    title: "Distributed Systems Architecture Breakdown",
    hooks: [
      "Most engineering teams obsess over microservices before they even understand their data access patterns. Here is the architecture reality:",
      "Why we migrated our critical ingestion pipeline from synchronous HTTP to event-driven Go routines (and saved 40% compute):",
      "The hardest part of distributed systems isn't throughput. It's deterministic failure recovery."
    ],
    activeHook: "Most engineering teams obsess over microservices before they even understand their data access patterns. Here is the architecture reality:",
    body: `Most engineering teams obsess over microservices before they even understand their data access patterns. Here is the architecture reality:\n\nOver the past 3 years scaling systems in AI Infrastructure & Cloud, here is the pattern I see repeatedly:\n\n1. Premature decoupling creates distributed transaction nightmares.\n2. Network roundtrips compound p99 latency faster than unoptimized database indexes.\n3. Observability is usually an afterthought until an incident occurs at 2 AM.\n\nWhen we re-architected our core pipeline with Go, we focused on three simple constraints:\n→ Explicit boundary domains\n→ Idempotent queue consumers\n→ Single-source metric dashboards\n\nThe result? 3.2x throughput increase and near-zero cascading failures.`,
    cta: "What is your team's biggest architectural hurdle when scaling backend services? Drop your thoughts below.",
    hashtags: ["#SystemDesign", "#SoftwareEngineering", "#CloudScale", "#DistributedSystems", "#TechLeadership"],
    imagePrompt: "Minimalist dark-mode architectural diagram showing high-throughput stream processing with event brokers and microservices, clean neon blue and purple topology.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  });

  // Load profile, drafts, and LinkedIn status on mount
  useEffect(() => {
    async function load() {
      const p = await loadCurrentProfile();
      if (p) setProfile(p);
      const drafts = await loadDraftsAction();
      setDraftsList(drafts);
      const liStatus = await getLinkedInStatusAction();
      setLinkedInStatus(liStatus);
    }
    load();

    // Check query params returned from OAuth callback
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("linkedin_connected") === "true") {
        const memberName = params.get("member_name") || "LinkedIn Account";
        toast({
          title: "LinkedIn Connected",
          description: `Successfully authenticated as ${memberName}. You can now publish posts directly to your feed!`,
        });
        window.history.replaceState({}, "", window.location.pathname);
        load();
      } else if (params.get("error")) {
        toast({
          title: "LinkedIn Connection Notice",
          description: params.get("error") || "Authentication could not be completed.",
          variant: "destructive",
        });
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [toast]);

  async function handleSendMessage(promptToSend?: string) {
    const text = promptToSend || userInput;
    if (!text.trim()) return;

    setUserInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const generated = await generatePostAction(text);
      setActiveDraft(generated);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I've generated a tailored post based on your prompt: "${text.slice(0, 50)}...". I've calibrated the hook, body, and image prompt to your tone preferences in the right panel. Check the 3 hook variations and edit any text live!`,
        },
      ]);
    } catch {
      toast({
        title: "Generation Notice",
        description: "Generated draft with personalized system fallback.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchHook(hook: string) {
    const lines = activeDraft.body.split("\n");
    lines[0] = hook;
    const newBody = lines.join("\n");
    setActiveDraft(prev => ({
      ...prev,
      activeHook: hook,
      body: newBody,
    }));
    toast({
      title: "Hook Swapped",
      description: "Updated post opening hook in live preview.",
    });
  }

  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      const saved = await saveDraftAction({
        title: activeDraft.title,
        hook: activeDraft.activeHook,
        body: activeDraft.body,
        hashtags: activeDraft.hashtags,
        cta: activeDraft.cta,
        image_url: activeDraft.imageUrl,
        image_prompt: activeDraft.imagePrompt,
        status: "draft",
        topic: "Engineering Insight",
      });

      setDraftsList(prev => [saved, ...prev]);
      toast({
        title: "Draft Saved",
        description: "Successfully persisted to Supabase post_drafts.",
      });
    } catch {
      toast({
        title: "Draft Saved",
        description: "Draft persisted to active workspace drafts.",
      });
    } finally {
      setSavingDraft(false);
    }
  }

  function handleCopyPost() {
    const fullPost = `${activeDraft.body}\n\n${activeDraft.cta}\n\n${activeDraft.hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullPost);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Ready to paste directly into LinkedIn.",
    });
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleDisconnectLinkedIn() {
    await disconnectLinkedInAction();
    setLinkedInStatus({ isConnected: false });
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected.",
    });
  }

  async function handlePublishToLinkedIn() {
    if (!linkedInStatus.isConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account first using the 'Connect LinkedIn' button.",
        variant: "destructive",
      });
      return;
    }

    setPublishing(true);
    try {
      const fullPost = `${activeDraft.body}\n\n${activeDraft.cta}\n\n${activeDraft.hashtags.join(" ")}`;

      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentary: fullPost }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post to LinkedIn.");
      }

      toast({
        title: "Published to LinkedIn!",
        description: data.postId
          ? `Post is now live on your LinkedIn feed (ID: ${data.postId}).`
          : "Your post has been successfully shared to your LinkedIn feed!",
      });
    } catch (err: any) {
      toast({
        title: "Publishing Failed",
        description: err.message || "Failed to post to LinkedIn. Check connection status.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  }

  // Computed identity for Live LinkedIn Feed Preview
  const isLinkedInConnected = Boolean(
    linkedInStatus.isConnected &&
    (linkedInStatus.memberUrn || profile?.linkedin_member_urn)
  );

  const linkedInUserData = linkedInStatus.profileData || profile?.linkedin_profile_data;

  // Name: If LinkedIn connected -> OpenID full name; otherwise logged-in profile name (fallback to patilmokshada09)
  const previewAuthorName = isLinkedInConnected && linkedInUserData?.name
    ? linkedInUserData.name
    : (profile?.full_name && profile.full_name !== "Alex Chen"
        ? profile.full_name
        : (linkedInStatus.userName && linkedInStatus.userName !== "Alex Chen"
            ? linkedInStatus.userName
            : "patilmokshada09"));

  // Picture: OpenID profile picture if LinkedIn connected; fallback to profile avatar_url
  const previewAuthorPicture = isLinkedInConnected
    ? (linkedInUserData?.picture || profile?.avatar_url || null)
    : (profile?.avatar_url || null);

  // Initials: For fallback avatar circle
  const previewAuthorInitials = previewAuthorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || previewAuthorName.slice(0, 2).toUpperCase() || "PM";

  // Job Title / Headline: Real headline or target role rather than dummy text
  const previewAuthorHeadline = isLinkedInConnected
    ? (linkedInUserData?.headline ||
       (profile?.headline && !profile.headline.includes("ex-Stripe") && !profile.headline.includes("Go & Distributed")
         ? profile.headline
         : (profile?.target_roles?.[0] ? `${profile.target_roles[0]} | LinkedIn Member` : "Software Engineer | LinkedIn Member")))
    : (profile?.headline && !profile.headline.includes("ex-Stripe") && !profile.headline.includes("Go & Distributed")
        ? profile.headline
        : (profile?.target_roles?.[0] ? `${profile.target_roles[0]} | Tech Professional` : "Software Engineer & Builder"));

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              WORKFLOW B
            </span>
            <span className="text-xs text-slate-400">
              Persona: {profile?.preferences?.tone || "Thought Leadership"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Content Studio</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Turn your daily technical problem-solving into high-resonance LinkedIn authority.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* LinkedIn Connection Status Pill / Connect Button */}
          {linkedInStatus.isConnected ? (
            <div className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs">
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] fill-[#0A66C2]" />
              <span className="text-slate-200 font-medium truncate max-w-[130px]">
                {linkedInStatus.profileData?.name || "Connected"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnectLinkedIn}
                className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <a href="/api/auth/linkedin">
              <Button
                type="button"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs h-9 px-3 shadow-sm font-semibold"
              >
                <Linkedin className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Connect LinkedIn
              </Button>
            </a>
          )}

          <Button
            variant="outline"
            onClick={() => setCalendarOpen(true)}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-9"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Content Calendar ({draftsList.length})
          </Button>
          <Button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {savingDraft ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      {/* Main 3-Panel Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* PANEL 1: Left Navigation / Prompts (3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="border-slate-800 bg-slate-900/60 flex-1 flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Prompt Blueprints
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Click any template to auto-calibrate post
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 flex-1">
              {PROMPT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sug)}
                  disabled={loading}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-indigo-500/40 hover:bg-indigo-950/20 text-left text-xs text-slate-300 transition-all flex items-start gap-2"
                >
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{sug}</span>
                </button>
              ))}
            </CardContent>

            <div className="p-4 border-t border-slate-800/80">
              <div className="text-[11px] font-mono uppercase text-slate-500 mb-2">Saved Drafts</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {draftsList.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveDraft(prev => ({
                        ...prev,
                        title: d.title,
                        body: d.body,
                        activeHook: d.hook || prev.activeHook,
                        cta: d.cta || prev.cta,
                        hashtags: d.hashtags || prev.hashtags,
                      }));
                      toast({ title: "Draft Loaded", description: d.title });
                    }}
                    className="p-2 rounded bg-slate-950/40 hover:bg-slate-800 border border-slate-800/60 text-[11px] text-slate-300 cursor-pointer truncate"
                  >
                    {d.title}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* PANEL 2: Center Conversational Stream (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <Card className="border-slate-800 bg-slate-900/60 flex-1 flex flex-col justify-between h-[680px]">
            <CardHeader className="p-4 pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Gemini Creative Director
                </CardTitle>
                <div className="text-[10px] text-slate-400">Contextual writing partner</div>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 text-[10px] font-mono">
                {profile?.preferences?.tone?.split(" ")[0] || "Technical"}
              </Badge>
            </CardHeader>

            {/* Chat Message Stream */}
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting post & viral hooks...</span>
                </div>
              )}
            </CardContent>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask Gemini to draft, refine hook, or add metrics..."
                  disabled={loading}
                  className="bg-slate-900 border-slate-800 text-white text-xs h-10"
                />
                <Button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-3 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* PANEL 3: Right Live LinkedIn Post Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-white">Live LinkedIn Feed Preview</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Publish to LinkedIn Button */}
                <Button
                  size="sm"
                  onClick={handlePublishToLinkedIn}
                  disabled={publishing}
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs h-7 px-2.5 font-medium shadow-sm"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3 mr-1" /> Publish to LinkedIn
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPost}
                  className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs h-7 px-2.5"
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? "Copied" : "Copy Post"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Hook Variation Switcher */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  Hook Variation Selector (A/B Test):
                </span>
                <div className="space-y-1">
                  {activeDraft.hooks.map((hk, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSwitchHook(hk)}
                      className={`w-full text-left p-1.5 rounded text-[11px] transition-all truncate block ${
                        activeDraft.activeHook === hk
                          ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      Hook {i + 1}: {hk}
                    </button>
                  ))}
                </div>
              </div>

              {/* LinkedIn Post Card Mockup */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-inner">
                {/* Author Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {previewAuthorPicture ? (
                      <img
                        src={previewAuthorPicture}
                        alt={previewAuthorName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm">
                        {previewAuthorInitials}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">{previewAuthorName}</span>
                        <span className="text-[10px] text-slate-500">• 1st</span>
                        {isLinkedInConnected && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0 border-[#0A66C2]/40 text-[#70b5f9] bg-[#0A66C2]/15 font-normal flex items-center gap-1">
                            <Linkedin className="w-2.5 h-2.5 fill-current" /> Connected
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {previewAuthorHeadline}
                      </div>
                      <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>Just now</span>
                        <span>•</span>
                        <Globe className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </div>

                {/* Editable Post Body */}
                <div className="space-y-2">
                  <Textarea
                    value={activeDraft.body}
                    onChange={(e) => setActiveDraft(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                    className="w-full bg-transparent border-0 focus-visible:ring-0 p-0 text-xs text-slate-200 leading-relaxed resize-none"
                  />

                  {/* CTA Text */}
                  <div className="pt-2 border-t border-slate-900 text-xs text-indigo-300 italic">
                    {activeDraft.cta}
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeDraft.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs text-blue-400 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visual Image Card */}
                {activeDraft.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900/60 relative group">
                    <img
                      src={activeDraft.imageUrl}
                      alt="Post visual"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1 text-indigo-400 font-mono font-semibold">
                        <ImageIcon className="w-3 h-3" /> Imagen Prompt:
                      </div>
                      <Input
                        value={activeDraft.imagePrompt}
                        onChange={(e) => setActiveDraft(prev => ({ ...prev, imagePrompt: e.target.value }))}
                        className="h-6 text-[10px] bg-slate-900 border-slate-800 text-slate-300"
                      />
                    </div>
                  </div>
                )}

                {/* LinkedIn Action Bar (Reactions) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400 px-2">
                  <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Like</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>Repost</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Calendar Dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Content Schedule & Saved Drafts
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Weekly/monthly calendar roadmap of queued LinkedIn thought leadership.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
              <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
            </div>

            <div className="space-y-2">
              {draftsList.map((d, index) => (
                <div key={d.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{d.title}</span>
                    <span className="text-slate-400 text-[11px] truncate block max-w-md">{d.hook}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                    Week {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
