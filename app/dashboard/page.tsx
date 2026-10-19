import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile-service";
import { getLatestAudit } from "./audit/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  BarChart3,
  PenTool,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const latestAudit = await getLatestAudit();

  // Calculate profile completion score
  let completedFields = 0;
  const totalFields = 6;
  if (profile?.full_name) completedFields++;
  if (profile?.headline) completedFields++;
  if (profile?.skills && profile.skills.length > 0) completedFields++;
  if (profile?.experience && profile.experience.length > 0) completedFields++;
  if (profile?.career_goals && profile.career_goals.length > 0) completedFields++;
  if (profile?.preferences?.tone) completedFields++;

  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-400">
              {profile?.current_status || "Professional"} Track
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(" ")[0] || "Engineer"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {profile?.headline || "Senior Software Engineer | High-Scale Distributed Systems"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/audit">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 text-xs h-9">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Run Profile Audit
            </Button>
          </Link>
          <Link href="/dashboard/studio">
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-9">
              <PenTool className="w-3.5 h-3.5 mr-1.5" /> Draft New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completion Tracker */}
        <Card className="border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Profile Calibration</CardTitle>
              <span className="text-xs font-mono font-bold text-indigo-400">{completionPercentage}%</span>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Profile completeness across experience, skills, and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercentage} className="h-2.5 bg-slate-950" indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Core identity & target industry calibrated</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified skills ({profile?.skills?.length || 8} competencies)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI voice persona: {profile?.preferences?.tone || "Thought Leadership"}</span>
              </div>
            </div>
          </CardContent>
          <div className="p-4 pt-0 border-t border-slate-800/60">
            <Link href="/onboarding" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-between">
              <span>Review or update onboarding inputs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Latest Audit Score Widget */}
        <Card className="border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Executive Profile Score</CardTitle>
              <Badge variant={latestAudit && latestAudit.overall_score >= 80 ? "success" : "warning"}>
                {latestAudit ? `${latestAudit.overall_score} / 100` : "Pending Audit"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Rubric rating based on quantified impact & ATS indexing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestAudit ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Headline</span>
                    <span className="font-bold text-white font-mono">{latestAudit.category_scores.headline}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Experience (XYZ)</span>
                    <span className="font-bold text-white font-mono">{latestAudit.category_scores.experience}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">About Summary</span>
                    <span className="font-bold text-white font-mono">{latestAudit.category_scores.about}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Keywords</span>
                    <span className="font-bold text-white font-mono">{latestAudit.category_scores.skills_keywords}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No profile audit recorded yet.</p>
              </div>
            )}
          </CardContent>
          <div className="p-4 pt-0 border-t border-slate-800/60">
            <Link href="/dashboard/audit" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-between">
              <span>{latestAudit ? "View detailed side-by-side rewrites" : "Launch first audit"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Target Milestone Status */}
        <Card className="border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Target Career Role</CardTitle>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                Active Target
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Primary track guiding content and networking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-sm font-bold text-white">
                {profile?.target_roles?.[0] || "Staff Software Engineer"}
              </div>
              <div className="text-xs text-indigo-400 mt-0.5">
                {profile?.target_industry || "AI Infrastructure & Distributed Systems"}
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <span className="text-slate-500 font-mono uppercase text-[10px] block">Primary Goal:</span>
              <p className="italic text-slate-300">
                &quot;{profile?.career_goals?.[0] || "Advance into Staff or Principal Engineer role"}&quot;
              </p>
            </div>
          </CardContent>
          <div className="p-4 pt-0 border-t border-slate-800/60">
            <Link href="/dashboard/roadmap" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-between">
              <span>Explore Career Roadmap milestones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Core Workflow Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Core AI Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Audit */}
          <Link href="/dashboard/audit" className="group">
            <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500/40 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-white group-hover:text-blue-300 transition-colors">
                  Profile Audit
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  100-point rubric assessment with side-by-side metric rewrites.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0 text-xs text-blue-400 font-medium flex items-center gap-1">
                <span>Start Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>
          </Link>

          {/* Card 2: Studio */}
          <Link href="/dashboard/studio" className="group">
            <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                  <PenTool className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-white group-hover:text-indigo-300 transition-colors">
                  Content Studio
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Conversational post drafting, live LinkedIn preview, and visual generation.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0 text-xs text-indigo-400 font-medium flex items-center gap-1">
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>
          </Link>

          {/* Card 3: Networking */}
          <Link href="/dashboard/networking" className="group">
            <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-white group-hover:text-purple-300 transition-colors">
                  Networking Assistant
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Boolean search generator and personalized cold outreach DMs.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0 text-xs text-purple-400 font-medium flex items-center gap-1">
                <span>Find Contacts</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>
          </Link>

          {/* Card 4: Roadmap */}
          <Link href="/dashboard/roadmap" className="group">
            <Card className="h-full border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-white group-hover:text-emerald-300 transition-colors">
                  Career Roadmap
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Skills gap analysis and chronological milestone checklist.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0 text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Recent Activity Log
            </CardTitle>
            <span className="text-[11px] text-slate-500 font-mono">SUPABASE PERSISTENCE</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Profile Initialized</span>
                <span className="text-slate-500">Just now</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                Onboarding wizard completed with {profile?.current_status || "Professional"} status preferences.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">AI Voice Persona Configured</span>
                <span className="text-slate-500">Today</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                Calibrated tone to &quot;{profile?.preferences?.tone || "Thought Leadership & Deep Technical"}&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
