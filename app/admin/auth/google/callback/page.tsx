'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const oauthError = params.get('error');
    const code = params.get('code');

    if (oauthError) {
      setError(`Google sign-in cancelled: ${oauthError}`);
      return;
    }

    if (!code) {
      // Backend handles the actual exchange and sets cookie itself, then redirects.
      // If we somehow land here without a code, just send back.
      setError('Missing authorization code from Google');
      return;
    }

    // Backend handles redirect, but if landed here directly, push to dashboard
    router.replace('/admin');
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg text-center">
        {error ? (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign-in failed</h2>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.replace('/admin/login')}>
              Back to Login
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Signing you in...</h2>
            <p className="text-sm text-muted-foreground mb-5">Verifying your Google account</p>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}