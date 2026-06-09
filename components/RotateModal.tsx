'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  surface: '#191a1b',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  warning: '#f59e0b',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
};

export interface RotateModalProps {
  open: boolean;
  keyName: string;
  onClose: () => void;
  onConfirm: (newValue: string) => Promise<void>;
  isLoading?: boolean;
}

export function RotateModal({ open, keyName, onClose, onConfirm, isLoading = false }: RotateModalProps) {
  const [newValue, setNewValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue) return;
    await onConfirm(newValue);
    setNewValue('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 50,
                }}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <div style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 51, padding: 20,
              }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 4 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="av-modal-content-lg"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 12,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${C.borderSubtle}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <RefreshCw size={14} style={{ color: '#10b981' }} />
                      </div>
                      <div>
                        <Dialog.Title style={{ margin: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', letterSpacing: '-0.01em' }}>
                            Rotate {keyName}
                          </span>
                        </Dialog.Title>
                      </div>
                    </div>
                    <button onClick={onClose} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${C.borderDefault}`,
                      borderRadius: 6, cursor: 'pointer', color: C.textMuted,
                      transition: 'all 150ms ease',
                    }}>
                      <X size={13} />
                    </button>
                  </div>

                  {/* Body */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Warning */}
                      <div style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'rgba(245,158,11,0.1)',
                        borderLeft: `3px solid ${C.warning}`,
                        borderRadius: 6,
                      }}>
                        <AlertTriangle size={14} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 12, color: '#fcd34d', fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', lineHeight: 1.5 }}>
                          Previous value will be stored for 30 days as a backup.
                        </p>
                      </div>

                      <div>
                        <label style={{
                          display: 'block', fontSize: 11, fontWeight: 600,
                          color: C.textSubtle, letterSpacing: '0.05em', marginBottom: 6,
                          fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"',
                          textTransform: 'uppercase' as const,
                        }}>
                          New Value *
                        </label>
                        <input
                          type="password"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="sk-..."
                          autoFocus
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          style={{
                            width: '100%', padding: '8px 12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${focused ? 'rgba(113,112,255,0.5)' : C.borderDefault}`,
                            borderRadius: 6, color: C.textPrimary,
                            fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                            outline: 'none',
                            boxShadow: focused ? '0 0 0 2px rgba(113,112,255,0.12)' : 'none',
                            transition: 'border-color 150ms ease, box-shadow 150ms ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: '16px 24px',
                      borderTop: `1px solid ${C.borderSubtle}`,
                      display: 'flex', gap: 10,
                    }}>
                      <button
                        type="button"
                        onClick={onClose}
                        style={{
                          flex: 1, height: 36,
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${C.borderDefault}`,
                          borderRadius: 6, color: C.textMuted,
                          fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                          transition: 'all 150ms ease',
                        }}
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={isLoading || !newValue}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          flex: 1, height: 36,
                          background: C.brandIndigo,
                          border: 'none', borderRadius: 6,
                          color: '#fff', fontSize: 13, fontWeight: 500,
                          cursor: (isLoading || !newValue) ? 'not-allowed' : 'pointer',
                          opacity: (isLoading || !newValue) ? 0.5 : 1,
                          fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                          transition: 'opacity 150ms ease',
                        }}
                      >
                        {isLoading ? 'Rotating…' : 'Rotate Key'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
