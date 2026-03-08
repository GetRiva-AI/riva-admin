'use client';
import { useEffect, useState } from 'react';

interface APIKey {
  _id: string;
  name: string;
  provider: string;
  maskedValue: string;
  isActive: boolean;
  lastUsedAt?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  notes: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  'Google Gemini': '#1A56DB',
  'Anthropic Claude': '#7C3AED',
  'Sarvam AI': '#059669',
  'Resend Email': '#D97706',
  'AWS S3': '#DC2626',
};

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; message: string }>>({});
  const [seedMsg, setSeedMsg] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setKeys(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleSave = async (name: string) => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/api-keys/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: editValue }),
      });
      const data = await res.json();
      if (data.success) { setEditKey(null); setEditValue(''); fetchKeys(); }
    } catch { console.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleTest = async (name: string) => {
    setTesting(name);
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/api-keys/${name}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTestResults(p => ({ ...p, [name]: data.data }));
    } catch { setTestResults(p => ({ ...p, [name]: { status: 'failed', message: 'Request failed' } })); }
    finally { setTesting(null); }
  };

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg('');
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config/seed/all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSeedMsg(data.success ? '✅ Keys seeded from env' : '❌ ' + data.message);
      if (data.success) fetchKeys();
    } catch { setSeedMsg('❌ Failed'); }
    finally { setSeeding(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '3px' }}>API Keys</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Manage all third-party API keys. Changes take effect immediately.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {seedMsg && <span style={{ fontSize: '12px', color: seedMsg.includes('✅') ? '#059669' : '#DC2626' }}>{seedMsg}</span>}
          <button onClick={handleSeed} disabled={seeding}
            style={{ padding: '8px 16px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: seeding ? 0.6 : 1 }}>
            {seeding ? 'Seeding...' : '⚡ Seed from Env'}
          </button>
        </div>
      </div>

      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#92400E' }}>
        🔐 Keys are AES-256 encrypted at rest. Raw values are never shown after saving. Changes apply to all live API calls within 60 seconds.
      </div>

      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading keys...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {keys.map(k => {
            const testResult = testResults[k.name];
            const isEditing = editKey === k.name;
            const isTesting = testing === k.name;
            return (
              <div key={k._id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: PROVIDER_COLORS[k.provider] || '#64748B', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <code style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{k.name}</code>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{k.provider}</span>
                        {k.lastTestStatus && (
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '5px', background: k.lastTestStatus === 'success' ? '#DCFCE7' : '#FEE2E2', color: k.lastTestStatus === 'success' ? '#059669' : '#DC2626' }}>
                            {k.lastTestStatus === 'success' ? '✓ Valid' : '✗ Invalid'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px', fontFamily: 'monospace' }}>{k.maskedValue}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleTest(k.name)} disabled={isTesting}
                      style={{ padding: '7px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#475569', opacity: isTesting ? 0.6 : 1 }}>
                      {isTesting ? '...' : '⚡ Test'}
                    </button>
                    <button onClick={() => { setEditKey(isEditing ? null : k.name); setEditValue(''); }}
                      style={{ padding: '7px 14px', background: isEditing ? '#FEE2E2' : '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: isEditing ? '#DC2626' : '#475569' }}>
                      {isEditing ? 'Cancel' : '✏️ Update'}
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div style={{ marginTop: '12px', background: testResult.status === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${testResult.status === 'success' ? '#BBF7D0' : '#FECACA'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: testResult.status === 'success' ? '#166534' : '#DC2626' }}>
                    {testResult.status === 'success' ? '✅' : '❌'} {testResult.message}
                  </div>
                )}

                {isEditing && (
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <input type="password" value={editValue} onChange={e => setEditValue(e.target.value)}
                      placeholder={`Paste new ${k.name}...`} autoFocus
                      style={{ flex: 1, padding: '9px 14px', border: '1px solid #1A56DB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }} />
                    <button onClick={() => handleSave(k.name)} disabled={saving || !editValue.trim()}
                      style={{ padding: '9px 20px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving || !editValue.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                      {saving ? 'Saving...' : 'Save Key'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {keys.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔑</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>No API keys found</div>
              <div style={{ fontSize: '13px' }}>Click "Seed from Env" to import keys from Railway environment</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}