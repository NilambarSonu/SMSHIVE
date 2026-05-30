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
  variant?: 'blue' | 'emerald' | 'purple' | 'amber' | 'violet' | 'teal';
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  loading = false,
  variant,
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

  const variantClasses = {
    blue: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400 group-hover:bg-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400 group-hover:bg-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400 group-hover:bg-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400 group-hover:bg-amber-500/20',
    violet: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400 group-hover:bg-indigo-500/20',
    teal: 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/15 dark:text-teal-400 group-hover:bg-teal-500/20',
  };

  const selectedVariant = variant ? variantClasses[variant] : 'bg-primary/10 text-primary group-hover:bg-primary/20';

  return (
    <div className={cn('glass-card-hover p-5 group', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', selectedVariant)}>
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
