'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { AuditLog } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  panelBg: '#0f1011',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
};

const ACTION_STYLES: Record<string, { bg: string; color: string }> = {
  created:  { bg: 'rgba(94,106,210,0.15)',   color: '#7170ff' },
  viewed:   { bg: 'rgba(255,255,255,0.05)',   color: '#8a8f98' },
  updated:  { bg: 'rgba(234,179,8,0.15)',     color: '#ca8a04' },
  rotated:  { bg: 'rgba(16,185,129,0.15)',    color: '#10b981' },
  deleted:  { bg: 'rgba(239,68,68,0.15)',     color: '#ef4444' },
};

export interface AuditLogProps {
  logs: AuditLog[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AuditLogComponent({ logs, onRefresh, isLoading = false }: AuditLogProps) {
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setLastRefreshed(Date.now());
    setElapsed(0);
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastRefreshed) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

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
            {logs.length} entries
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: C.textSubtle, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
            Refreshed {elapsed}s ago
          </span>
          <button
            onClick={() => { onRefresh(); }}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 28, paddingLeft: 10, paddingRight: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              color: C.textMuted,
              fontSize: 12, fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontFamily: "'Inter', sans-serif",
              fontFeatureSettings: '"cv01","ss03"',
              transition: 'all 150ms ease',
            }}
          >
            <motion.span
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              style={{ display: 'flex' }}
            >
              <RefreshCw size={12} />
            </motion.span>
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.borderDefault}` }}>
              {['TIME', 'ACTION', 'KEY', 'SOURCE'].map((h) => (
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px 16px', textAlign: 'center', color: C.textSubtle, fontSize: 13, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
                  No audit logs yet
                </td>
              </tr>
            ) : (
              logs.map((log, i) => {
                const style = ACTION_STYLES[log.action] || ACTION_STYLES.viewed;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      borderBottom: `1px solid ${C.borderSubtle}`,
                    }}
                  >
                    {/* TIME */}
                    <td style={{ padding: '10px 16px', fontSize: 12, color: C.textSubtle, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(log.timestamp))}
                    </td>

                    {/* ACTION */}
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 12, fontWeight: 500,
                        background: style.bg,
                        color: style.color,
                        fontFamily: "'Inter', sans-serif",
                        fontFeatureSettings: '"cv01","ss03"',
                        letterSpacing: '0.01em',
                      }}>
                        {log.action}
                      </span>
                    </td>

                    {/* KEY */}
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12, color: C.textMuted,
                        letterSpacing: '0.02em',
                      }}>
                        {log.secret_id}
                      </span>
                    </td>

                    {/* SOURCE */}
                    <td style={{ padding: '10px 16px', fontSize: 13, color: C.textMuted, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01","ss03"' }}>
                      {log.token_name || 'Dashboard'}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
