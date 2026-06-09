'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />
          <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 51, padding: 20,
          }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                width: '100%', maxWidth: 380,
                background: '#0f0f12',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ededef', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>
                      Delete Key
                    </h2>
                    <p style={{ fontSize: 11, color: '#555558', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
                      {keyName}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, cursor: 'pointer', color: '#8b8b8e',
                }}>
                  <X size={13} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit}>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 6,
                  }}>
                    <p style={{ fontSize: 12, color: '#fca5a5', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                      This action is permanent and cannot be undone. The secret and all its rotation history will be deleted.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', gap: 10,
                }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1, height: 36,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6, color: '#8b8b8e',
                      fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
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
                      background: '#ef4444',
                      border: 'none', borderRadius: 6,
                      color: '#fff', fontSize: 13, fontWeight: 500,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {isLoading ? 'Deleting…' : 'Delete'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
