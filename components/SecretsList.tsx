'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import { Secret } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  pageBg: '#08090a',
  panelBg: '#0f1011',
  surface: '#191a1b',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export interface SecretsListProps {
  secrets: Secret[];
  selectedTags: string[];
  allTags: string[];
  onEdit: (secret: Secret) => void;
  onReveal: (secret: Secret) => void;
  onRotate: (secret: Secret) => void;
  onDelete: (secret: Secret) => void;
  onFilterChange: (tags: string[]) => void;
  isLoading?: boolean;
  onAddKey?: () => void;
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 80, 100, 60, 60, 0].map((w, i) => (
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

export function SecretsList({
  secrets,
  selectedTags,
  allTags,
  onEdit,
  onReveal,
  onRotate,
  onDelete,
  onFilterChange,
  isLoading = false,
  onAddKey,
}: SecretsListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredSecrets =
    selectedTags.length === 0
      ? secrets
      : secrets.filter((s) => selectedTags.some((tag) => s.project_tags?.includes(tag)));

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: `1px solid ${C.borderSubtle}`,
      }}>
        {/* Left: count badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 26, paddingLeft: 10, paddingRight: 10,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
            {secrets.length} key{secrets.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right: filter + add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Filter dropdown */}
          {allTags.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, paddingLeft: 10, paddingRight: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 6,
                  color: selectedTags.length > 0 ? C.brandIndigo : C.textMuted,
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontFeatureSettings: '"cv01","ss03"',
                  transition: 'all 150ms ease',
                }}
              >
                {selectedTags.length === 0 ? 'Filter by tag' : selectedTags.join(', ')}
                <ChevronDown size={12} style={{ color: C.textSubtle }} />
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                      zIndex: 100,
                      background: '#191a1b',
                      border: `1px solid ${C.borderDefault}`,
                      borderRadius: 8,
                      minWidth: 160,
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                  >
                    <button
                      onClick={() => { onFilterChange([]); setFilterOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', fontSize: 13,
                        color: selectedTags.length === 0 ? C.textPrimary : C.textMuted,
                        background: selectedTags.length === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        fontFeatureSettings: '"cv01","ss03"',
                      }}
                    >
                      All tags
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { onFilterChange([tag]); setFilterOpen(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '8px 12px', fontSize: 13,
                          color: selectedTags.includes(tag) ? C.brandIndigo : C.textMuted,
                          background: selectedTags.includes(tag) ? 'rgba(94,106,210,0.1)' : 'transparent',
                          border: 'none', cursor: 'pointer',
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
          )}

          {/* Add Key primary button */}
          <motion.button
            onClick={onAddKey}
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
            Add Key
          </motion.button>
        </div>
      </div>

      {/* ── Table ── */}
      {!isLoading && secrets.length === 0 ? (
        /* Empty state */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: C.textSubtle, fontSize: 14, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
              No secrets yet. Add your first key{' '}
              <button
                onClick={onAddKey}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.brandIndigo, fontSize: 14, fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  padding: 0,
                }}
              >
                →
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderDefault}` }}>
                {['NAME', 'SERVICE', 'TAGS', 'ROTATED', 'STATUS', 'ACTIONS'].map((h) => (
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
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredSecrets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: C.textSubtle, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                    No secrets match the selected filter
                  </td>
                </tr>
              ) : (
                filteredSecrets.map((secret, i) => (
                  <motion.tr
                    key={secret.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.15 }}
                    onHoverStart={() => setHoveredId(secret.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    style={{
                      borderBottom: `1px solid ${C.borderSubtle}`,
                      background: hoveredId === secret.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                      transition: 'background 150ms ease',
                      cursor: 'default',
                    }}
                  >
                    {/* NAME */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.textPrimary,
                      }}>
                        {secret.name}
                      </span>
                    </td>

                    {/* SERVICE */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textMuted, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
                      {secret.service}
                    </td>

                    {/* TAGS */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {secret.project_tags?.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 8px',
                              background: 'transparent',
                              border: `1px solid rgba(255,255,255,0.05)`,
                              color: C.textMuted,
                              fontSize: 12,
                              fontWeight: 500,
                              borderRadius: 9999,
                              fontFamily: "'Inter', sans-serif",
                              fontFeatureSettings: '"cv01","ss03"',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* ROTATED */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSubtle, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"', whiteSpace: 'nowrap' }}>
                      {secret.last_rotated
                        ? formatDistanceToNow(new Date(secret.last_rotated))
                        : 'never'}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: secret.needs_rotation ? C.warning : C.success,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: 13,
                          color: secret.needs_rotation ? C.warning : C.success,
                          fontFamily: "'Inter', sans-serif",
                          fontFeatureSettings: '"cv01","ss03"',
                          fontWeight: 500,
                        }}>
                          {secret.needs_rotation ? 'Needs Rotation' : 'OK'}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '12px 16px' }}>
                      <AnimatePresence>
                        {hoveredId === secret.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                          >
                            {[
                              { label: 'View', icon: <Eye size={13} />, action: () => onReveal(secret), danger: false },
                              { label: 'Edit', icon: <Pencil size={13} />, action: () => onEdit(secret), danger: false },
                              { label: 'Rotate', icon: <RefreshCw size={13} />, action: () => onRotate(secret), danger: false },
                              { label: 'Delete', icon: <Trash2 size={13} />, action: () => onDelete(secret), danger: true },
                            ].map(({ label, icon, action, danger }) => (
                              <button
                                key={label}
                                onClick={action}
                                title={label}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 28, height: 28,
                                  background: 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${C.borderDefault}`,
                                  borderRadius: 6,
                                  color: danger ? C.danger : C.textMuted,
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLButtonElement).style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.08)';
                                  (e.currentTarget as HTMLButtonElement).style.color = danger ? C.danger : C.textPrimary;
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                                  (e.currentTarget as HTMLButtonElement).style.color = danger ? C.danger : C.textMuted;
                                }}
                              >
                                {icon}
                              </button>
                            ))}
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
