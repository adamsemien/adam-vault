'use client';

import { useEffect, useRef } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const toastColors = {
  success: 'bg-green-500/90 text-white',
  error: 'bg-red-500/90 text-white',
  info: 'bg-blue-500/90 text-white',
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onDismiss]);

  return (
    <div
      className={`${toastColors[type]} px-4 py-3 rounded border border-white/20 font-sans text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200`}
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {message}
    </div>
  );
}

export interface ToastManagerProps {
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}

export function ToastManager({ toasts, onDismiss }: ToastManagerProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
