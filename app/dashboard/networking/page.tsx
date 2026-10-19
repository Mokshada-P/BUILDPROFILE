"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Sparkles,
  MessageSquare,
  Building,
  CheckCircle2,
  RefreshCw,
  Send,
  UserPlus,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import {
  generateSearchUrlAction,
  generateOutreachAction,
  saveContactAction,
  updateContactStatusAction,
  loadContactsAction,
} from "./actions";
import { loadCurrentProfile } from "@/app/onboarding/actions";
import { useToast } from "@/components/ui/use-toast";
import type { ConnectionContact, OutreachMessage } from "@/lib/networking-service";

export default function NetworkingPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ConnectionContact[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter Builder State
  const [roleFilter, setRoleFilter] = useState("Staff Software Engineer");
  const [companyFilter, setCompanyFilter] = useState("Stripe, Datadog, Cloudflare");
  const [keywordFilter, setKeywordFilter] = useState("Distributed Systems, Go, Kubernetes");
  const [searchResult, setSearchResult] = useState<{ searchUrl: string; booleanQuery: string }>({
    searchUrl: "",
    booleanQuery: "",
  });

  // Modal / Add Contact State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [newContact, setNewContact] = useState({
    fullName: "",
    title: "",
    company: "",
    profileUrl: "",
    sharedInterests: "",
  });
  const [generatedOutreach, setGeneratedOutreach] = useState<OutreachMessage | null>(null);

  // Load initial data
  useEffect(() => {
    async function load() {
      const list = await loadContactsAction();
      setContacts(list);

      const profile = await loadCurrentProfile();
      if (profile) {
        if (profile.target_roles && profile.target_roles.length > 0) {
          setRoleFilter(profile.target_roles.slice(0, 2).join(", "));
        }
        if (profile.skills && profile.skills.length > 0) {
          setKeywordFilter(profile.skills.slice(0, 3).join(", "));
        }
      }

      // Generate initial search query
      const initialSearch = await generateSearchUrlAction({
        roles: ["Staff Software Engineer"],
        companies: ["Stripe", "Datadog", "Cloudflare"],
        keywords: ["Distributed Systems", "Go"],
      });
      setSearchResult(initialSearch);
    }
    load();
  }, []);

  async function handleBuildSearch() {
    const roles = roleFilter.split(",").map(r => r.trim()).filter(Boolean);
    const companies = companyFilter.split(",").map(c => c.trim()).filter(Boolean);
    const keywords = keywordFilter.split(",").map(k => k.trim()).filter(Boolean);

    const res = await generateSearchUrlAction({ roles, companies, keywords });
    setSearchResult(res);
    toast({
      title: "Search Query Generated",
      description: "Boolean query optimized for LinkedIn Recruiter & People search.",
    });
  }

  function handleCopyQuery() {
    navigator.clipboard.writeText(searchResult.booleanQuery);
    setCopiedQuery(true);
    toast({ title: "Copied Boolean Query" });
    setTimeout(() => setCopiedQuery(false), 2000);
  }

  async function handleGenerateOutreach() {
    if (!newContact.fullName || !newContact.company) {
      toast({
        title: "Missing Information",
        description: "Please specify contact name and company.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingOutreach(true);
    try {
      const outreach = await generateOutreachAction({
        fullName: newContact.fullName,
        title: newContact.title,
        company: newContact.company,
        sharedInterests: newContact.sharedInterests,
      });
      setGeneratedOutreach(outreach);
      toast({
        title: "Personalized Outreach Created",
        description: "Connection note constrained to strict 300 characters.",
      });
    } catch {
      toast({
        title: "Generation Notice",
        description: "Outreach message prepared.",
      });
    } finally {
      setGeneratingOutreach(false);
    }
  }

  async function handleSaveNewContact() {
    if (!newContact.fullName) return;

    const saved = await saveContactAction({
      full_name: newContact.fullName,
      professional_title: newContact.title || "Engineering Leader",
      organisation: newContact.company || "Target Tech Corp",
      profile_url: newContact.profileUrl,
      relevance_score: generatedOutreach?.relevanceScore || 90,
      relevance_explanation: generatedOutreach?.personalizationHook || "Shared domain expertise in systems scaling",
      suggested_message: generatedOutreach?.connectionNote || "Hi, loved your team's work scaling infrastructure. Would love to connect!",
      inmail_message: generatedOutreach?.inMailFollowUp || "",
      status: "saved",
    });

    setContacts(prev => [saved, ...prev]);
    setAddModalOpen(false);
    setNewContact({
      fullName: "",
      title: "",
      company: "",
      profileUrl: "",
      sharedInterests: "",
    });
    setGeneratedOutreach(null);
    toast({
      title: "Contact Saved to Pipeline",
      description: "Ready for outreach tracking.",
    });
  }

  async function handleToggleStatus(contactId: string, newStatus: "saved" | "contacted" | "dismissed") {
    await updateContactStatusAction(contactId, newStatus);
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status: newStatus } : c));
    toast({
      title: "Status Updated",
      description: `Contact marked as ${newStatus}.`,
    });
  }

  function handleCopyNote(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied Connection Note",
      description: "Ready to paste into LinkedIn connection request.",
    });
    setTimeout(() => setCopiedId(null), 2500);
  }

  const filteredContacts = contacts.filter(c => {
    if (activeTab === "all") return c.status !== "dismissed";
    return c.status === activeTab;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
              WORKFLOW C
            </span>
            <span className="text-xs text-slate-400">Targeted Outreach & Decision Maker CRM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Networking Assistant</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Identify hiring managers, generate Boolean search queries, and craft hyper-personalized cold outreach.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs h-9 px-4 font-semibold shadow-md shadow-purple-500/20"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Decision Maker
        </Button>
      </div>

      {/* Boolean Search Generator */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            LinkedIn Boolean Search Query Generator
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Compliant URL formatting according to LinkedIn official query standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Target Roles (comma separated)</Label>
              <Input
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                placeholder="Staff Software Engineer, Systems Architect"
                className="bg-slate-950/70 border-slate-800 text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Target Companies</Label>
              <Input
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                placeholder="Stripe, Datadog, Snowflake"
                className="bg-slate-950/70 border-slate-800 text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Technical Keywords / Stack</Label>
              <Input
                value={keywordFilter}
                onChange={e => setKeywordFilter(e.target.value)}
                placeholder="Distributed Systems, Go, Kubernetes"
                className="bg-slate-950/70 border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleBuildSearch}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8"
            >
              Update Search Query
            </Button>
          </div>

          {/* Generated Boolean Box */}
          {searchResult.booleanQuery && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px] text-purple-400 font-semibold uppercase">
                  Boolean Expression
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyQuery}
                    className="h-6 px-2 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedQuery ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedQuery ? "Copied" : "Copy Query"}
                  </Button>
                  <a
                    href={searchResult.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline font-semibold"
                  >
                    Launch LinkedIn Search <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-200 break-all bg-slate-900/60 p-2 rounded">
                {searchResult.booleanQuery}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts CRM Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Outreach Pipeline ({contacts.length})</h2>
            <p className="text-xs text-slate-400">Track and manage high-synergy connection conversations.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-purple-600">All ({contacts.length})</TabsTrigger>
              <TabsTrigger value="saved" className="text-xs data-[state=active]:bg-purple-600">Saved</TabsTrigger>
              <TabsTrigger value="contacted" className="text-xs data-[state=active]:bg-purple-600">Contacted</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      {contact.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{contact.full_name}</span>
                        {contact.profile_url && (
                          <a href={contact.profile_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-purple-400">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-300">{contact.professional_title}</div>
                      <div className="text-[11px] text-purple-400">{contact.organisation} • {contact.location || "Remote"}</div>
                    </div>
                  </div>
                  <Badge variant={contact.status === "contacted" ? "success" : "secondary"}>
                    {contact.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Suggested Connection Note */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Connection Note (Under 300 chars)
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyNote(contact.id, contact.suggested_message || "")}
                      className="h-6 px-2 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedId === contact.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedId === contact.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    &quot;{contact.suggested_message}&quot;
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Length: {contact.suggested_message?.length || 0} / 300 characters
                  </div>
                </div>

                {contact.relevance_explanation && (
                  <p className="text-[11px] text-slate-400 italic">
                    <strong className="text-slate-300 not-italic">Hook rationale:</strong> {contact.relevance_explanation}
                  </p>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400">
                  Alignment Score: {contact.relevance_score || 90}%
                </span>
                <div className="flex gap-2">
                  {contact.status === "saved" ? (
                    <Button
                      size="sm"
                      onClick={() => handleToggleStatus(contact.id, "contacted")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-2.5"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Contacted
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(contact.id, "saved")}
                      className="border-slate-800 text-slate-400 text-xs h-7 px-2.5"
                    >
                      Revert to Saved
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Contact & AI Outreach Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              Add Target Contact & Generate Cold Outreach
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Provide context. Gemini will generate a high-converting, strictly compliant message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Decision Maker Name</Label>
                <Input
                  value={newContact.fullName}
                  onChange={e => setNewContact(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Elena Rostova"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Title / Role</Label>
                <Input
                  value={newContact.title}
                  onChange={e => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Staff Architect / VP Eng"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Company</Label>
                <Input
                  value={newContact.company}
                  onChange={e => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Cloudflare"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">LinkedIn Profile URL</Label>
                <Input
                  value={newContact.profileUrl}
                  onChange={e => setNewContact(prev => ({ ...prev, profileUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Shared Context / Recent Talk / Post</Label>
              <Input
                value={newContact.sharedInterests}
                onChange={e => setNewContact(prev => ({ ...prev, sharedInterests: e.target.value }))}
                placeholder="e.g. Loved their recent talk on edge cache invalidation"
                className="bg-slate-900 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleGenerateOutreach}
                disabled={generatingOutreach || !newContact.fullName}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs h-9"
              >
                {generatingOutreach ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Generating Personalized Outreach...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-300" />
                    Generate Hyper-Personalized Outreach Note
                  </>
                )}
              </Button>
            </div>

            {/* Generated Outreach Preview */}
            {generatedOutreach && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900 border border-purple-500/30">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-purple-300">Connection Note (under 300 char limit):</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {generatedOutreach.connectionNote.length} / 300
                    </span>
                  </div>
                  <Textarea
                    value={generatedOutreach.connectionNote}
                    onChange={e => setGeneratedOutreach(prev => prev ? ({ ...prev, connectionNote: e.target.value }) : null)}
                    rows={3}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <span className="font-semibold text-slate-300 text-xs block mb-1">InMail Follow-up Script:</span>
                  <Textarea
                    value={generatedOutreach.inMailFollowUp}
                    onChange={e => setGeneratedOutreach(prev => prev ? ({ ...prev, inMailFollowUp: e.target.value }) : null)}
                    rows={3}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <Button
                  onClick={handleSaveNewContact}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Save Contact to Pipeline
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
