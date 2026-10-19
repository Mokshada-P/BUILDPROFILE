"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("BuildProfile Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error.message || "An unexpected error occurred while executing this operation. If using external APIs, check your network connection and GEMINI_API_KEY."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 text-xs h-9"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
