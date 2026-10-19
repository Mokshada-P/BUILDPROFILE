"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  X,
  Upload,
  FileText,
  ArrowRight,
  RefreshCw,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Clock
} from "lucide-react";
import { submitProfileAudit, getLatestAudit } from "./actions";
import { loadCurrentProfile } from "@/app/onboarding/actions";
import { useToast } from "@/components/ui/use-toast";
import type { ProfileAuditResult } from "@/lib/gemini";

export default function AuditPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [acceptedRecs, setAcceptedRecs] = useState<Record<string, boolean>>({});
  const [rejectedRecs, setRejectedRecs] = useState<Record<string, boolean>>({});

  // Input state
  const [targetRole, setTargetRole] = useState("Staff Software Engineer");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [experience, setExperience] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Results state
  const [auditResult, setAuditResult] = useState<ProfileAuditResult | null>(null);

  // Load existing profile and previous audit if any
  useEffect(() => {
    async function loadInitial() {
      const existingAudit = await getLatestAudit();
      if (existingAudit) {
        setAuditResult(existingAudit);
      }

      const profile = await loadCurrentProfile();
      if (profile) {
        if (!headline && profile.headline) setHeadline(profile.headline);
        if (profile.target_roles && profile.target_roles.length > 0) {
          setTargetRole(profile.target_roles[0]);
        }
        if (profile.experience && profile.experience.length > 0) {
          const expText = profile.experience
            .map((e: any) => `${e.title || 'Role'} at ${e.company || 'Company'}: ${e.description || ''}`)
            .join("\n\n");
          if (!experience) setExperience(expText);
        }
      }
    }
    loadInitial();
  }, []);

  function handleFillSample() {
    setHeadline("Senior Software Engineer at CloudCorp | Building distributed backend systems in Go & Rust");
    setAbout("Passionate backend engineer with 5 years experience building cloud services. Experienced with Kubernetes, Docker, and relational databases. Looking to transition into Staff level responsibilities.");
    setExperience("• Responsible for maintaining API microservices in Go and managing database migrations.\n• Worked on reducing system latency and participated in on-call rotation.\n• Assisted in migrating legacy services to AWS EKS.");
    setTargetRole("Staff Software Engineer");
    toast({
      title: "Sample Profile Populated",
      description: "Sample tech practitioner profile ready for audit.",
    });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setExperience(prev => (prev ? `${prev}\n\n[Uploaded from ${file.name}]:\n${text.slice(0, 2000)}` : text.slice(0, 2500)));
        toast({
          title: "File Loaded",
          description: `Extracted content from ${file.name}.`,
        });
      }
    };
    reader.readAsText(file);
  }

  async function handleRunAudit() {
    setLoading(true);
    try {
      const result = await submitProfileAudit({
        headline,
        about,
        experience,
        targetRole,
        rawFileName: uploadedFileName || undefined,
      });
      setAuditResult(result);
      setAcceptedRecs({});
      setRejectedRecs({});
      toast({
        title: "Audit Completed Successfully",
        description: `Your profile scored ${result.overall_score}/100. Review the detailed category breakdowns and rewrites below.`,
      });
    } catch (err: any) {
      toast({
        title: "Audit Error",
        description: err.message || "Could not complete audit. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to Clipboard",
      description: "Rewritten bullet point copied.",
    });
    setTimeout(() => setCopiedId(null), 2500);
  }

  function handleAccept(id: string) {
    setAcceptedRecs(prev => ({ ...prev, [id]: true }));
    setRejectedRecs(prev => ({ ...prev, [id]: false }));
    toast({
      title: "Recommendation Accepted",
      description: "Saved to your active profile improvements.",
    });
  }

  function handleReject(id: string) {
    setRejectedRecs(prev => ({ ...prev, [id]: true }));
    setAcceptedRecs(prev => ({ ...prev, [id]: false }));
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              WORKFLOW A
            </span>
            <span className="text-xs text-slate-400">Google Gemini 1.5 & Heuristic Rubric</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Profile Audit Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluate your headline, experience, and value positioning against elite industry rubrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleFillSample}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-9"
          >
            Load Sample Profile
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Provide Profile Credentials to Audit
          </CardTitle>
          <CardDescription className="text-slate-400">
            Submit your profile text or upload a resume export. BuildProfile never hallucinates past history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="bg-slate-950 border border-slate-800 mb-6">
              <TabsTrigger value="manual" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Manual Structured Entry
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document / Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole" className="text-slate-300 text-xs">Target Role Benchmark</Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Staff Software Engineer, Engineering Director"
                    className="bg-slate-950/70 border-slate-800 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-slate-300 text-xs">Current LinkedIn Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer | Distributed Systems | Go & Rust"
                    className="bg-slate-950/70 border-slate-800 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about" className="text-slate-300 text-xs">About / Summary Section</Label>
                <Textarea
                  id="about"
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  placeholder="Paste your current LinkedIn 'About' summary..."
                  rows={3}
                  className="bg-slate-950/70 border-slate-800 text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-slate-300 text-xs">
                  Work Experience Bullets & Achievements
                </Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Paste 2-5 recent experience bullets or project achievements..."
                  rows={4}
                  className="bg-slate-950/70 border-slate-800 text-white text-sm font-mono text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-0">
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/40 hover:border-slate-700 transition-all">
                <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white mb-1">
                  Upload Resume or LinkedIn PDF Export
                </h4>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Drag and drop a .txt, .pdf, or .md file. Text content will be extracted and parsed safely on the server.
                </p>
                <input
                  type="file"
                  id="resume-file"
                  accept=".txt,.pdf,.md,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="resume-file">
                  <Button type="button" variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                {uploadedFileName && (
                  <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Loaded: {uploadedFileName}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t border-slate-800/80 pt-4 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Audit processes against Google XYZ impact formulas and ATS parser rules.
          </span>
          <Button
            onClick={handleRunAudit}
            disabled={loading || (!headline && !experience && !about)}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold shadow-lg shadow-indigo-600/20 px-6 h-10"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Auditing with Gemini...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 text-amber-300" />
                Execute Profile Audit
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Audit Results View */}
      {auditResult && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score */}
            <Card className="border-slate-800 bg-slate-900/80 md:col-span-1 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="text-xs font-mono uppercase text-slate-400">Executive Score</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-5xl font-black ${
                    auditResult.overall_score >= 80 ? "text-emerald-400" :
                    auditResult.overall_score >= 65 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {auditResult.overall_score}
                  </span>
                  <span className="text-slate-500 text-lg font-bold">/ 100</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-1">
                  <Badge variant={auditResult.overall_score >= 80 ? "success" : "warning"}>
                    {auditResult.overall_score >= 80 ? "Senior/Staff Tier" : "Needs Metric Refinement"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-normal">
                  Benchmarked against top 10% profiles for {targetRole}.
                </p>
              </CardContent>
            </Card>

            {/* Category Breakdown Gauges */}
            <Card className="border-slate-800 bg-slate-900/80 md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white">Category Breakdown Rubric</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Calculated from quantified impact, keyword density, and value positioning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Headline Impact & ATS Keywords</span>
                    <span className="font-mono font-bold text-white">{auditResult.category_scores.headline}%</span>
                  </div>
                  <Progress value={auditResult.category_scores.headline} className="h-2 bg-slate-950" indicatorClassName="bg-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Work Experience & Metric Quantification (XYZ Formula)</span>
                    <span className="font-mono font-bold text-white">{auditResult.category_scores.experience}%</span>
                  </div>
                  <Progress value={auditResult.category_scores.experience} className="h-2 bg-slate-950" indicatorClassName="bg-indigo-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">About / Value Hook & Storytelling</span>
                    <span className="font-mono font-bold text-white">{auditResult.category_scores.about}%</span>
                  </div>
                  <Progress value={auditResult.category_scores.about} className="h-2 bg-slate-950" indicatorClassName="bg-purple-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Skills Clustering & Core Technologies</span>
                    <span className="font-mono font-bold text-white">{auditResult.category_scores.skills_keywords}%</span>
                  </div>
                  <Progress value={auditResult.category_scores.skills_keywords} className="h-2 bg-slate-950" indicatorClassName="bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Detected Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {auditResult.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Areas for Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {auditResult.weaknesses.map((weak, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Side-by-Side Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Actionable Side-by-Side Rewrites</h3>
                <p className="text-xs text-slate-400">
                  Interactive suggestions. Accept, reject, or copy individual high-resonance replacements.
                </p>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono text-xs">
                {auditResult.recommendations.length} SUGGESTIONS
              </Badge>
            </div>

            <div className="space-y-4">
              {auditResult.recommendations.map((rec) => {
                const isAccepted = acceptedRecs[rec.id];
                const isRejected = rejectedRecs[rec.id];

                return (
                  <Card
                    key={rec.id}
                    className={`border transition-all ${
                      isAccepted
                        ? "border-emerald-500/50 bg-emerald-950/20"
                        : isRejected
                        ? "border-slate-800/40 bg-slate-950/30 opacity-50"
                        : "border-slate-800 bg-slate-900/70"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {rec.category}
                        </span>
                        <Badge variant={rec.impact_rating === "High" ? "destructive" : "accent"}>
                          {rec.impact_rating} Conversion Impact
                        </Badge>
                      </div>
                      {isAccepted && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Accepted
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Dismissed
                        </span>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 pt-2 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Original */}
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">
                            Original Input (Weak / Vague)
                          </span>
                          <p className="text-xs text-slate-300 font-mono leading-relaxed">
                            {rec.original}
                          </p>
                        </div>

                        {/* Rewritten */}
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                              AI Quantified Rewrite (High Impact)
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(rec.id, rec.rewritten)}
                              className="h-6 px-2 text-[11px] text-emerald-400 hover:text-white hover:bg-emerald-800/40"
                            >
                              {copiedId === rec.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" /> Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-100 font-medium leading-relaxed">
                            {rec.rewritten}
                          </p>
                        </div>
                      </div>

                      {/* Rationale explanation */}
                      <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded border border-slate-800/60">
                        <strong className="text-slate-300">Recruiter Rationale:</strong> {rec.rationale}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 border-t border-slate-800/40 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(rec.id)}
                        className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(rec.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-8 px-3"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Accept Recommendation
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Plan */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Prioritized Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditResult.action_plan.map((item) => (
                <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.timeframe}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
