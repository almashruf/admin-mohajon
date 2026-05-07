'use client';

import { Toaster, toast } from 'sonner';
import { useTheme } from 'next-themes';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        theme={(theme as 'light' | 'dark' | 'system') ?? 'system'}
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
          },
        }}
      />
    </>
  );
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const show = (message: string, type: ToastType = 'info') => {
    const opts = { duration: 3500 };
    switch (type) {
      case 'success':
        toast.success(message, { ...opts, icon: <CheckCircle2 className="h-4 w-4" /> });
        break;
      case 'error':
        toast.error(message, { ...opts, icon: <AlertCircle className="h-4 w-4" /> });
        break;
      case 'warning':
        toast.warning(message, opts);
        break;
      default:
        toast(message, { ...opts, icon: <Info className="h-4 w-4" /> });
    }
  };
  return { show };
}