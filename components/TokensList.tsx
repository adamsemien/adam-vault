'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Trash2, Plus } from 'lucide-react';
import { ProjectToken } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

export interface TokensListProps {
  tokens: ProjectToken[];
  onRevoke: (token: ProjectToken) => void;
  isLoading?: boolean;
  onCreateToken?: () => void;
}

function SkeletonRow() {
  return (
    <tr>
      <td style={{ padding: '11px 20px' }}>
        <div style={{ height: 16, width: 120, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td style={{ padding: '11px 20px' }}>
        <div style={{ height: 16, width: 80, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td style={{ padding: '11px 20px' }}>
        <div style={{ height: 16, width: 100, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td style={{ padding: '11px 20px' }}>
        <div style={{ height: 16, width: 60, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td style={{ padding: '11px 20px' }}>
        <div style={{ height: 16, width: 50, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td style={{ padding: '11px 20px' }} />
    </tr>
  );
}

export function TokensList({ tokens, onRevoke, isLoading = false, onCreateToken }: TokensListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isLoading && tokens.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Key size={20} style={{ color: '#555558' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#8b8b8e', fontSize: '14px', marginBottom: 4 }}>No tokens yet</p>
          <p style={{ color: '#555558', fontSize: '12px' }}>Create a token to grant scoped API access.</p>
        </div>
        {onCreateToken && (
          <motion.button
            onClick={onCreateToken}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: 8,
              height: 32, paddingLeft: 14, paddingRight: 14,
              background: '#7c6af7',
              border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Plus size={13} />
            New Token
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['NAME', 'SCOPED TAGS', 'PREFIX', 'LAST USED', 'STATUS', ''].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '0 20px 10px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: '#555558',
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: 'nowrap',
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onHoverStart={() => setHoveredId(token.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: hoveredId === token.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.1s ease',
                    opacity: token.revoked ? 0.4 : 1,
                  }}
                >
                  {/* NAME */}
                  <td style={{ padding: '11px 20px' }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#ededef',
                      fontFamily: "'Inter', sans-serif",
                      textDecoration: token.revoked ? 'line-through' : 'none',
                    }}>
                      {token.name}
                    </span>
                  </td>

                  {/* SCOPED TAGS */}
                  <td style={{ padding: '11px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {token.allowed_tags?.length ? (
                        token.allowed_tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 8px',
                              background: 'rgba(124,106,247,0.08)',
                              color: '#a89ef5',
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: 999,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: 11, color: '#555558', fontFamily: "'Inter', sans-serif" }}>all</span>
                      )}
                    </div>
                  </td>

                  {/* PREFIX */}
                  <td style={{ padding: '11px 20px' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#8b8b8e',
                    }}>
                      {token.token_prefix}…
                    </span>
                  </td>

                  {/* LAST USED */}
                  <td style={{ padding: '11px 20px', fontSize: 11, color: '#555558', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                    {token.last_used ? formatDistanceToNow(new Date(token.last_used)) : 'never'}
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '11px 20px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                      background: token.revoked ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: token.revoked ? '#ef4444' : '#22c55e',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {token.revoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '11px 20px' }}>
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
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '4px 8px', height: 26,
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: 5,
                              color: '#ef4444',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: "'Inter', sans-serif",
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
