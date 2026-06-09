'use client';

import { useState } from 'react';

export interface RotateModalProps {
  open: boolean;
  keyName: string;
  onClose: () => void;
  onConfirm: (newValue: string) => Promise<void>;
  isLoading?: boolean;
}

export function RotateModal({
  open,
  keyName,
  onClose,
  onConfirm,
  isLoading = false,
}: RotateModalProps) {
  const [newValue, setNewValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue) return;
    await onConfirm(newValue);
    setNewValue('');
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-96 bg-[#0e0e18] border border-[#1a1a28] rounded shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1a1a28]">
            <h2 className="text-lg font-bold text-[#e2e2e8]" style={{ fontFamily: 'monospace' }}>
              Rotate {keyName}
            </h2>
            <button
              onClick={onClose}
              className="text-[#6b6b80] hover:text-[#e2e2e8] text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 border-b border-[#1a1a28]">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 mb-4">
              <p className="text-sm text-amber-200">
                Previous value will be stored for 30 days
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6b6b80] mb-2">New Value *</label>
                <input
                  type="password"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="sk-..."
                  autoFocus
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#1a1a28] text-[#e2e2e8] rounded text-sm font-medium hover:bg-[#252540]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newValue}
                  className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-200 rounded text-sm font-medium hover:bg-amber-500/30 disabled:opacity-50 border border-amber-500/30"
                >
                  {isLoading ? 'Rotating...' : 'Rotate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
