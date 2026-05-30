import { cn } from '@/lib/utils';
import React from 'react';

interface EmptyStateProps {
  icon: any; // Using any briefly to handle both Lucide component and ReactNode
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel, 
  onAction, 
  className 
}: EmptyStateProps) {
  // Determine how to render the icon
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If it's already a React element (e.g., <Key size={24} />)
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    // If it's a component (function or object with render/$$typeof, e.g., Lucide component)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && (Icon as any).$$typeof)) {
      const IconComponent = Icon as any;
      return <IconComponent size={32} />;
    }
    
    // Fallback: render as is
    return Icon;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      
      {action || (actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {actionLabel}
        </button>
      ))}
    </div>
  );
}
