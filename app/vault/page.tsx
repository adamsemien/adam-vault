'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Secret, ProjectToken, AuditLog, AuthUser } from '@/types';
import { useApi } from '@/lib/useApi';
import { useIsMobile } from '@/lib/use-mobile';
import { SecretsList } from '@/components/SecretsList';
import { TokensList } from '@/components/TokensList';
import { AuditLogComponent } from '@/components/AuditLog';
import { SecretModal, SecretFormData } from '@/components/SecretModal';
import { RotateModal } from '@/components/RotateModal';
import { DeleteModal } from '@/components/DeleteModal';
import { NewTokenModal } from '@/components/NewTokenModal';
import { RevokeTokenModal } from '@/components/RevokeTokenModal';
import { ToastManager } from '@/components/Toast';
import { LogOut, Key, Coins, Clock } from 'lucide-react';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  pageBg: '#08090a',
  panelBg: '#0f1011',
  surface: '#191a1b',
  surfaceHover: '#28282c',
  textPrimary: '#f7f8f8',
  textSecondary: '#d0d6e0',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  brandIndigo: '#5e6ad2',
  accentViolet: '#7170ff',
  accentHover: '#828fff',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info'; onDismiss?: () => void };
type View = 'secrets' | 'tokens' | 'audit';

const NAV_TABS: { id: View; label: string }[] = [
  { id: 'secrets', label: 'Secrets' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'audit', label: 'Audit Log' },
];

const BOTTOM_NAV = [
  { id: 'secrets' as View, label: 'Secrets', Icon: Key },
  { id: 'tokens' as View, label: 'Tokens', Icon: Coins },
  { id: 'audit' as View, label: 'Audit Log', Icon: Clock },
];

