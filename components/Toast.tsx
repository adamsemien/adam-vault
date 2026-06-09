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

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;
  const borderColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#7c6af7';
  const iconColor = borderColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: '#161618',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: '320px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px' }}>
        <Icon size={15} style={{ color: iconColor, flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '13px', color: '#ededef', lineHeight: 1.5, flex: 1 }}>
          {message}
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555558',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X size={13} />
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: borderColor,
            opacity: 0.5,
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
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
      }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
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
