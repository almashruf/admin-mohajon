'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Info, CheckCircle2, LogOut, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

type Variant = 'danger' | 'warning' | 'info' | 'success' | 'logout';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

const variantConfig: Record<
  Variant,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    btnVariant: 'destructive' | 'warning' | 'primary';
  }
> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    btnVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    btnVariant: 'warning',
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    btnVariant: 'primary',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    btnVariant: 'primary',
  },
  logout: {
    icon: LogOut,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    btnVariant: 'destructive',
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  loading,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && !loading && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md',
            'bg-card border border-border rounded-xl shadow-2xl p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=open]:slide-in-from-top-4'
          )}
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center mb-4',
                cfg.iconBg
              )}
            >
              <Icon className={cn('h-7 w-7', cfg.iconColor)} />
            </div>

            {/* Title */}
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>

            {/* Description */}
            {description && (
              <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}

            {/* Actions */}
            <div className="mt-6 flex w-full gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={cfg.btnVariant}
                onClick={handleConfirm}
                loading={loading}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}