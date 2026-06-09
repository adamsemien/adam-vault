'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  surface: '#191a1b',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  danger: '#ef4444',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
};

export interface DeleteModalProps {
  open: boolean;
  keyName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteModal({ open, keyName, onClose, onConfirm, isLoading = false }: DeleteModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
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
                  className="av-modal-content"
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
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Trash2 size={14} style={{ color: C.danger }} />
                      </div>
                      <div>
                        <Dialog.Title style={{ margin: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', letterSpacing: '-0.01em' }}>
                            Delete Key
                          </span>
                        </Dialog.Title>
                        <p style={{ fontSize: 11, color: C.textSubtle, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                          {keyName}
                        </p>
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
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'rgba(239,68,68,0.08)',
                        borderLeft: `3px solid ${C.danger}`,
                        borderRadius: 6,
                      }}>
                        <AlertTriangle size={14} style={{ color: C.danger, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 12, color: '#fca5a5', fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', lineHeight: 1.5 }}>
                          <strong>This cannot be undone.</strong> The secret and all its rotation history will be permanently deleted.
                        </p>
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
                        disabled={isLoading}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          flex: 1, height: 36,
                          background: C.danger,
                          border: 'none', borderRadius: 6,
                          color: '#fff', fontSize: 13, fontWeight: 500,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.6 : 1,
                          fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                          transition: 'opacity 150ms ease',
                        }}
                      >
                        {isLoading ? 'Deleting…' : 'Delete'}
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
