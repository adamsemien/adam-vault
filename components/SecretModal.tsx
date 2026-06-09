'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  color: '#ededef',
  fontSize: 13,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: '#555558',
  letterSpacing: '0.04em',
  marginBottom: 6,
  fontFamily: "'Inter', sans-serif",
  textTransform: 'uppercase' as const,
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      setFormData({ name: '', service: '', value: '', description: '', project_tags: [] });
    }
    setTagInput('');
    setShowSuggestions(false);
  }, [open, editingSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.service || !formData.value) return;
    await onSave(formData);
  };

  const tagSuggestions = allTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !formData.project_tags.includes(t)
  );

  const addTag = (tag: string) => {
    if (!formData.project_tags.includes(tag)) {
      setFormData((p) => ({ ...p, project_tags: [...p.project_tags, tag] }));
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setFormData((p) => ({ ...p, project_tags: p.project_tags.filter((t) => t !== tag) }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setFormData((p) => ({ ...p, name: upper }));
  };

  const getFocusBorder = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? 'rgba(124,106,247,0.6)' : 'rgba(255,255,255,0.08)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(124,106,247,0.08)' : 'none',
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{
              position: 'fixed', right: 0, top: 0,
              height: '100vh', width: 400,
              background: '#0f0f12',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              zIndex: 50,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <p style={{ fontSize: 10, color: '#555558', letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif", marginBottom: 3, textTransform: 'uppercase' }}>
                  {editingSecret ? 'Edit Secret' : 'Add Secret'}
                </p>
                <h2 style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#ededef',
                  letterSpacing: '-0.01em',
                }}>
                  {editingSecret ? editingSecret.name : 'New Key'}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: '#8b8b8e',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>

                {/* Key Name */}
                <div>
                  <label style={labelStyle}>Key Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="ANTHROPIC_API_KEY"
                    disabled={!!editingSecret}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...getFocusBorder('name'),
                      fontFamily: "'JetBrains Mono', monospace",
                      opacity: editingSecret ? 0.5 : 1,
                    }}
                  />
                </div>

                {/* Service */}
                <div>
                  <label style={labelStyle}>Service *</label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
                    placeholder="Anthropic"
                    onFocus={() => setFocusedField('service')}
                    onBlur={() => setFocusedField(null)}
                    style={getFocusBorder('service')}
                  />
                </div>

                {/* Value */}
                <div>
                  <label style={labelStyle}>{editingSecret ? 'New Value' : 'Value'} *</label>
                  <input
                    type="password"
                    value={formData.value}
                    onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                    placeholder="sk-..."
                    onFocus={() => setFocusedField('value')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...getFocusBorder('value'),
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={3}
                    onFocus={() => setFocusedField('desc')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...getFocusBorder('desc'),
                      resize: 'none',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label style={labelStyle}>Project Tags</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => { setFocusedField('tags'); setShowSuggestions(true); }}
                      onBlur={() => { setFocusedField(null); setTimeout(() => setShowSuggestions(false), 150); }}
                      placeholder="Type to add tag…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); if (tagInput) addTag(tagInput); }
                      }}
                      style={{
                        ...getFocusBorder('tags'),
                        paddingRight: tagInput ? 36 : 12,
                      }}
                    />
                    {tagInput && (
                      <button
                        type="button"
                        onMouseDown={() => addTag(tagInput)}
                        style={{
                          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(124,106,247,0.15)',
                          border: 'none', borderRadius: 4,
                          color: '#a89ef5', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', padding: '2px 6px',
                          fontSize: 11,
                        }}
                      >
                        <Plus size={11} style={{ marginRight: 2 }} />
                        add
                      </button>
                    )}

                    <AnimatePresence>
                      {showSuggestions && (tagSuggestions.length > 0 || (tagInput && !allTags.includes(tagInput))) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          style={{
                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                            background: '#161618',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6,
                            zIndex: 10,
                            maxHeight: 120,
                            overflowY: 'auto',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          }}
                        >
                          {tagSuggestions.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onMouseDown={() => addTag(tag)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '7px 12px',
                                fontSize: 12, color: '#ededef',
                                background: 'none', border: 'none',
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                          {tagInput && !allTags.includes(tagInput) && (
                            <button
                              type="button"
                              onMouseDown={() => addTag(tagInput)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '7px 12px',
                                fontSize: 12, color: '#a89ef5',
                                background: 'none', border: 'none',
                                borderTop: tagSuggestions.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              + Create &ldquo;{tagInput}&rdquo;
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected tags */}
                  {formData.project_tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {formData.project_tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 8px',
                            background: 'rgba(124,106,247,0.1)',
                            border: '1px solid rgba(124,106,247,0.2)',
                            borderRadius: 999,
                            fontSize: 11, color: '#a89ef5',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            style={{
                              background: 'none', border: 'none',
                              cursor: 'pointer', color: '#7c6af7',
                              display: 'flex', alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 10, flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    height: 36,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    color: '#8b8b8e',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.service || !formData.value}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    height: 36,
                    background: '#7c6af7',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !formData.name || !formData.service || !formData.value) ? 0.5 : 1,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {isLoading ? 'Saving…' : editingSecret ? 'Save Changes' : 'Add Key'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
