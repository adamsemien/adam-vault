'use client';

import { useState } from 'react';

export interface NewTokenModalProps {
  open: boolean;
  allTags: string[];
  onClose: () => void;
  onCreate: (name: string, tags: string[]) => Promise<string | null>;
  isLoading?: boolean;
}

export function NewTokenModal({
  open,
  allTags,
  onClose,
  onCreate,
  isLoading = false,
}: NewTokenModalProps) {
  const [tokenName, setTokenName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName) return;

    const token = await onCreate(tokenName, selectedTags);
    if (token) {
      setGeneratedToken(token);
    }
  };

  const handleCopyToken = async () => {
    if (generatedToken) {
      await navigator.clipboard.writeText(generatedToken);
    }
  };

  const handleClose = () => {
    setTokenName('');
    setSelectedTags([]);
    setGeneratedToken(null);
    setTagInput('');
    onClose();
  };

  const tagSuggestions = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-96 bg-[#0e0e18] border border-[#1a1a28] rounded shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1a1a28]">
            <h2 className="text-lg font-bold text-[#e2e2e8]">Create Token</h2>
            <button
              onClick={handleClose}
              className="text-[#6b6b80] hover:text-[#e2e2e8] text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 border-b border-[#1a1a28]">
            {!generatedToken ? (
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Token Name */}
                <div>
                  <label className="block text-sm text-[#6b6b80] mb-2">Token Name *</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="no-bad-trips production"
                    autoFocus
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm text-[#6b6b80] mb-2">Project Tags</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowTagSuggestions(true);
                      }}
                      onFocus={() => setShowTagSuggestions(true)}
                      placeholder="Type to filter tags"
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
                    />

                    {showTagSuggestions && tagSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0f] border border-[#1a1a28] rounded z-10 max-h-32 overflow-y-auto">
                        {tagSuggestions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddTag(tag)}
                            className="w-full text-left px-3 py-2 text-sm text-[#e2e2e8] hover:bg-[#1a1a28]"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-2 px-2 py-1 bg-[#1a1a2e] text-[#8b8baa] text-xs rounded"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-[#e2e2e8]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-[#1a1a28] text-[#e2e2e8] rounded text-sm font-medium hover:bg-[#252540]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !tokenName}
                    className="flex-1 px-4 py-2 bg-[#6a5acd] text-white rounded text-sm font-medium hover:bg-[#7a6add] disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p className="text-sm text-green-200">
                    This token will never be shown again. Copy now:
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    value={generatedToken}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm font-mono resize-none h-20"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="absolute top-2 right-2 px-2 py-1 bg-[#6a5acd] text-white rounded text-xs font-medium hover:bg-[#7a6add]"
                  >
                    Copy
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-[#6a5acd] text-white rounded text-sm font-medium hover:bg-[#7a6add]"
                >
                  Got It
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
