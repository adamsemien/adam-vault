'use client';

import { useEffect, useRef, useState } from 'react';
import { Secret } from '@/types';

export interface SecretModalProps {
  open: boolean;
  editingSecret?: Secret;
  allTags: string[];
  onClose: () => void;
  onSave: (data: SecretFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface SecretFormData {
  name: string;
  service: string;
  value: string;
  description: string;
  project_tags: string[];
}

export function SecretModal({
  open,
  editingSecret,
  allTags,
  onClose,
  onSave,
  isLoading = false,
}: SecretModalProps) {
  const [formData, setFormData] = useState<SecretFormData>({
    name: '',
    service: '',
    value: '',
    description: '',
    project_tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingSecret) {
      setFormData({
        name: editingSecret.name,
        service: editingSecret.service,
        value: '',
        description: editingSecret.description || '',
        project_tags: editingSecret.project_tags || [],
      });
    } else {
      setFormData({
        name: '',
        service: '',
        value: '',
        description: '',
        project_tags: [],
      });
    }
    setTagInput('');
  }, [open, editingSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.service || !formData.value) {
      alert('Please fill in all required fields');
      return;
    }
    await onSave(formData);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '');
    setFormData((prev) => ({ ...prev, name: upper }));
  };

  const tagSuggestions = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.project_tags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (!formData.project_tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        project_tags: [...prev.project_tags, tag],
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleCreateTag = () => {
    if (tagInput && !formData.project_tags.includes(tagInput)) {
      setFormData((prev) => ({
        ...prev,
        project_tags: [...prev.project_tags, tagInput],
      }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      project_tags: prev.project_tags.filter((t) => t !== tag),
    }));
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      <div
        ref={modalRef}
        className="fixed right-0 top-0 h-screen w-96 bg-[#0e0e18] border-l border-[#1a1a28] shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#1a1a28]">
          <h2 className="text-lg font-bold text-[#e2e2e8]" style={{ fontFamily: 'monospace' }}>
            {editingSecret ? `Edit ${editingSecret.name}` : 'Add Key'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b6b80] hover:text-[#e2e2e8] text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Key Name */}
            <div>
              <label className="block text-sm text-[#6b6b80] mb-2">Key Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="ANTHROPIC_API_KEY"
                disabled={!!editingSecret}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd] disabled:opacity-50"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm text-[#6b6b80] mb-2">Service *</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                placeholder="Anthropic"
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm text-[#6b6b80] mb-2">
                {editingSecret ? 'New Value' : 'Value'} *
              </label>
              <input
                type="password"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-[#6b6b80] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description"
                rows={3}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd] resize-none"
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
                  placeholder="Type or create tag"
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1a1a28] rounded text-[#e2e2e8] text-sm focus:outline-none focus:border-[#6a5acd]"
                />

                {showTagSuggestions && (tagSuggestions.length > 0 || tagInput) && (
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
                    {tagInput && !allTags.includes(tagInput) && (
                      <button
                        type="button"
                        onClick={handleCreateTag}
                        className="w-full text-left px-3 py-2 text-sm text-[#6a5acd] hover:bg-[#1a1a28] border-t border-[#1a1a28]"
                      >
                        + Create "{tagInput}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.project_tags.map((tag) => (
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

            {editingSecret && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsRotation"
                  disabled
                  checked={editingSecret.needs_rotation}
                  className="w-4 h-4"
                />
                <label htmlFor="needsRotation" className="text-sm text-[#6b6b80]">
                  Needs Rotation
                </label>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex-shrink-0 flex gap-3 mt-6 pt-6 border-t border-[#1a1a28]">
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
              className="flex-1 px-4 py-2 bg-[#6a5acd] text-white rounded text-sm font-medium hover:bg-[#7a6add] disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
