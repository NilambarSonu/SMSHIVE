'use client';

import { useEffect, useState } from 'react';

/**
 * Client-only Toaster wrapper that avoids React 19 hydration issues
 * with sonner v2's forwardRef export.
 * 
 * Dynamically imports and renders the Toaster only after mount,
 * preventing SSR mismatch and "Objects are not valid as a React child" errors.
 */
export function SonnerToaster() {
  const [ToasterComponent, setToasterComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('sonner').then((mod) => {
      // sonner v2 exports Toaster as { $$typeof, render } (forwardRef)
      // We need to handle both function components and forwardRef objects
      const T = mod.Toaster as any;
      if (typeof T === 'function') {
        setToasterComponent(() => T);
      } else if (T && typeof T === 'object' && 'render' in T && typeof (T as any).render === 'function') {
        // forwardRef object — wrap it so React can render it
        const renderFn = (T as any).render;
        const WrappedToaster = (props: any) => renderFn(props, null);
        WrappedToaster.displayName = 'SonnerToasterWrapped';
        setToasterComponent(() => WrappedToaster);
      }
    });
  }, []);

  if (!ToasterComponent) return null;

  return (
    <ToasterComponent
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  );
}
