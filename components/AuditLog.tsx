'use client';

import { AuditLog } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

export interface AuditLogProps {
  logs: AuditLog[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const actionColors: Record<string, { bg: string; text: string }> = {
  created: { bg: 'bg-blue-500/20', text: 'text-blue-200' },
  updated: { bg: 'bg-orange-500/20', text: 'text-orange-200' },
  rotated: { bg: 'bg-purple-500/20', text: 'text-purple-200' },
  viewed: { bg: 'bg-gray-500/20', text: 'text-gray-200' },
  deleted: { bg: 'bg-red-500/20', text: 'text-red-200' },
};

export function AuditLogComponent({
  logs,
  onRefresh,
  isLoading = false,
}: AuditLogProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-[#6b6b80]">Last 50 entries</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1 bg-[#1a1a28] hover:bg-[#252540] text-[#e2e2e8] text-sm rounded font-medium disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#1a1a28] rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a28] bg-[#0a0a0f]">
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Action</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Key Name</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Source</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6b6b80]">
                  No audit logs yet
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const colors = actionColors[log.action] || {
                  bg: 'bg-gray-500/20',
                  text: 'text-gray-200',
                };
                return (
                  <tr
                    key={log.id}
                    className="border-b border-[#1a1a28] hover:bg-[#0e0e18]/50 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3 text-[#6b6b80] text-xs">
                      {formatDistanceToNow(new Date(log.timestamp))}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Key Name */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[#e2e2e8] font-mono uppercase text-xs"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {log.secret_id}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-[#e2e2e8] text-xs">
                      {log.token_name || 'Dashboard'}
                    </td>

                    {/* Note */}
                    <td className="px-4 py-3 text-[#6b6b80] text-xs">{log.note || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
