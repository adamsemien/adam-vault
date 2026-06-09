'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Copy, Pencil, RotateCcw, Trash2, ChevronDown } from 'lucide-react';
import { Secret } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

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
      <td className="px-5 py-3">
        <div className="h-4 w-32 rounded" style={{ background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td className="px-5 py-3">
        <div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td className="px-5 py-3">
        <div className="h-4 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td className="px-5 py-3">
        <div className="h-4 w-16 rounded" style={{ background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td className="px-5 py-3">
        <div className="h-4 w-12 rounded" style={{ background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
      <td className="px-5 py-3" />
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
      : secrets.filter((s) =>
          selectedTags.some((tag) => s.project_tags?.includes(tag))
        );

  if (!isLoading && secrets.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Lock size={20} style={{ color: '#555558' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#8b8b8e', fontSize: '14px', marginBottom: 4 }}>No secrets yet</p>
          <p style={{ color: '#555558', fontSize: '12px' }}>Add your first key to get started.</p>
        </div>
        {onAddKey && (
          <motion.button
            onClick={onAddKey}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: 8,
              height: 32, paddingLeft: 14, paddingRight: 14,
              background: '#7c6af7',
              border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            Add Key
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#555558', fontFamily: "'Inter', sans-serif" }}>Filter:</span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 28, paddingLeft: 10, paddingRight: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
                color: selectedTags.length > 0 ? '#a89ef5' : '#8b8b8e',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {selectedTags.length === 0 ? 'All tags' : selectedTags.join(', ')}
              <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                    zIndex: 100,
                    background: '#161618',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    minWidth: 140,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <button
                    onClick={() => { onFilterChange([]); setFilterOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '7px 12px', fontSize: 12,
                      color: selectedTags.length === 0 ? '#ededef' : '#8b8b8e',
                      background: selectedTags.length === 0 ? 'rgba(255,255,255,0.05)' : 'none',
                      border: 'none', cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
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
                        padding: '7px 12px', fontSize: 12,
                        color: selectedTags.includes(tag) ? '#a89ef5' : '#8b8b8e',
                        background: selectedTags.includes(tag) ? 'rgba(124,106,247,0.08)' : 'none',
                        border: 'none', cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['NAME', 'SERVICE', 'TAGS', 'ROTATED', 'STATUS', ''].map((h) => (
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
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredSecrets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#555558', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                  No secrets match the selected filter
                </td>
              </tr>
            ) : (
              filteredSecrets.map((secret, i) => (
                <motion.tr
                  key={secret.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  onHoverStart={() => setHoveredId(secret.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: hoveredId === secret.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.1s ease',
                    cursor: 'default',
                  }}
                >
                  {/* NAME */}
                  <td style={{ padding: '11px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#ededef',
                      letterSpacing: '0.02em',
                    }}>
                      {secret.name}
                    </span>
                  </td>

                  {/* SERVICE */}
                  <td style={{ padding: '11px 20px', fontSize: 13, color: '#8b8b8e', fontFamily: "'Inter', sans-serif" }}>
                    {secret.service}
                  </td>

                  {/* TAGS */}
                  <td style={{ padding: '11px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {secret.project_tags?.map((tag) => (
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
                      ))}
                    </div>
                  </td>

                  {/* ROTATED */}
                  <td style={{ padding: '11px 20px', fontSize: 11, color: '#555558', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                    {secret.last_rotated
                      ? formatDistanceToNow(new Date(secret.last_rotated))
                      : 'never'}
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '11px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: secret.needs_rotation ? '#f59e0b' : '#22c55e',
                        boxShadow: secret.needs_rotation ? '0 0 6px rgba(245,158,11,0.5)' : '0 0 6px rgba(34,197,94,0.5)',
                      }} />
                      <span style={{ fontSize: 12, color: secret.needs_rotation ? '#f59e0b' : '#22c55e', fontFamily: "'Inter', sans-serif" }}>
                        {secret.needs_rotation ? 'Due' : 'OK'}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '11px 20px' }}>
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
                            { label: 'Reveal', icon: <Copy size={11} />, action: () => onReveal(secret), color: '#8b8b8e' },
                            { label: 'Edit', icon: <Pencil size={11} />, action: () => onEdit(secret), color: '#8b8b8e' },
                            { label: 'Rotate', icon: <RotateCcw size={11} />, action: () => onRotate(secret), color: '#8b8b8e' },
                            { label: 'Delete', icon: <Trash2 size={11} />, action: () => onDelete(secret), color: '#ef4444' },
                          ].map(({ label, icon, action, color }) => (
                            <button
                              key={label}
                              onClick={action}
                              title={label}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 8px', height: 26,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 5,
                                color,
                                fontSize: 11,
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.1s, border-color 0.1s',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                              }}
                            >
                              {icon}
                              {label}
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
