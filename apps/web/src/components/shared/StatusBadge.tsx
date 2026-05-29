'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'online' | 'offline' | 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  online: 'bg-success/10 text-success border-success/20',
  offline: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  queued: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sent: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  default: 'bg-muted text-muted-foreground border-border',
};

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, showDot = true, size = 'sm', className }: StatusBadgeProps) {
  const variant = (status.toLowerCase() as BadgeVariant) || 'default';
  const styles = variantStyles[variant] || variantStyles.default;
  const isOnline = variant === 'online' || variant === 'delivered';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium capitalize',
        styles,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            isOnline ? 'bg-current animate-pulse' : 'bg-current opacity-60'
          )}
        />
      )}
      {status}
    </span>
  );
}
