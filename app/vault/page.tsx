'use client';

import { useEffect, useState } from 'react';
import { Secret } from '@/types';

export default function VaultPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSecrets();
  }, []);

  async function fetchSecrets() {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const res = await fetch('/api/secrets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch secrets');

      const data = await res.json();
      setSecrets(data.secrets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Vault</h1>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold">
          Add Secret
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      {secrets.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No secrets yet</div>
      ) : (
        <div className="grid gap-4">
          {secrets.map((secret) => (
            <div
              key={secret.id}
              className="bg-slate-700 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{secret.name}</h3>
                  <p className="text-gray-400">{secret.service}</p>
                  {secret.description && (
                    <p className="text-sm text-gray-300 mt-2">{secret.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {secret.project_tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-slate-600 px-2 py-1 rounded mr-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
