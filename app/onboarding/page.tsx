"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Briefcase,
  Layers,
  Target,
  Wand2,
  CheckCircle2,
  Plus,
  X,
  Building,
  GraduationCap,
  Compass,
  FileCheck2,
} from "lucide-react";
import { saveOnboardingStep, completeOnboardingAction, loadCurrentProfile } from "./actions";
import { useToast } from "@/components/ui/use-toast";

const POPULAR_SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "Rust",
  "PostgreSQL", "Docker", "Kubernetes", "AWS", "System Design",
  "Distributed Systems", "GraphQL", "Tailwind CSS", "Machine Learning",
  "LangChain", "FastAPI", "Microservices", "Kafka"
];

const INDUSTRIES = [
  "AI Infrastructure & Machine Learning",
  "Cloud Platforms & Distributed Systems",
  "Fintech & Crypto Infrastructure",
  "Developer Tooling & DevOps",
  "Enterprise B2B SaaS",
  "Healthtech & Biotech",
  "E-Commerce & High-Scale Retail",
  "Cybersecurity & Identity"
];

const CAREER_GOALS = [
  "Advance into Staff or Principal Engineer role",
  "Increase inbound executive & recruiter inquiries",
  "Establish authority as an industry thought leader",
  "Transition into AI / ML engineering from traditional software",
  "Land high-compensation remote US tech roles",
  "Build high-converting founder & advisory network"
];

