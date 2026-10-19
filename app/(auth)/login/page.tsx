"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { signIn, startDemoSession } from "@/app/auth/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo);

    try {
      const res = await signIn(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      // In Next.js, redirect() throws an internal error that gets handled
    }
  }

  async function handleDemo() {
    setDemoLoading(true);
    await startDemoSession("Professional");
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold text-white">Sign In</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your email credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Work or Personal Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex.chen@techcorp.com"
              required
              className="bg-slate-950/60 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              className="bg-slate-950/60 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-600"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 h-10 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to BuildProfile"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Fast Evaluation</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={loading || demoLoading}
          onClick={handleDemo}
          className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-white text-slate-300 h-10"
        >
          <UserCheck className="w-4 h-4 mr-2 text-indigo-400" />
          {demoLoading ? "Starting Sandbox..." : "Instant Demo Sandbox Login"}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 text-center border-t border-slate-800/60 pt-4">
        <p className="text-xs text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
            Create an account
          </Link>
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Protected by Supabase Auth & Row Level Security
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              BuildProfile
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
              AI
            </span>
          </Link>
          <p className="text-sm text-slate-400 mt-2">
            Elevate your LinkedIn authority & executive presence
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 text-xs py-8">Loading sign-in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