export default function VaultPage() {
  const api = useApi();
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>('secrets');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [healthy, setHealthy] = useState(true);

  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [tokens, setTokens] = useState<ProjectToken[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [rotatingSecret, setRotatingSecret] = useState<Secret | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSecret, setDeletingSecret] = useState<Secret | null>(null);
  const [newTokenModalOpen, setNewTokenModalOpen] = useState(false);
  const [revokeTokenModalOpen, setRevokeTokenModalOpen] = useState(false);
  const [revokingToken, setRevokingToken] = useState<ProjectToken | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<AuthUser>('/api/user');
      if (data) setUser(data);
    } catch {}
  }, [api]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      setHealthy(res.ok);
    } catch { setHealthy(false); }
  }, []);

  const fetchSecrets = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await api.get<{ secrets: Secret[] }>('/api/secrets');
      if (error) { showToast(error.message, 'error'); return; }
      if (data?.secrets) {
        setSecrets(data.secrets);
        const tags = new Set<string>();
        data.secrets.forEach((s) => s.project_tags?.forEach((t) => tags.add(t)));
        setAllTags(Array.from(tags).sort());
      }
    } catch { showToast('Failed to load secrets', 'error'); }
    finally { setIsLoading(false); }
  }, [api, showToast]);

  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await api.get<{ tokens: ProjectToken[] }>('/api/tokens');
      if (error) { showToast(error.message, 'error'); return; }
      if (data?.tokens) setTokens(data.tokens);
    } catch { showToast('Failed to load tokens', 'error'); }
    finally { setIsLoading(false); }
  }, [api, showToast]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data, error } = await api.get<{ logs: AuditLog[] }>('/api/audit-log');
      if (error) { console.error('Audit log error:', error); return; }
      if (data?.logs) setAuditLogs(data.logs);
    } catch {}
  }, [api]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      await Promise.all([fetchUser(), fetchSecrets(), fetchTokens(), fetchAuditLogs(), fetchHealth()]);
    };
    init();
    return () => { mounted = false; };
  }, [fetchUser, fetchSecrets, fetchTokens, fetchAuditLogs, fetchHealth]);

  useEffect(() => {
    if (view !== 'audit') return;
    const interval = setInterval(fetchAuditLogs, 10000);
    return () => clearInterval(interval);
  }, [view, fetchAuditLogs]);

  const handleSaveSecret = async (formData: SecretFormData) => {
    try {
      setIsLoading(true);
      if (editingSecret) {
        const { error } = await api.put(`/api/secrets/${editingSecret.id}`, formData);
        if (error) { showToast(error.message, 'error'); return; }
        showToast('Key updated', 'success');
      } else {
        const { error } = await api.post('/api/secrets', formData);
        if (error) { showToast(error.message, 'error'); return; }
        showToast('Key saved', 'success');
      }
      setSecretModalOpen(false);
      setEditingSecret(null);
      await fetchSecrets();
    } catch { showToast('Operation failed', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleRotateSecret = async (newValue: string) => {
    if (!rotatingSecret) return;
    try {
      setIsLoading(true);
      const { error } = await api.post(`/api/secrets/${rotatingSecret.id}/rotate`, { new_value: newValue });
      if (error) { showToast(error.message, 'error'); return; }
      showToast('Key rotated', 'success');
      setRotateModalOpen(false);
      setRotatingSecret(null);
      await fetchSecrets();
    } catch { showToast('Rotation failed', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteSecret = async () => {
    if (!deletingSecret) return;
    try {
      setIsLoading(true);
      const { error } = await api.del(`/api/secrets/${deletingSecret.id}`);
      if (error) { showToast(error.message, 'error'); return; }
      showToast('Key deleted', 'success');
      setDeleteModalOpen(false);
      setDeletingSecret(null);
      await fetchSecrets();
    } catch { showToast('Deletion failed', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleRevealSecret = async (secret: Secret) => {
    try {
      await navigator.clipboard.writeText(secret.encrypted_value);
      showToast('Value copied to clipboard', 'success');
      await api.post(`/api/secrets/${secret.id}/log-view`, {});
    } catch { showToast('Failed to copy', 'error'); }
  };

  const handleCreateToken = async (name: string, tags: string[]): Promise<string | null> => {
    try {
      setIsLoading(true);
      const { data, error } = await api.post<{ token: string }>('/api/tokens', { name, allowed_tags: tags });
      if (error) { showToast(error.message, 'error'); return null; }
      if (data?.token) { showToast('Token created', 'success'); await fetchTokens(); return data.token; }
      return null;
    } catch { showToast('Failed to create token', 'error'); return null; }
    finally { setIsLoading(false); }
  };

  const handleRevokeToken = async () => {
    if (!revokingToken) return;
    try {
      setIsLoading(true);
      const { error } = await api.del(`/api/tokens/${revokingToken.id}`);
      if (error) { showToast(error.message, 'error'); return; }
      showToast('Token revoked', 'success');
      setRevokeTokenModalOpen(false);
      setRevokingToken(null);
      await fetchTokens();
    } catch { showToast('Revocation failed', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch { showToast('Sign out failed', 'error'); }
  };

  const openAddKey = () => { setEditingSecret(null); setSecretModalOpen(true); };

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, color: C.textPrimary, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"cv01", "ss03"' }}>

      {/* ── Top Nav ── */}
      {isMobile ? (
        /* Mobile: two rows */
        <nav style={{
          position: 'sticky', top: 0, zIndex: 30,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: C.panelBg,
        }}>
          {/* Row 1: logo + title left, dot + signout right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 48 }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: C.brandIndigo,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>AV</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em' }}>
                Adam Vault
              </span>
            </div>
            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Green pulse dot */}
              <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: healthy ? C.success : C.danger,
                  position: 'absolute',
                }} />
                {healthy && (
                  <div style={{
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.3)',
                    animation: 'ping 2s ease-in-out infinite',
                  }} />
                )}
              </div>
              {/* Sign out icon button - 44px tap target */}
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 44, minHeight: 44,
                  background: 'transparent', border: 'none',
                  color: C.textMuted, cursor: 'pointer',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Row 2: three full-width tabs */}
          <div style={{ display: 'flex', height: 40 }}>
            {NAV_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  flex: 1,
                  background: view === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: view === id ? C.textPrimary : C.textMuted,
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  fontFeatureSettings: '"cv01", "ss03"',
                  transition: 'all 150ms ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      ) : (
        /* Desktop: single row */
        <nav className="av-nav">
          <div className="av-nav-row1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: C.brandIndigo,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontFeatureSettings: '"cv01", "ss03"' }}>AV</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, letterSpacing: '-0.01em', fontFeatureSettings: '"cv01", "ss03"' }}>
                Adam Vault
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <div style={{ position: 'relative', width: 6, height: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: healthy ? C.success : C.danger, position: 'absolute' }} />
                  {healthy && (
                    <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: 'rgba(16,185,129,0.3)', animation: 'ping 2s ease-in-out infinite' }} />
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: healthy ? C.success : C.danger, fontFamily: "'Inter', sans-serif" }}>
                Live
              </span>
              <button className="av-signout-btn" onClick={handleSignOut}>
                <LogOut size={11} />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          <div className="av-nav-row2">
            {NAV_TABS.map(({ id, label }) => (
              <button
                key={id}
                className="av-nav-tab"
                onClick={() => setView(id)}
                style={{
                  background: view === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: view === id ? C.textPrimary : C.textMuted,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Main Content ── */}
      <main className="av-main pb-[56px] md:pb-0">

        {/* SECRETS */}
        {view === 'secrets' && (
          <motion.div
            key="secrets"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SecretsList
              secrets={secrets}
              selectedTags={selectedFilterTags}
              allTags={allTags}
              onEdit={(s) => { setEditingSecret(s); setSecretModalOpen(true); }}
              onReveal={handleRevealSecret}
              onRotate={(s) => { setRotatingSecret(s); setRotateModalOpen(true); }}
              onDelete={(s) => { setDeletingSecret(s); setDeleteModalOpen(true); }}
              onFilterChange={setSelectedFilterTags}
              isLoading={isLoading}
              onAddKey={openAddKey}
            />
          </motion.div>
        )}

        {/* TOKENS */}
        {view === 'tokens' && (
          <motion.div
            key="tokens"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TokensList
              tokens={tokens}
              onRevoke={(t) => { setRevokingToken(t); setRevokeTokenModalOpen(true); }}
              isLoading={isLoading}
              onCreateToken={() => setNewTokenModalOpen(true)}
            />
          </motion.div>
        )}

        {/* AUDIT */}
        {view === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AuditLogComponent
              logs={auditLogs}
              onRefresh={fetchAuditLogs}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden flex"
        style={{
          background: C.panelBg,
          borderColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {BOTTOM_NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            style={{
              minHeight: 56,
              color: view === id ? '#7170ff' : '#62666d',
              fontSize: 11,
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Modals & Panels ── */}
      <SecretModal
        open={secretModalOpen}
        editingSecret={editingSecret || undefined}
        allTags={allTags}
        onClose={() => { setSecretModalOpen(false); setEditingSecret(null); }}
        onSave={handleSaveSecret}
        isLoading={isLoading}
      />

      <RotateModal
        open={rotateModalOpen}
        keyName={rotatingSecret?.name || ''}
        onClose={() => { setRotateModalOpen(false); setRotatingSecret(null); }}
        onConfirm={handleRotateSecret}
        isLoading={isLoading}
      />

      <DeleteModal
        open={deleteModalOpen}
        keyName={deletingSecret?.name || ''}
        onClose={() => { setDeleteModalOpen(false); setDeletingSecret(null); }}
        onConfirm={handleDeleteSecret}
        isLoading={isLoading}
      />

      <NewTokenModal
        open={newTokenModalOpen}
        allTags={allTags}
        onClose={() => setNewTokenModalOpen(false)}
        onCreate={handleCreateToken}
        isLoading={isLoading}
      />

      <RevokeTokenModal
        open={revokeTokenModalOpen}
        tokenName={revokingToken?.name || ''}
        onClose={() => { setRevokeTokenModalOpen(false); setRevokingToken(null); }}
        onConfirm={handleRevokeToken}
        isLoading={isLoading}
      />

      <ToastManager toasts={toasts.map((t) => ({ ...t, onDismiss: () => dismissToast(t.id) }))} onDismiss={dismissToast} />

      <style>{`
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
