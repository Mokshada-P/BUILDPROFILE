import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AlertCircle, Key, Sparkles, ExternalLink } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Persistent Left Sidebar Navigation */}
      <DashboardNav user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Notification Bar if Gemini Key is missing */}
        {!hasGeminiKey && (
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Gemini API Key Notice:</strong> <code className="bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> is not detected in your environment. The system will activate realistic high-fidelity heuristic simulation for audit & generation until configured in <code className="bg-amber-900/40 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline font-semibold shrink-0 ml-4"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
