'use client';

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
}: SecretsListProps) {
  const filteredSecrets =
    selectedTags.length === 0
      ? secrets
      : secrets.filter((s) =>
          selectedTags.some((tag) => s.project_tags?.includes(tag))
        );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#6b6b80]">Filter:</label>
          <select
            value={selectedTags.length === 0 ? '' : selectedTags.join(',')}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange(value ? value.split(',') : []);
            }}
            className="px-3 py-1 bg-[#1a1a28] border border-[#2a2a3e] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#1a1a28] rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a28] bg-[#0a0a0f]">
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Name</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Service</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Tags</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Last Rotated</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Status</th>
              <th className="px-4 py-3 text-left text-[#6b6b80] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSecrets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#6b6b80]">
                  No secrets found
                </td>
              </tr>
            ) : (
              filteredSecrets.map((secret) => (
                <tr
                  key={secret.id}
                  className="border-b border-[#1a1a28] hover:bg-[#0e0e18]/50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <span
                      className="font-bold text-[#e2e2e8] uppercase"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {secret.name}
                    </span>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3 text-[#e2e2e8]">{secret.service}</td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {secret.project_tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-[#1a1a2e] text-[#8b8baa] text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Last Rotated */}
                  <td className="px-4 py-3 text-[#6b6b80] text-xs">
                    {secret.last_rotated
                      ? formatDistanceToNow(new Date(secret.last_rotated))
                      : 'Never'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          secret.needs_rotation ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                      />
                      <span className="text-xs text-[#e2e2e8]">
                        {secret.needs_rotation ? 'Needs Rotation' : 'OK'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onReveal(secret)}
                        className="px-2 py-1 bg-[#1a1a28] hover:bg-[#252540] text-[#e2e2e8] text-xs rounded font-medium"
                      >
                        Reveal
                      </button>
                      <button
                        onClick={() => onEdit(secret)}
                        className="px-2 py-1 bg-[#1a1a28] hover:bg-[#252540] text-[#e2e2e8] text-xs rounded font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRotate(secret)}
                        className="px-2 py-1 bg-[#1a1a28] hover:bg-[#252540] text-[#e2e2e8] text-xs rounded font-medium"
                      >
                        Rotate
                      </button>
                      <button
                        onClick={() => onDelete(secret)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs rounded font-medium border border-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
