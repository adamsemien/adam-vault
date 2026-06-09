'use client';

export interface DeleteModalProps {
  open: boolean;
  keyName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteModal({
  open,
  keyName,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
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
            <h2 className="text-lg font-bold text-[#e2e2e8]">Delete {keyName}?</h2>
            <button
              onClick={onClose}
              className="text-[#6b6b80] hover:text-[#e2e2e8] text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 border-b border-[#1a1a28]">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-4">
              <p className="text-sm text-red-200">This action cannot be undone</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#1a1a28] text-[#e2e2e8] rounded text-sm font-medium hover:bg-[#252540]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-200 rounded text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 border border-red-500/30"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
