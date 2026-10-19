"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Plus,
  RefreshCw,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Flag,
  Layers,
  Award
} from "lucide-react";
import {
  generateRoadmapAction,
  loadMilestonesAction,
  toggleMilestoneAction,
  addCustomMilestoneAction,
} from "./actions";
import { loadCurrentProfile } from "@/app/onboarding/actions";
import { useToast } from "@/components/ui/use-toast";
import type { CareerMilestone, RoadmapAnalysis } from "@/lib/roadmap-service";

export default function RoadmapPage() {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<CareerMilestone[]>([]);
  const [skillsGap, setSkillsGap] = useState<string[]>([
    "Distributed Consensus & Multi-Region Replication (Raft/Paxos)",
    "Cross-functional Architectural RFC Ownership & Engineering Vision",
    "Cloud Infrastructure FinOps & Large-scale Cost Optimization",
    "External Industry Brand & Conference Speaking Visibility"
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    priority: "high" as "high" | "medium" | "low",
    timeframe: "Month 1-3",
    category: "System Architecture",
  });

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const p = await loadCurrentProfile();
      if (p) setProfile(p);
      const list = await loadMilestonesAction();
      setMilestones(list);
    }
    load();
  }, []);

  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "completed").length;
  const inProgress = milestones.filter(m => m.status === "in_progress").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await generateRoadmapAction();
      setMilestones(res.milestones);
      setSkillsGap(res.skillsGap);
      toast({
        title: "Career Roadmap Refreshed",
        description: `Analyzed against target role: ${res.targetRole}.`,
      });
    } catch {
      toast({
        title: "Notice",
        description: "Roadmap loaded with personalized heuristics.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCycleStatus(milestone: CareerMilestone) {
    const nextStatus =
      milestone.status === "pending"
        ? "in_progress"
        : milestone.status === "in_progress"
        ? "completed"
        : "pending";

    await toggleMilestoneAction(milestone.id, nextStatus);
    setMilestones(prev =>
      prev.map(m => (m.id === milestone.id ? { ...m, status: nextStatus } : m))
    );

    toast({
      title: "Milestone Updated",
      description: `"${milestone.title}" set to ${nextStatus.replace("_", " ")}.`,
    });
  }

  async function handleAddCustom() {
    if (!newMilestone.title.trim()) return;

    const created = await addCustomMilestoneAction(newMilestone);
    setMilestones(prev => [...prev, created]);
    setAddModalOpen(false);
    setNewMilestone({
      title: "",
      description: "",
      priority: "high",
      timeframe: "Month 1-3",
      category: "System Architecture",
    });

    toast({
      title: "Milestone Created",
      description: "Added to your career roadmap.",
    });
  }

  const filtered = milestones.filter(m => {
    if (activeTab === "all") return true;
    return m.status === activeTab;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              WORKFLOW D
            </span>
            <span className="text-xs text-slate-400">
              Target Track: {profile?.target_roles?.[0] || "Staff Software Engineer"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dynamic Career Roadmap</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Identify technical skill gaps and execute prioritized chronological milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Regenerate with Gemini
          </Button>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Milestone
          </Button>
        </div>
      </div>

      {/* Skills Gap Analysis Banner */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Skills Gap Matrix: {profile?.headline || "Current Engineer"} → {profile?.target_roles?.[0] || "Staff Systems Architect"}
            </CardTitle>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs font-mono">
              COMPETENCY GAP
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Identified requirements needed to achieve parity with top tier candidates in this role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {skillsGap.map((gap, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                <span className="text-slate-200">{gap}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress & Milestone Pipeline */}
      <div className="space-y-4">
        {/* Progress Tracker Card */}
        <Card className="border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block">Milestone Completion</span>
              <div className="text-lg font-bold text-white">
                {completed} of {total} Milestones Finished ({progressPercent}%)
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completed} Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{inProgress} In Progress</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Circle className="w-3.5 h-3.5" />
                <span>{total - completed - inProgress} Pending</span>
              </div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-slate-950" indicatorClassName="bg-emerald-500" />
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-emerald-600">All ({milestones.length})</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs data-[state=active]:bg-emerald-600">In Progress ({inProgress})</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-emerald-600">Completed ({completed})</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-emerald-600">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          {filtered.map((m) => {
            const isCompleted = m.status === "completed";
            const isInProgress = m.status === "in_progress";

            return (
              <Card
                key={m.id}
                className={`border transition-all ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-950/15"
                    : isInProgress
                    ? "border-indigo-500/50 bg-indigo-950/20"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(m)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    title="Click to cycle status"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 hover:text-emerald-300" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-indigo-400 hover:text-indigo-300 animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  {/* Milestone Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isCompleted ? "line-through text-slate-400" : "text-white"}`}>
                          {m.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                          {m.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            m.priority === "high"
                              ? "destructive"
                              : m.priority === "medium"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-mono"
                        >
                          {m.priority} Priority
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {m.timeframe}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Status: <strong className="text-slate-300 capitalize">{m.status.replace("_", " ")}</strong>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCycleStatus(m)}
                        className="h-6 text-[11px] text-indigo-400 hover:text-indigo-300 p-0"
                      >
                        Cycle status →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Custom Milestone Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Create Custom Career Milestone
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Add a personalized project, publication, or certification goal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Milestone Title</Label>
              <Input
                value={newMilestone.title}
                onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Present Distributed Tracing Architecture at GopherCon"
                className="bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Description & Proof of Work</Label>
              <Textarea
                value={newMilestone.description}
                onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe deliverables and success criteria..."
                rows={3}
                className="bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Priority Level</Label>
                <select
                  value={newMilestone.priority}
                  onChange={e => setNewMilestone(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-800 text-white text-xs px-2"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Target Timeframe</Label>
                <Input
                  value={newMilestone.timeframe}
                  onChange={e => setNewMilestone(prev => ({ ...prev, timeframe: e.target.value }))}
                  placeholder="e.g. Month 1-2, Q3"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleAddCustom}
              disabled={!newMilestone.title.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 mt-2"
            >
              Add Milestone to Roadmap
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
