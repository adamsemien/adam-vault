'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Copy, Check, X, AlertTriangle } from 'lucide-react';

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

export interface NewTokenModalProps {
  open: boolean;
  allTags: string[];
  onClose: () => void;
  onCreate: (name: string, tags: string[]) => Promise<string | null>;
  isLoading?: boolean;
}

export function NewTokenModal({ open, allTags, onClose, onCreate, isLoading = false }: NewTokenModalProps) {
  const [tokenName, setTokenName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName) return;
    const token = await onCreate(tokenName, selectedTags);
    if (token) setGeneratedToken(token);
  };

  const handleCopy = async () => {
    if (generatedToken) {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setTokenName('');
    setSelectedTags([]);
    setGeneratedToken(null);
    setTagInput('');
    setCopied(false);
    onClose();
  };

  const tagSuggestions = allTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(t)
  );

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) setSelectedTags((p) => [...p, tag]);
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => setSelectedTags((p) => p.filter((t) => t !== tag));

  const focusBorder = (f: string): React.CSSProperties => ({
    borderColor: focused === f ? 'rgba(113,112,255,0.5)' : C.borderDefault,
    boxShadow: focused === f ? '0 0 0 2px rgba(113,112,255,0.12)' : 'none',
  });

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    border: `1px solid ${C.borderDefault}`,
    borderRadius: 6, color: C.textPrimary,
    fontSize: 13, fontFamily: "'Inter', sans-serif",
    fontFeatureSettings: '"cv01","ss03"',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
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
                  style={{
                    width: '100%', maxWidth: 420,
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
                        background: 'rgba(94,106,210,0.1)',
                        border: '1px solid rgba(94,106,210,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Key size={14} style={{ color: C.brandIndigo }} />
                      </div>
                      <Dialog.Title style={{ margin: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', letterSpacing: '-0.01em' }}>
                          {generatedToken ? 'Token Created' : 'Create Token'}
                        </span>
                      </Dialog.Title>
                    </div>
                    <button onClick={handleClose} style={{
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

                  {!generatedToken ? (
                    <form onSubmit={handleCreate}>
                      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSubtle, letterSpacing: '0.05em', marginBottom: 6, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', textTransform: 'uppercase' as const }}>
                            Token Name *
                          </label>
                          <input
                            type="text"
                            value={tokenName}
                            onChange={(e) => setTokenName(e.target.value)}
                            placeholder="production-app"
                            autoFocus
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            style={{ ...inputBase, ...focusBorder('name') }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSubtle, letterSpacing: '0.05em', marginBottom: 6, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', textTransform: 'uppercase' as const }}>
                            Scope to Tags
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                              onFocus={() => { setFocused('tags'); setShowSuggestions(true); }}
                              onBlur={() => { setFocused(null); setTimeout(() => setShowSuggestions(false), 150); }}
                              placeholder="Filter by tag (leave empty for all)…"
                              style={{ ...inputBase, ...focusBorder('tags') }}
                            />
                            <AnimatePresence>
                              {showSuggestions && tagSuggestions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.1 }}
                                  style={{
                                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                    background: '#28282c',
                                    border: `1px solid ${C.borderDefault}`,
                                    borderRadius: 6, zIndex: 10,
                                    maxHeight: 120, overflowY: 'auto',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                  }}
                                >
                                  {tagSuggestions.map((tag) => (
                                    <button
                                      key={tag}
                                      type="button"
                                      onMouseDown={() => addTag(tag)}
                                      style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: '7px 12px', fontSize: 13, color: C.textPrimary,
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                        fontFeatureSettings: '"cv01","ss03"',
                                      }}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {selectedTags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                              {selectedTags.map((tag) => (
                                <span key={tag} style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  padding: '3px 8px',
                                  background: 'rgba(94,106,210,0.1)',
                                  border: '1px solid rgba(94,106,210,0.25)',
                                  borderRadius: 9999,
                                  fontSize: 12, fontWeight: 500, color: C.brandIndigo,
                                  fontFamily: "'Inter', sans-serif",
                                  fontFeatureSettings: '"cv01","ss03"',
                                }}>
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brandIndigo, display: 'flex', padding: 0 }}>
                                    <X size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.borderSubtle}`, display: 'flex', gap: 10 }}>
                        <button type="button" onClick={handleClose} style={{
                          flex: 1, height: 36,
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${C.borderDefault}`,
                          borderRadius: 6, color: C.textMuted,
                          fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                          transition: 'all 150ms ease',
                        }}>
                          Cancel
                        </button>
                        <motion.button
                          type="submit"
                          disabled={isLoading || !tokenName}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            flex: 1, height: 36,
                            background: C.brandIndigo,
                            border: 'none', borderRadius: 6,
                            color: '#fff', fontSize: 13, fontWeight: 500,
                            cursor: (isLoading || !tokenName) ? 'not-allowed' : 'pointer',
                            opacity: (isLoading || !tokenName) ? 0.5 : 1,
                            fontFamily: "'Inter', sans-serif",
                            fontFeatureSettings: '"cv01","ss03"',
                            transition: 'opacity 150ms ease',
                          }}
                        >
                          {isLoading ? 'Creating…' : 'Create Token'}
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Warning banner */}
                      <div style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'rgba(245,158,11,0.1)',
                        borderLeft: `3px solid ${C.warning}`,
                        borderRadius: 6,
                      }}>
                        <AlertTriangle size={14} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 12, color: '#fcd34d', fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', lineHeight: 1.5 }}>
                          <strong>Only shown once.</strong> Copy this token now — it will never be displayed again.
                        </p>
                      </div>

                      {/* Token display */}
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          padding: '12px 52px 12px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${C.borderDefault}`,
                          borderRadius: 6,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11, color: C.textPrimary,
                          wordBreak: 'break-all', lineHeight: 1.6,
                          userSelect: 'text',
                        }}>
                          {generatedToken}
                        </div>
                        <button
                          onClick={handleCopy}
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', height: 28,
                            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(94,106,210,0.15)',
                            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(94,106,210,0.3)'}`,
                            borderRadius: 5,
                            color: copied ? '#10b981' : C.brandIndigo,
                            fontSize: 11, fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            fontFeatureSettings: '"cv01","ss03"',
                            transition: 'all 150ms ease',
                          }}
                        >
                          {copied ? <Check size={11} /> : <Copy size={11} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <motion.button
                        onClick={handleClose}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          width: '100%', height: 36,
                          background: C.brandIndigo,
                          border: 'none', borderRadius: 6,
                          color: '#fff', fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                        }}
                      >
                        Done
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
