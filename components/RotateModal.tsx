'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

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
                width: '100%', maxWidth: 400,
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
                    width: 32, height: 32,
                    borderRadius: 8,
                    background: 'rgba(124,106,247,0.1)',
                    border: '1px solid rgba(124,106,247,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RotateCcw size={14} style={{ color: '#a89ef5' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ededef', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>
                      Rotate Key
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
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Warning */}
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(124,106,247,0.08)',
                    border: '1px solid rgba(124,106,247,0.2)',
                    borderRadius: 6,
                  }}>
                    <p style={{ fontSize: 12, color: '#a89ef5', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                      Previous value will be stored for 30 days as a backup.
                    </p>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontSize: 11, fontWeight: 500,
                      color: '#555558', letterSpacing: '0.04em', marginBottom: 6,
                      fontFamily: "'Inter', sans-serif", textTransform: 'uppercase' as const,
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
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${focused ? 'rgba(124,106,247,0.6)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 6,
                        color: '#ededef',
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                        boxShadow: focused ? '0 0 0 3px rgba(124,106,247,0.08)' : 'none',
                      }}
                    />
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
                    disabled={isLoading || !newValue}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, height: 36,
                      background: '#7c6af7',
                      border: 'none', borderRadius: 6,
                      color: '#fff', fontSize: 13, fontWeight: 500,
                      cursor: isLoading || !newValue ? 'not-allowed' : 'pointer',
                      opacity: isLoading || !newValue ? 0.5 : 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {isLoading ? 'Rotating…' : 'Rotate Key'}
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
