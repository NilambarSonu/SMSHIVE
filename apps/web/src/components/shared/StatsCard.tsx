'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn('glass-card p-5', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 rounded bg-muted animate-shimmer" />
          <div className="h-9 w-9 rounded-lg bg-muted animate-shimmer" />
        </div>
        <div className="h-8 w-20 rounded bg-muted animate-shimmer mb-2" />
        <div className="h-3 w-32 rounded bg-muted animate-shimmer" />
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('glass-card-hover p-5 group', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold font-display tracking-tight animate-count-up">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
              isPositive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