const TONE_OPTIONS = [
  {
    id: "Thought Leadership & Deep Technical",
    title: "Thought Leadership & Deep Technical",
    description: "Rigorous architectural analysis, benchmark metrics, and systems trade-offs that resonate with Staff+ engineers and CTOs.",
    badge: "Recommended for Senior Tech"
  },
  {
    id: "Conversational & Storytelling",
    title: "Conversational & Storytelling",
    description: "Engaging personal narratives, lessons learned from production incidents, and approachable behind-the-scenes insights.",
    badge: "High Engagement"
  },
  {
    id: "Executive & Strategic",
    title: "Executive & Strategic",
    description: "Concise, outcome-oriented framing focusing on business ROI, engineering org velocity, and leadership philosophy.",
    badge: "For Founders & Directors"
  },
  {
    id: "Authentic Practitioner",
    title: "Authentic Practitioner",
    description: "Raw coding experiments, daily project breakthroughs, and actionable tutorials with zero fluff.",
    badge: "Great for Switchers & Builders"
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    linkedinUrl: "",
    currentStatus: "Professional",
    headline: "",
    
    // Education & Experience
    institution: "",
    degree: "",
    graduationYear: "",
    currentCompany: "",
    currentRole: "",
    experienceYears: "4",
    experienceDescription: "",
    previousField: "", // For career switcher

    // Skills & Target
    skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "System Design"] as string[],
    customSkill: "",
    targetIndustry: "AI Infrastructure & Machine Learning",
    targetRoles: ["Senior Software Engineer", "Staff Engineer"] as string[],
    customRole: "",

    // Career Goals
    careerGoals: ["Advance into Staff or Principal Engineer role", "Establish authority as an industry thought leader"] as string[],

    // AI Tone Preferences
    tone: "Thought Leadership & Deep Technical",
    targetAudience: "Engineering Leaders, CTOs, and Staff Engineers",
    postingFrequency: "2-3 posts per week",
  });

  // Prepopulate if profile exists
  useEffect(() => {
    async function load() {
      const existing = await loadCurrentProfile();
      if (existing) {
        setFormData(prev => ({
          ...prev,
          fullName: existing.full_name || prev.fullName,
          location: existing.location || prev.location,
          linkedinUrl: existing.linkedin_url || prev.linkedinUrl,
          currentStatus: existing.current_status || prev.currentStatus,
          headline: existing.headline || prev.headline,
          skills: existing.skills && existing.skills.length > 0 ? existing.skills : prev.skills,
          targetIndustry: existing.target_industry || prev.targetIndustry,
          targetRoles: existing.target_roles && existing.target_roles.length > 0 ? existing.target_roles : prev.targetRoles,
          careerGoals: existing.career_goals && existing.career_goals.length > 0 ? existing.career_goals : prev.careerGoals,
          tone: existing.preferences?.tone || prev.tone,
        }));
      }
    }
    load();
  }, []);

  const totalSteps = 6;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  function handleFieldChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function toggleSkill(skill: string) {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  }

  function addCustomSkill() {
    if (formData.customSkill.trim() && !formData.skills.includes(formData.customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.customSkill.trim()],
        customSkill: ""
      }));
    }
  }

  function toggleGoal(goal: string) {
    setFormData(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.includes(goal)
        ? prev.careerGoals.filter(g => g !== goal)
        : [...prev.careerGoals, goal]
    }));
  }

  function toggleTargetRole(role: string) {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  }

  function addCustomRole() {
    if (formData.customRole.trim() && !formData.targetRoles.includes(formData.customRole.trim())) {
      setFormData(prev => ({
        ...prev,
        targetRoles: [...prev.targetRoles, prev.customRole.trim()],
        customRole: ""
      }));
    }
  }

  async function handleNext() {
    setSaving(true);
    try {
      // Persist step progress to database
      await saveOnboardingStep({
        full_name: formData.fullName,
        location: formData.location,
        linkedin_url: formData.linkedinUrl,
        current_status: formData.currentStatus,
        headline: formData.headline,
        education: [
          {
            institution: formData.institution,
            degree: formData.degree,
            fieldOfStudy: "Computer Science & Engineering",
            graduationYear: formData.graduationYear,
          }
        ],
        experience: [
          {
            title: formData.currentRole,
            company: formData.currentCompany,
            description: formData.experienceDescription,
          }
        ],
        skills: formData.skills,
        target_industry: formData.targetIndustry,
        target_roles: formData.targetRoles,
        career_goals: formData.careerGoals,
        preferences: {
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          postingFrequency: formData.postingFrequency,
        }
      });

      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    } catch {
      toast({
        title: "Progress Saved",
        description: "Your answers were saved to your profile draft.",
      });
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalSubmit() {
    setSaving(true);
    try {
      await completeOnboardingAction({
        full_name: formData.fullName,
        location: formData.location,
        linkedin_url: formData.linkedinUrl,
        current_status: formData.currentStatus,
        headline: formData.headline || `${formData.currentRole || 'Software Engineer'} at ${formData.currentCompany || 'Tech Corp'}`,
        education: [
          {
            institution: formData.institution || "University",
            degree: formData.degree || "B.S. Computer Science",
            fieldOfStudy: "Computer Science",
            graduationYear: formData.graduationYear || "2022",
          }
        ],
        experience: [
          {
            title: formData.currentRole || "Senior Engineer",
            company: formData.currentCompany || "Tech Co",
            description: formData.experienceDescription || "Designed scalable systems and led technical initiatives.",
          }
        ],
        skills: formData.skills,
        target_industry: formData.targetIndustry,
        target_roles: formData.targetRoles,
        career_goals: formData.careerGoals,
        preferences: {
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          postingFrequency: formData.postingFrequency,
        }
      });
    } catch {
      // completeOnboardingAction redirects to /dashboard
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-bold text-white tracking-tight">BuildProfile AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>STEP {currentStep} OF {totalSteps}</span>
            <span className="text-indigo-400 font-bold">{progressPercent}% COMPLETED</span>
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="container mx-auto max-w-3xl px-4 py-8 flex-1">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercent} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        </div>

        {/* STEP 1: Personal Info & Professional Status */}
        {currentStep === 1 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                <User className="w-4 h-4" />
                <span>STEP 1: IDENTITY & STATUS</span>
              </div>
              <CardTitle className="text-2xl text-white">Who are you and where are you headed?</CardTitle>
              <CardDescription className="text-slate-400">
                Help the AI engine calibrate baseline expectations and industry context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Professional Status Selection */}
              <div>
                <Label className="text-slate-300 text-sm font-medium mb-3 block">
                  Select your current professional status:
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "Student", label: "Student", desc: "Enrolled in university or bootcamp" },
                    { id: "Fresher", label: "Fresher", desc: "Recent grad (<1 yr experience)" },
                    { id: "Professional", label: "Professional", desc: "Experienced tech practitioner" },
                    { id: "Switcher", label: "Switcher", desc: "Pivoting from another industry" },
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => handleFieldChange("currentStatus", status.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.currentStatus === status.id
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-semibold text-sm">{status.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-tight">{status.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={e => handleFieldChange("fullName", e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="bg-slate-950/60 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">Current Location / Timezone</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => handleFieldChange("location", e.target.value)}
                    placeholder="e.g. San Francisco, CA (PST)"
                    className="bg-slate-950/60 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="text-slate-300">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={e => handleFieldChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="bg-slate-950/60 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline" className="text-slate-300">Current Headline (Optional)</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={e => handleFieldChange("headline", e.target.value)}
                  placeholder="e.g. Senior Backend Engineer | Rust & Distributed Systems"
                  className="bg-slate-950/60 border-slate-800 text-white"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Education & Experience (Dynamic by Status) */}
        {currentStep === 2 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                {formData.currentStatus === "Student" || formData.currentStatus === "Fresher" ? (
                  <GraduationCap className="w-4 h-4" />
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
                <span>STEP 2: EDUCATION & EXPERIENCE ({formData.currentStatus.toUpperCase()})</span>
              </div>
              <CardTitle className="text-2xl text-white">Your Background & Proof of Work</CardTitle>
              <CardDescription className="text-slate-400">
                Provide real quantifiable details. BuildProfile never hallucinates achievements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* If Student or Fresher */}
              {(formData.currentStatus === "Student" || formData.currentStatus === "Fresher") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">University or Bootcamp</Label>
                      <Input
                        value={formData.institution}
                        onChange={e => handleFieldChange("institution", e.target.value)}
                        placeholder="e.g. UC Berkeley or Georgia Tech"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Degree & Major</Label>
                      <Input
                        value={formData.degree}
                        onChange={e => handleFieldChange("degree", e.target.value)}
                        placeholder="e.g. B.S. Computer Science"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Expected or Graduation Year</Label>
                    <Input
                      value={formData.graduationYear}
                      onChange={e => handleFieldChange("graduationYear", e.target.value)}
                      placeholder="e.g. 2024 or 2025"
                      className="bg-slate-950/60 border-slate-800 text-white"
                    />
                  </div>
                </div>
              )}

              {/* If Professional */}
              {formData.currentStatus === "Professional" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Role Title</Label>
                      <Input
                        value={formData.currentRole}
                        onChange={e => handleFieldChange("currentRole", e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Company or Organization</Label>
                      <Input
                        value={formData.currentCompany}
                        onChange={e => handleFieldChange("currentCompany", e.target.value)}
                        placeholder="e.g. Stripe, Datadog, or Seed-stage startup"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Total Years in Tech</Label>
                    <Input
                      value={formData.experienceYears}
                      onChange={e => handleFieldChange("experienceYears", e.target.value)}
                      placeholder="e.g. 5"
                      type="number"
                      className="bg-slate-950/60 border-slate-800 text-white"
                    />
                  </div>
                </div>
              )}

              {/* If Switcher */}
              {formData.currentStatus === "Switcher" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Previous Industry / Domain</Label>
                    <Input
                      value={formData.previousField}
                      onChange={e => handleFieldChange("previousField", e.target.value)}
                      placeholder="e.g. Mechanical Engineering, Finance Analyst, or High School Teacher"
                      className="bg-slate-950/60 border-slate-800 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Recent Tech Education / Program</Label>
                      <Input
                        value={formData.institution}
                        onChange={e => handleFieldChange("institution", e.target.value)}
                        placeholder="e.g. Self-taught, Hack Reactor, Coursera"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Target Tech Track</Label>
                      <Input
                        value={formData.currentRole}
                        onChange={e => handleFieldChange("currentRole", e.target.value)}
                        placeholder="e.g. Full-Stack Engineer, QA Automation"
                        className="bg-slate-950/60 border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Core Accomplishments / Description */}
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Key Achievements & Responsibilities (Quantified metrics where possible)
                </Label>
                <Textarea
                  value={formData.experienceDescription}
                  onChange={e => handleFieldChange("experienceDescription", e.target.value)}
                  placeholder="e.g. Led architecture of event-driven pipeline processing 50M daily events with Kafka and Go. Reduced cloud egress cost by 32%."
                  rows={4}
                  className="bg-slate-950/60 border-slate-800 text-white"
                />
                <p className="text-xs text-slate-500">
                  Tip: Include numbers, latency reductions, team sizes, or specific tools for best audit results.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Skills Tag System & Target Roles */}
        {currentStep === 3 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                <Layers className="w-4 h-4" />
                <span>STEP 3: SKILLS & TARGETING</span>
              </div>
              <CardTitle className="text-2xl text-white">Skills & Target Positioning</CardTitle>
              <CardDescription className="text-slate-400">
                Select your verified technical capabilities and the specific roles you want recruiters finding you for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Skills Tags */}
              <div className="space-y-3">
                <Label className="text-slate-300">Active Technical Skills ({formData.skills.length} selected)</Label>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                  {formData.skills.map(skill => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-slate-500">No skills selected yet. Click from the suggestions below.</span>
                  )}
                </div>

                {/* Custom skill adder */}
                <div className="flex gap-2">
                  <Input
                    value={formData.customSkill}
                    onChange={e => handleFieldChange("customSkill", e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                    placeholder="Add custom skill (e.g. WebRTC, Solr, Envoy)..."
                    className="bg-slate-950/60 border-slate-800 text-white text-xs"
                  />
                  <Button
                    type="button"
                    onClick={addCustomSkill}
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-slate-200 shrink-0 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                {/* Suggested skills */}
                <div>
                  <span className="text-xs text-slate-500 block mb-2">Popular suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map(skill => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                            isSelected
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Target Industry Selection */}
              <div className="space-y-2">
                <Label className="text-slate-300">Target Industry</Label>
                <select
                  value={formData.targetIndustry}
                  onChange={e => handleFieldChange("targetIndustry", e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-slate-950/60 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Roles */}
              <div className="space-y-3">
                <Label className="text-slate-300">Target Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {["Staff Software Engineer", "Senior Backend Engineer", "Principal Systems Architect", "AI Engineer", "Engineering Manager"].map(role => {
                    const isSelected = formData.targetRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleTargetRole(role)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-blue-600/20 text-blue-300 border-blue-500/40 font-medium"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1.5" />}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Career Goals */}
        {currentStep === 4 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                <Target className="w-4 h-4" />
                <span>STEP 4: CAREER GOALS</span>
              </div>
              <CardTitle className="text-2xl text-white">What are your primary milestones?</CardTitle>
              <CardDescription className="text-slate-400">
                The AI engine uses these to build your personalized career roadmap and cold outreach strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {CAREER_GOALS.map(goal => {
                  const isSelected = formData.careerGoals.includes(goal);
                  return (
                    <div
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-700 bg-slate-900"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{goal}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: AI Tone Preferences */}
        {currentStep === 5 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
                <Wand2 className="w-4 h-4" />
                <span>STEP 5: AI WRITING VOICE & TONE</span>
              </div>
              <CardTitle className="text-2xl text-white">How should your content sound?</CardTitle>
              <CardDescription className="text-slate-400">
                Calibrate Gemini&apos;s system prompt so your LinkedIn posts sound genuinely like you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TONE_OPTIONS.map(tone => {
                  const isSelected = formData.tone === tone.id;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => handleFieldChange("tone", tone.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-white">{tone.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono">
                            {tone.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {tone.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Active Tone</span>
                          </>
                        ) : (
                          <span className="text-slate-500">Click to select</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <Label className="text-slate-300">Target Readership</Label>
                  <Input
                    value={formData.targetAudience}
                    onChange={e => handleFieldChange("targetAudience", e.target.value)}
                    placeholder="e.g. CTOs, Staff Engineers, Tech Recruiters"
                    className="bg-slate-950/60 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Target Posting Frequency</Label>
                  <Input
                    value={formData.postingFrequency}
                    onChange={e => handleFieldChange("postingFrequency", e.target.value)}
                    placeholder="e.g. 2-3 posts per week"
                    className="bg-slate-950/60 border-slate-800 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: Review & Final Confirmation */}
        {currentStep === 6 && (
          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                <FileCheck2 className="w-4 h-4" />
                <span>STEP 6: REVIEW & CONFIRM</span>
              </div>
              <CardTitle className="text-2xl text-white">Review Your Profile Configuration</CardTitle>
              <CardDescription className="text-slate-400">
                Everything is configured and ready to power your AI dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Identity & Role</span>
                  <div className="text-base font-semibold text-white">{formData.fullName || "Engineer"}</div>
                  <div className="text-xs text-indigo-400">{formData.currentRole || formData.currentStatus} {formData.currentCompany ? `@ ${formData.currentCompany}` : ''}</div>
                  <div className="text-xs text-slate-400">{formData.location || "Remote / Unspecified"}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Target Industry & Roles</span>
                  <div className="text-sm font-medium text-white">{formData.targetIndustry}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.targetRoles.map(r => (
                      <Badge key={r} variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Core Technical Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map(s => (
                    <Badge key={s} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">AI Voice & Publishing Strategy</span>
                <div className="text-sm font-semibold text-white">{formData.tone}</div>
                <p className="text-xs text-slate-400">Targeting {formData.targetAudience} at {formData.postingFrequency}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1 || saving}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              disabled={saving}
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 px-6"
            >
              {saving ? "Saving..." : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={saving}
              onClick={handleFinalSubmit}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-semibold shadow-xl shadow-emerald-600/20 px-8"
            >
              {saving ? "Finalizing Profile..." : "Complete & Open Dashboard"}
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
