'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Trash2, Plus } from 'lucide-react';
import { ProjectToken } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  panelBg: '#0f1011',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  success: '#10b981',
  danger: '#ef4444',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
};

export interface TokensListProps {
  tokens: ProjectToken[];
  onRevoke: (token: ProjectToken) => void;
  isLoading?: boolean;
  onCreateToken?: () => void;
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 100, 90, 60, 50, 0].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderSubtle}` }}>
          {w > 0 && (
            <div style={{
              height: 13, width: w, borderRadius: 4,
              background: 'rgba(255,255,255,0.04)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }} />
          )}
        </td>
      ))}
    </tr>
  );
}

export function TokensList({ tokens, onRevoke, isLoading = false, onCreateToken }: TokensListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: `1px solid ${C.borderSubtle}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 26, paddingLeft: 10, paddingRight: 10,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
            {tokens.filter(t => !t.revoked).length} active
          </span>
        </div>

        <motion.button
          onClick={onCreateToken}
          whileHover={{ background: '#6b79e0' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 32, paddingLeft: 16, paddingRight: 16,
            background: C.brandIndigo,
            border: 'none', borderRadius: 6,
            color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontFeatureSettings: '"cv01","ss03"',
          }}
        >
          <Plus size={13} />
          New Token
        </motion.button>
      </div>

      {/* ── Empty state ── */}
      {!isLoading && tokens.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${C.borderDefault}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Key size={18} style={{ color: C.textSubtle }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: C.textSubtle, fontSize: 14, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
              No tokens yet.{' '}
              <button
                onClick={onCreateToken}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brandIndigo, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", padding: 0 }}
              >
                Create one →
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderDefault}` }}>
                {['NAME', 'SCOPED TAGS', 'PREFIX', 'LAST USED', 'STATUS', 'ACTIONS'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      color: C.textSubtle,
                      fontFamily: "'Inter', sans-serif",
                      fontFeatureSettings: '"cv01","ss03"',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                tokens.map((token, i) => (
                  <motion.tr
                    key={token.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.15 }}
                    onHoverStart={() => setHoveredId(token.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    style={{
                      borderBottom: `1px solid ${C.borderSubtle}`,
                      background: hoveredId === token.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                      transition: 'background 150ms ease',
                      opacity: token.revoked ? 0.4 : 1,
                    }}
                  >
                    {/* NAME */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 500, color: C.textPrimary,
                        fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"',
                        textDecoration: token.revoked ? 'line-through' : 'none',
                      }}>
                        {token.name}
                      </span>
                    </td>

                    {/* SCOPED TAGS */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {token.allowed_tags?.length ? (
                          token.allowed_tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: '2px 8px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: C.textMuted,
                                fontSize: 12, fontWeight: 500,
                                borderRadius: 9999,
                                fontFamily: "'Inter', sans-serif",
                                fontFeatureSettings: '"cv01","ss03"',
                              }}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: 12, color: C.textSubtle, fontFamily: "'Inter', sans-serif" }}>all</span>
                        )}
                      </div>
                    </td>

                    {/* PREFIX */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12, color: C.textMuted,
                      }}>
                        {token.token_prefix}…
                      </span>
                    </td>

                    {/* LAST USED */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSubtle, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', whiteSpace: 'nowrap' }}>
                      {token.last_used ? formatDistanceToNow(new Date(token.last_used)) : 'never'}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 9999,
                        fontSize: 12, fontWeight: 500,
                        background: token.revoked ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: token.revoked ? C.danger : C.success,
                        fontFamily: "'Inter', sans-serif",
                        fontFeatureSettings: '"cv01","ss03"',
                      }}>
                        {token.revoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '12px 16px' }}>
                      <AnimatePresence>
                        {hoveredId === token.id && !token.revoked && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <button
                              onClick={() => onRevoke(token)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px', height: 28,
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 6,
                                color: C.danger,
                                fontSize: 12, fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                fontFeatureSettings: '"cv01","ss03"',
                                transition: 'all 150ms ease',
                              }}
                            >
                              <Trash2 size={11} />
                              Revoke
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
