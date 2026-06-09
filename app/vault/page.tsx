'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Secret, ProjectToken, AuditLog, AuthUser } from '@/types';
import { useApi } from '@/lib/useApi';
import { SecretsList } from '@/components/SecretsList';
import { TokensList } from '@/components/TokensList';
import { AuditLogComponent } from '@/components/AuditLog';
import { SecretModal, SecretFormData } from '@/components/SecretModal';
import { RotateModal } from '@/components/RotateModal';
import { DeleteModal } from '@/components/DeleteModal';
import { NewTokenModal } from '@/components/NewTokenModal';
import { RevokeTokenModal } from '@/components/RevokeTokenModal';
import { ToastManager } from '@/components/Toast';
import { Plus, LogOut } from 'lucide-react';

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info'; onDismiss?: () => void };
type View = 'secrets' | 'tokens' | 'audit';

const NAV_TABS: { id: View; label: string }[] = [
  { id: 'secrets', label: 'Secrets' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'audit', label: 'Audit' },
];

export default function VaultPage() {
  const api = useApi();
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
    setToasts((prev) => [...prev, { id, message, type }]);
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
    fetchUser();
    fetchSecrets();
    fetchTokens();
    fetchAuditLogs();
    fetchHealth();
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
    <div style={{ minHeight: '100vh', background: '#080809', color: '#ededef', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        height: 48,
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,8,9,0.92)',
        backdropFilter: 'blur(12px)',
        padding: '0 24px',
      }}>
        {/* Left: wordmark */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14, fontWeight: 600,
            color: '#ededef',
            letterSpacing: '-0.01em',
          }}>
            vault
          </span>
          <span style={{
            padding: '1px 6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            fontSize: 10, fontWeight: 500,
            color: '#555558',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            v1.0
          </span>
        </div>

        {/* Center: tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                border: 'none',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                background: view === id ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: view === id ? '#ededef' : '#555558',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: user info */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          {/* Health dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              position: 'relative',
              width: 7, height: 7,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: healthy ? '#22c55e' : '#ef4444',
              }} />
              {healthy && (
                <div style={{
                  position: 'absolute', inset: -2,
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.3)',
                  animation: 'ping 2s ease-in-out infinite',
                }} />
              )}
            </div>
          </div>

          {user?.email && (
            <span style={{ fontSize: 11, color: '#555558', fontFamily: "'Inter', sans-serif" }}>
              {user.email}
            </span>
          )}

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 26, paddingLeft: 10, paddingRight: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5,
              color: '#8b8b8e',
              fontSize: 11, fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ededef'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8b8b8e'; }}
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* SECRETS */}
        {view === 'secrets' && (
          <motion.div
            key="secrets"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 600, color: '#ededef', letterSpacing: '-0.01em' }}>
                  Secrets
                </h1>
                <p style={{ fontSize: 12, color: '#555558', marginTop: 2 }}>
                  {secrets.length} key{secrets.length !== 1 ? 's' : ''} stored
                </p>
              </div>
              <motion.button
                onClick={openAddKey}
                whileHover={{ scale: 1.01, background: '#8f7ff9' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, paddingLeft: 12, paddingRight: 14,
                  background: '#7c6af7',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={13} />
                Add Key
              </motion.button>
            </div>

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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 600, color: '#ededef', letterSpacing: '-0.01em' }}>
                  Tokens
                </h1>
                <p style={{ fontSize: 12, color: '#555558', marginTop: 2 }}>
                  {tokens.filter((t) => !t.revoked).length} active token{tokens.filter((t) => !t.revoked).length !== 1 ? 's' : ''}
                </p>
              </div>
              <motion.button
                onClick={() => setNewTokenModalOpen(true)}
                whileHover={{ scale: 1.01, background: '#8f7ff9' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, paddingLeft: 12, paddingRight: 14,
                  background: '#7c6af7',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                }}
              >
                <Plus size={13} />
                New Token
              </motion.button>
            </div>

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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: '#ededef', letterSpacing: '-0.01em' }}>
                Audit Log
              </h1>
              <p style={{ fontSize: 12, color: '#555558', marginTop: 2 }}>
                Auto-refreshes every 10 seconds
              </p>
            </div>

            <AuditLogComponent
              logs={auditLogs}
              onRefresh={fetchAuditLogs}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </main>

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
