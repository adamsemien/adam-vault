'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from 'vaul';
import { X, Plus } from 'lucide-react';
import { Secret } from '@/types';
import { useIsMobile } from '@/lib/use-mobile';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  panelBg: '#0f1011',
  surface: '#191a1b',
  textPrimary: '#f7f8f8',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
};

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

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  color: '#f7f8f8',
  fontSize: 13,
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: '"cv01","ss03"',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
};

const monoInputBase: React.CSSProperties = {
  ...inputBase,
  fontFamily: "'JetBrains Mono', monospace",
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#62666d',
  letterSpacing: '0.05em',
  marginBottom: 6,
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: '"cv01","ss03"',
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
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<SecretFormData>({
    name: '', service: '', value: '', description: '', project_tags: [],
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

  const focused = (field: string): React.CSSProperties => ({
    borderColor: focusedField === field ? 'rgba(113,112,255,0.5)' : 'rgba(255,255,255,0.08)',
    boxShadow: focusedField === field ? '0 0 0 2px rgba(113,112,255,0.12)' : 'none',
  });

  // ─── Form content (shared between desktop panel and mobile drawer) ──────────
  const formContent = (
    <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

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
              ...monoInputBase,
              ...focused('name'),
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
            style={{ ...inputBase, ...focused('service') }}
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
            style={{ ...monoInputBase, ...focused('value') }}
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
              ...inputBase,
              ...focused('desc'),
              resize: 'none',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags</label>
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
              style={{ ...inputBase, ...focused('tags'), paddingRight: tagInput ? 40 : 12 }}
            />
            {tagInput && (
              <button
                type="button"
                onMouseDown={() => addTag(tagInput)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(94,106,210,0.15)',
                  border: 'none', borderRadius: 4,
                  color: C.brandIndigo, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: '2px 6px',
                  fontSize: 11, fontWeight: 500,
                }}
              >
                <Plus size={10} style={{ marginRight: 2 }} />
                add
              </button>
            )}

            <AnimatePresence>
              {showSuggestions && (tagSuggestions.length > 0 || (tagInput && !allTags.includes(tagInput))) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: C.surface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 6, zIndex: 10,
                    maxHeight: 120, overflowY: 'auto',
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
                        padding: '7px 12px', fontSize: 13, color: C.textPrimary,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        fontFeatureSettings: '"cv01","ss03"',
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
                        padding: '7px 12px', fontSize: 13, color: C.brandIndigo,
                        background: 'transparent', border: 'none',
                        borderTop: tagSuggestions.length > 0 ? `1px solid ${C.borderSubtle}` : 'none',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        fontFeatureSettings: '"cv01","ss03"',
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
                    background: 'rgba(94,106,210,0.1)',
                    border: '1px solid rgba(94,106,210,0.25)',
                    borderRadius: 9999,
                    fontSize: 12, fontWeight: 500, color: C.brandIndigo,
                    fontFamily: "'Inter', sans-serif",
                    fontFeatureSettings: '"cv01","ss03"',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: C.brandIndigo,
                      display: 'flex', alignItems: 'center', padding: 0,
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
        borderTop: `1px solid ${C.borderSubtle}`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1, height: 36,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6, color: C.textMuted,
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            fontFeatureSettings: '"cv01","ss03"',
            transition: 'all 150ms ease',
          }}
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={isLoading || !formData.name || !formData.service || !formData.value}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1, height: 36,
            background: C.brandIndigo,
            border: 'none', borderRadius: 6,
            color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: (isLoading || !formData.name || !formData.service || !formData.value) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !formData.name || !formData.service || !formData.value) ? 0.5 : 1,
            fontFamily: "'Inter', sans-serif",
            fontFeatureSettings: '"cv01","ss03"',
            transition: 'opacity 150ms ease',
          }}
        >
          {isLoading ? 'Saving…' : editingSecret ? 'Save Changes' : 'Add Key'}
        </motion.button>
      </div>
    </form>
  );

  // ─── Header (shared) ──────────────────────────────────────────────────────
  const header = (
    <div style={{
      padding: '20px 24px',
      borderBottom: `1px solid ${C.borderSubtle}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div>
        <h2 style={{
          fontSize: 15, fontWeight: 600,
          color: C.textPrimary,
          fontFamily: "'Inter', sans-serif",
          fontFeatureSettings: '"cv01","ss03"',
          letterSpacing: '-0.3px',
        }}>
          {editingSecret ? `Edit ${editingSecret.name}` : 'Add Key'}
        </h2>
      </div>
      <button
        onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          color: C.textMuted,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );

  // ─── Mobile: vaul Drawer from bottom ──────────────────────────────────────
  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} snapPoints={[0.92]}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[12px] outline-none"
            style={{
              background: '#0f1011',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              maxHeight: '92vh',
            }}
          >
            {/* Drag handle */}
            <div className="mx-auto mt-3 h-1 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            {header}
            {formContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // ─── Desktop: slide-in panel from right ──────────────────────────────────
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
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />

          {/* Slide-in panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 34 }}
            className="av-panel"
            style={{
              background: C.panelBg,
              borderLeft: `1px solid ${C.borderDefault}`,
              boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
            }}
          >
            {header}
            {formContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
