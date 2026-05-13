'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { adminAuth } from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';

function LoginInner() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlError = params.get('error');
    if (urlError) setError(urlError);
  }, [params]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAuth.googleUrl();
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Could not get Google sign-in URL');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to start Google sign-in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* LEFT: Brand panel */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">HMS Admin</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium">All systems operational</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Manage your <br />
            <span className="text-white/70">healthcare platform</span> <br />
            with confidence.
          </h1>
          <p className="text-white/80 text-base lg:text-lg leading-relaxed">
            Full control over organizations, packages, and onboarding —
            all in one elegant control panel.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            <Stat label="Organizations" value="120+" />
            <Stat label="Active" value="98%" />
            <Stat label="Uptime" value="99.9%" />
          </div>
        </div>

        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} HMS Admin. All rights reserved.
        </div>
      </div>

      {/* RIGHT: Sign in form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Sign in to your account
            </h2>
            <p className="text-muted-foreground">
              Use your authorized Google admin account to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-md bg-destructive/10 border border-destructive/30 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.8 35.3 44 30 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </>
            )}
          </button>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border flex gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Restricted access</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Only pre-authorized admin email addresses can sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/70 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}