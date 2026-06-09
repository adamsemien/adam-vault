'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const DURATION = 4000;

function Toast({ message, type, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null as number | null);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onDismiss]);

  const borderColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#5e6ad2';
  const bgColor = type === 'success' ? 'rgba(16,185,129,0.1)' : type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(94,106,210,0.1)';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: bgColor,
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: 320,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        fontFeatureSettings: '"cv01","ss03"',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px' }}>
        <Icon size={14} style={{ color: borderColor, flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, color: '#f7f8f8', lineHeight: 1.5, flex: 1 }}>
          {message}
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#62666d', padding: 0,
            display: 'flex', alignItems: 'center', flexShrink: 0,
            transition: 'color 150ms ease',
          }}
        >
          <X size={13} />
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: borderColor,
            opacity: 0.6,
            transition: 'width 50ms linear',
          }}
        />
      </div>
    </motion.div>
  );
}

export interface ToastManagerProps {
  toasts: Array<ToastProps>;
  onDismiss: (id: string) => void;
}

export function ToastManager({ toasts, onDismiss }: ToastManagerProps) {
  // Cap at 3
  const visible = toasts.slice(-3);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
      }}
    >
      <AnimatePresence mode="sync">
        {visible.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
