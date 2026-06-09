'use client';

import { ProjectToken } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

export interface TokensListProps {
  tokens: ProjectToken[];
  onRevoke: (token: ProjectToken) => void;
  isLoading?: boolean;
}

export function TokensList({ tokens, onRevoke, isLoading = false }: TokensListProps) {
  return (
    <div className="overflow-x-auto border border-[#1a1a28] rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a28] bg-[#0a0a0f]">
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Name</th>
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Scoped Tags</th>
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Token Prefix</th>
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Last Used</th>
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Revoked</th>
            <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-[#6b6b80]">
                No tokens yet
              </td>
            </tr>
          ) : (
            tokens.map((token) => (
              <tr
                key={token.id}
                className="border-b border-[#1a1a28] hover:bg-[#0e0e18]/50 transition-colors"
              >
                {/* Name */}
                <td className="px-4 py-3 text-[#e2e2e8]">{token.name}</td>

                {/* Scoped Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {token.allowed_tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 bg-[#1a1a2e] text-[#8b8baa] text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Token Prefix */}
                <td className="px-4 py-3">
                  <span
                    className="text-[#6b6b80] font-mono text-xs"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {token.token_prefix}
                  </span>
                </td>

                {/* Last Used */}
                <td className="px-4 py-3 text-[#6b6b80] text-xs">
                  {token.last_used
                    ? formatDistanceToNow(new Date(token.last_used))
                    : 'Never'}
                </td>

                {/* Revoked */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      token.revoked
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-green-500/20 text-green-200'
                    }`}
                  >
                    {token.revoked ? 'Revoked' : 'Active'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRevoke(token)}
                    disabled={token.revoked}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-200 text-xs rounded font-medium border border-red-500/30"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
