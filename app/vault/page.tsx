'use client';

import { useEffect, useState, useCallback } from 'react';
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

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info'; onDismiss?: () => void };
type View = 'secrets' | 'tokens' | 'audit-log';

export default function VaultPage() {
  const api = useApi();
  const [view, setView] = useState<View>('secrets');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Data
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [tokens, setTokens] = useState<ProjectToken[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // UI State
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [rotatingSecret, setRotatingSecret] = useState<Secret | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSecret, setDeletingSecret] = useState<Secret | null>(null);
  const [newTokenModalOpen, setNewTokenModalOpen] = useState(false);
  const [revokeTokenModalOpen, setRevokeTokenModalOpen] = useState(false);
  const [revokingToken, setRevokingToken] = useState<ProjectToken | null>(null);

  // Toast management
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch user info
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<AuthUser>('/api/user');
      if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, [api]);

  // Fetch secrets
  const fetchSecrets = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await api.get<{ secrets: Secret[] }>('/api/secrets');

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      if (data?.secrets) {
        setSecrets(data.secrets);

        // Extract all unique tags
        const tags = new Set<string>();
        data.secrets.forEach((s) => {
          s.project_tags?.forEach((tag) => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
      }
    } catch (err) {
      console.error('Failed to fetch secrets:', err);
      showToast('Failed to load secrets', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  // Fetch tokens
  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await api.get<{ tokens: ProjectToken[] }>('/api/tokens');

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      if (data?.tokens) {
        setTokens(data.tokens);
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      showToast('Failed to load tokens', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data, error } = await api.get<{ logs: AuditLog[] }>('/api/audit-log');

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return;
      }

      if (data?.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  }, [api]);

  // Initial load
  useEffect(() => {
    fetchUser();
    fetchSecrets();
    fetchTokens();
    fetchAuditLogs();
  }, [fetchUser, fetchSecrets, fetchTokens, fetchAuditLogs]);

  // Auto-refresh audit logs every 10 seconds
  useEffect(() => {
    if (view !== 'audit-log') return;

    const interval = setInterval(() => {
      fetchAuditLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [view, fetchAuditLogs]);

  // Secret operations
  const handleSaveSecret = async (formData: SecretFormData) => {
    try {
      setIsLoading(true);

      if (editingSecret) {
        // Update
        const { error } = await api.put(`/api/secrets/${editingSecret.id}`, formData);
        if (error) {
          showToast(error.message, 'error');
          return;
        }
        showToast('Key updated', 'success');
      } else {
        // Create
        const { error } = await api.post('/api/secrets', formData);
        if (error) {
          showToast(error.message, 'error');
          return;
        }
        showToast('Key saved', 'success');
      }

      setSecretModalOpen(false);
      setEditingSecret(null);
      await fetchSecrets();
    } catch (err) {
      showToast('Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotateSecret = async (newValue: string) => {
    if (!rotatingSecret) return;

    try {
      setIsLoading(true);
      const { error } = await api.post(`/api/secrets/${rotatingSecret.id}/rotate`, {
        new_value: newValue,
      });

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      showToast('Key rotated', 'success');
      setRotateModalOpen(false);
      setRotatingSecret(null);
      await fetchSecrets();
    } catch (err) {
      showToast('Rotation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSecret = async () => {
    if (!deletingSecret) return;

    try {
      setIsLoading(true);
      const { error } = await api.del(`/api/secrets/${deletingSecret.id}`);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      showToast('Key deleted', 'success');
      setDeleteModalOpen(false);
      setDeletingSecret(null);
      await fetchSecrets();
    } catch (err) {
      showToast('Deletion failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealSecret = async (secret: Secret) => {
    try {
      await navigator.clipboard.writeText(secret.encrypted_value);
      showToast('Value copied to clipboard', 'success');
      // Log view action
      await api.post(`/api/secrets/${secret.id}/log-view`, {});
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
  };

  // Token operations
  const handleCreateToken = async (
    name: string,
    tags: string[]
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      const { data, error } = await api.post<{ token: string }>('/api/tokens', {
        name,
        allowed_tags: tags,
      });

      if (error) {
        showToast(error.message, 'error');
        return null;
      }

      if (data?.token) {
        showToast('Token created', 'success');
        await fetchTokens();
        return data.token;
      }

      return null;
    } catch (err) {
      showToast('Failed to create token', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!revokingToken) return;

    try {
      setIsLoading(true);
      const { error } = await api.del(`/api/tokens/${revokingToken.id}`);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      showToast('Token revoked', 'success');
      setRevokeTokenModalOpen(false);
      setRevokingToken(null);
      await fetchTokens();
    } catch (err) {
      showToast('Revocation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      showToast('Sign out failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e2e8]">
      {/* Top Navigation */}
      <nav className="border-b border-[#1a1a28] bg-[#0e0e18]/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <h1
            className="text-xl font-bold text-[#e2e2e8]"
            style={{ fontFamily: 'monospace' }}
          >
            Adam Vault
          </h1>

          {/* Center: View Selector */}
          <div className="flex items-center gap-4">
            {(['secrets', 'tokens', 'audit-log'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-[#6a5acd] text-white'
                    : 'text-[#6b6b80] hover:text-[#e2e2e8]'
                }`}
              >
                {v === 'secrets'
                  ? 'Secrets'
                  : v === 'tokens'
                    ? 'Tokens'
                    : 'Audit Log'}
              </button>
            ))}
          </div>

          {/* Right: User + Sign Out */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6b6b80]">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm bg-[#1a1a28] hover:bg-[#252540] text-[#e2e2e8] rounded font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* SECRETS VIEW */}
        {view === 'secrets' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e2e2e8]">Secrets</h2>
              <button
                onClick={() => {
                  setEditingSecret(null);
                  setSecretModalOpen(true);
                }}
                className="px-4 py-2 bg-[#6a5acd] hover:bg-[#7a6add] text-white rounded text-sm font-medium"
              >
                Add Key
              </button>
            </div>

            {/* Secrets Table */}
            <SecretsList
              secrets={secrets}
              selectedTags={selectedFilterTags}
              allTags={allTags}
              onEdit={(secret) => {
                setEditingSecret(secret);
                setSecretModalOpen(true);
              }}
              onReveal={handleRevealSecret}
              onRotate={(secret) => {
                setRotatingSecret(secret);
                setRotateModalOpen(true);
              }}
              onDelete={(secret) => {
                setDeletingSecret(secret);
                setDeleteModalOpen(true);
              }}
              onFilterChange={setSelectedFilterTags}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TOKENS VIEW */}
        {view === 'tokens' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e2e2e8]">Tokens</h2>
              <button
                onClick={() => setNewTokenModalOpen(true)}
                className="px-4 py-2 bg-[#6a5acd] hover:bg-[#7a6add] text-white rounded text-sm font-medium"
              >
                New Token
              </button>
            </div>

            {/* Tokens Table */}
            <TokensList
              tokens={tokens}
              onRevoke={(token) => {
                setRevokingToken(token);
                setRevokeTokenModalOpen(true);
              }}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* AUDIT LOG VIEW */}
        {view === 'audit-log' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#e2e2e8]">Audit Log</h2>
            <AuditLogComponent
              logs={auditLogs}
              onRefresh={fetchAuditLogs}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <SecretModal
        open={secretModalOpen}
        editingSecret={editingSecret || undefined}
        allTags={allTags}
        onClose={() => {
          setSecretModalOpen(false);
          setEditingSecret(null);
        }}
        onSave={handleSaveSecret}
        isLoading={isLoading}
      />

      <RotateModal
        open={rotateModalOpen}
        keyName={rotatingSecret?.name || ''}
        onClose={() => {
          setRotateModalOpen(false);
          setRotatingSecret(null);
        }}
        onConfirm={handleRotateSecret}
        isLoading={isLoading}
      />

      <DeleteModal
        open={deleteModalOpen}
        keyName={deletingSecret?.name || ''}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingSecret(null);
        }}
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
        onClose={() => {
          setRevokeTokenModalOpen(false);
          setRevokingToken(null);
        }}
        onConfirm={handleRevokeToken}
        isLoading={isLoading}
      />

      {/* Toast Manager */}
      <ToastManager toasts={toasts.map(t => ({...t, onDismiss: () => dismissToast(t.id)}))} onDismiss={dismissToast} />
    </div>
  );
}
