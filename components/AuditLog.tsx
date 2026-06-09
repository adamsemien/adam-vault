'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { AuditLog } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

export interface AuditLogProps {
  logs: AuditLog[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const ACTION_STYLES: Record<string, { bg: string; color: string }> = {
  created: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
  viewed: { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af' },
  rotated: { bg: 'rgba(124,106,247,0.1)', color: '#a89ef5' },
  updated: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  deleted: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export function AuditLogComponent({ logs, onRefresh, isLoading = false }: AuditLogProps) {
  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#555558', fontFamily: "'Inter', sans-serif" }}>
          Last 50 entries
        </span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 28, paddingLeft: 10, paddingRight: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            color: '#8b8b8e',
            fontSize: 12,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            fontFamily: "'Inter', sans-serif",
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

      {/* Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['TIMESTAMP', 'ACTION', 'KEY', 'SOURCE', 'NOTE'].map((h) => (
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#555558', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
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
                      borderBottom: 'none',
                      paddingBottom: 2,
                    }}
                  >
                    {/* TIMESTAMP */}
                    <td style={{ padding: '8px 20px', fontSize: 11, color: '#555558', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      {formatDistanceToNow(new Date(log.timestamp))}
                    </td>

                    {/* ACTION */}
                    <td style={{ padding: '8px 20px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 500,
                        background: style.bg,
                        color: style.color,
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.01em',
                      }}>
                        {log.action}
                      </span>
                    </td>

                    {/* KEY */}
                    <td style={{ padding: '8px 20px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: '#8b8b8e',
                        letterSpacing: '0.02em',
                      }}>
                        {log.secret_id}
                      </span>
                    </td>

                    {/* SOURCE */}
                    <td style={{ padding: '8px 20px', fontSize: 12, color: '#8b8b8e', fontFamily: "'Inter', sans-serif" }}>
                      {log.token_name || 'Dashboard'}
                    </td>

                    {/* NOTE */}
                    <td style={{ padding: '8px 20px', fontSize: 12, color: '#555558', fontFamily: "'Inter', sans-serif" }}>
                      {log.note || '—'}
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
