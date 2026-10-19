"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  PenTool,
  Users,
  Compass,
  CheckCircle2,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { startDemoSession } from "@/app/auth/actions";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              BuildProfile
            </span>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-400">
              AI ENGINE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-900 text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/25 text-sm">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Powered by Google Gemini 1.5 & Supabase Row-Level Security</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Turn Your LinkedIn into an{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Executive Magnet
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
            Stop losing opportunities to inferior profiles. BuildProfile evaluates your credentials against elite industry rubrics, drafts high-resonance thought leadership, and crafts hyper-personalized outreach that gets answered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold shadow-xl shadow-indigo-600/30 h-12 px-8">
                Start Free Profile Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <form action={() => startDemoSession("Professional")} className="w-full sm:w-auto">
              <Button type="submit" size="lg" variant="outline" className="w-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 h-12 px-6">
                Instant Sandbox Demo
              </Button>
            </form>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">94%</div>
              <div className="text-xs text-slate-400 mt-1">Audit Score Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">4.8x</div>
              <div className="text-xs text-slate-400 mt-1">Recruiter Profile Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">72%</div>
              <div className="text-xs text-slate-400 mt-1">Cold Outreach Reply Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">Zero</div>
              <div className="text-xs text-slate-400 mt-1">Hallucinated Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 border-t border-slate-800/80 bg-slate-900/30 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 mb-3">
              FOUR CORE ENGINES
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Everything required to dominate your tech niche
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Engineered with strict zero-hallucination guardrails and personalized directly from your real career achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-white">AI Profile Audit Engine</CardTitle>
                <CardDescription className="text-slate-400">
                  A rigorous 100-point rubric assessing clarity, quantified impact, keyword density, and headline resonance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive side-by-side Before & After bullet rewrites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Category breakdowns: Headline, About, Work Experience, Skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>One-click &apos;Accept&apos; or &apos;Reject&apos; recommendations with instant copy</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <PenTool className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-white">AI Content Studio & Visuals</CardTitle>
                <CardDescription className="text-slate-400">
                  Turn your engineering triumphs and daily learnings into viral LinkedIn thought leadership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time split panel chat with editable LinkedIn live preview card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3-stage viral hooks generator, targeted CTAs, and hashtag clustering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Integrated Imagen visual prompts & content calendar scheduler</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-white">Targeted Networking Assistant</CardTitle>
                <CardDescription className="text-slate-400">
                  Target decision makers without sounding like a generic automated bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Precision Boolean search query generator for exact LinkedIn targeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hyper-personalized cold outreach referencing shared skills & achievements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Connection tracker with status pipeline (&apos;Saved&apos;, &apos;Contacted&apos;, &apos;Replied&apos;)</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-white">Dynamic Career Roadmap</CardTitle>
                <CardDescription className="text-slate-400">
                  Map the exact technical and leadership milestones needed to land your next high-compensation role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Skills gap analysis comparing current resume against target roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Actionable chronological milestones with priority & due dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Check off progress with automated Supabase persistence</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Framework */}
      <section id="testimonials" className="py-24 border-t border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 mb-3">
              REAL RESULTS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Built for Ambitious Engineers & Leaders
            </h2>
            <p className="text-slate-400">
              See how tech talent uses BuildProfile to break through the noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic mb-6 leading-relaxed">
                  &quot;The AI Profile Audit gave me brutally honest feedback on my vague bullet points. After applying the rewritten metric formulas, my inbound recruiter messages tripled in two weeks.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Maya Raman</div>
                    <div className="text-xs text-slate-400">Senior Distributed Systems Engineer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic mb-6 leading-relaxed">
                  &quot;Content Studio is incredible. It captured my technical tone without sounding like generic marketing hype. Writing posts that spark genuine technical debates now takes 5 minutes.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                    DL
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">David Lin</div>
                    <div className="text-xs text-slate-400">Staff AI Researcher & Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic mb-6 leading-relaxed">
                  &quot;Transitioning from non-tech to frontend was terrifying. The Career Roadmap laid out step-by-step milestones, and the Networking Assistant got me coffee chats with hiring managers.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                    SK
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Sara Krueger</div>
                    <div className="text-xs text-slate-400">Full-Stack Engineer (Career Switcher)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-800/80 bg-slate-900/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 mb-3">
              SIMPLE TRANSPARENT PRICING
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Invest in your lifetime career trajectory
            </h2>
            <p className="text-slate-400">
              Start with the free tier and upgrade as your personal brand compounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Starter */}
            <Card className="border-slate-800 bg-slate-900/50 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg text-white">Starter Sandbox</CardTitle>
                <CardDescription className="text-slate-400">Essential baseline optimizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-slate-400 text-sm ml-2">/ forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Full AI Profile Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3 LinkedIn Post Drafts / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Personalized Boolean Search URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard career milestone tracker</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro Creator */}
            <Card className="border-indigo-500 bg-slate-900/80 relative shadow-xl shadow-indigo-500/10 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[11px] font-bold text-white tracking-wide uppercase">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-white">Pro Creator</CardTitle>
                <CardDescription className="text-slate-400">For ambitious engineers scaling reach</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">$24</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Gemini 1.5 Profile Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Content Studio drafting & Imagen prompts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 Personalized outreach cold DMs / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive dynamic career roadmapping</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold">
                    Start Pro 14-Day Trial
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Executive Growth */}
            <Card className="border-slate-800 bg-slate-900/50 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg text-white">Executive Authority</CardTitle>
                <CardDescription className="text-slate-400">For founders, directors, and VPs</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">$69</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Pro with highest LLM reasoning tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Executive ghostwriting voice calibration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom outreach scripts for VC & board opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated priority pipeline support</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200">
                    Contact Enterprise
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-bold text-white">BuildProfile AI</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BuildProfile AI. Strict zero-hallucination standards. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/onboarding" className="hover:text-white">Onboarding</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
