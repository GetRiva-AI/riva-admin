'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AIConfig {
  _id: string;
  key: string;
  name: string;
  category: string;
  provider: string;
  modelName: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  notes: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  lastTestLatency?: number;
}

const PROVIDERS = ['gemini', 'anthropic', 'openai'];
const MODELS: Record<string, string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  anthropic: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-5', 'claude-opus-4-5'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
};

function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
}

export default function AIConfigEditorPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const decodedKey = decodeURIComponent(key);

  const [config, setConfig] = useState<AIConfig | null>(null);
  const [form, setForm] = useState<Partial<AIConfig>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [testing, setTesting] = useState(false);
  const [testVars, setTestVars] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState('');
  const [testLatency, setTestLatency] = useState(0);
  const [testError, setTestError] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'tester'>('editor');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('riva_admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config/${encodeURIComponent(decodedKey)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) { setConfig(data.data); setForm(data.data); }
      } catch (err) { console.error(err); }
    };
    fetchConfig();
  }, [decodedKey]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config/${encodeURIComponent(decodedKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setConfig(data.data); setForm(data.data); setSaveMsg('✅ Saved'); }
      else setSaveMsg('❌ ' + data.message);
    } catch { setSaveMsg('❌ Save failed'); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3000); }
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(''); setTestError('');
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config/${encodeURIComponent(decodedKey)}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ variables: testVars }),
      });
      const data = await res.json();
      if (data.success) { setTestResult(data.data.result); setTestLatency(data.data.latency); }
      else setTestError(data.message);
    } catch { setTestError('Test failed'); }
    finally { setTesting(false); }
  };

  const variables = extractVariables(form.userPromptTemplate || '');

  if (!config) return <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard/ai-config')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px' }}>←</button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '2px' }}>{config.name}</h1>
            <code style={{ fontSize: '11px', color: '#94A3B8' }}>{config.key}</code>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saveMsg && <span style={{ fontSize: '12px', color: saveMsg.includes('✅') ? '#059669' : '#DC2626' }}>{saveMsg}</span>}
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 20px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginBottom: '24px', width: 'fit-content' }}>
        {(['editor', 'tester'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '7px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#0F172A' : '#64748B', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {tab === 'editor' ? '✏️ Editor' : '⚡ Live Tester'}
          </button>
        ))}
      </div>

      {activeTab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '16px' }}>CONFIGURATION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>NAME</label>
                  <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>PROVIDER</label>
                    <select value={form.provider || 'gemini'} onChange={e => setForm(p => ({ ...p, provider: e.target.value, modelName: MODELS[e.target.value]?.[0] || '' }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>MODEL</label>
                    <select value={form.modelName || ''} onChange={e => setForm(p => ({ ...p, modelName: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      {(MODELS[form.provider || 'gemini'] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>TEMPERATURE — {form.temperature}</label>
                    <input type="range" min="0" max="1" step="0.1" value={form.temperature || 0.7}
                      onChange={e => setForm(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                      style={{ width: '100%', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                      <span>Precise</span><span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>MAX TOKENS</label>
                    <input type="number" value={form.maxTokens || 1000} onChange={e => setForm(p => ({ ...p, maxTokens: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>STATUS</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[true, false].map(val => (
                      <button key={String(val)} onClick={() => setForm(p => ({ ...p, isActive: val }))}
                        style={{ flex: 1, padding: '7px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: form.isActive === val ? (val ? '#DCFCE7' : '#FEE2E2') : '#fff', color: form.isActive === val ? (val ? '#059669' : '#DC2626') : '#64748B' }}>
                        {val ? '✅ Active' : '⏸ Disabled'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>NOTES</label>
                  <input value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Internal notes about this config..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>SYSTEM PROMPT</label>
              <textarea value={form.systemPrompt || ''} onChange={e => setForm(p => ({ ...p, systemPrompt: e.target.value }))}
                rows={6} placeholder="System prompt (optional)..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '1.6' }} />
            </div>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px' }}>USER PROMPT TEMPLATE</label>
                {variables.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {variables.map(v => (
                      <code key={v} style={{ fontSize: '10px', background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: '4px' }}>{'{{' + v + '}}'}</code>
                    ))}
                  </div>
                )}
              </div>
              <textarea value={form.userPromptTemplate || ''} onChange={e => setForm(p => ({ ...p, userPromptTemplate: e.target.value }))}
                rows={12}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '1.6' }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tester' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Variables input */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '16px' }}>TEST VARIABLES</div>
            {variables.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>No variables detected in template.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {variables.map(v => (
                  <div key={v}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                      <code style={{ background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>{'{{' + v + '}}'}</code>
                    </label>
                    <textarea value={testVars[v] || ''} onChange={e => setTestVars(p => ({ ...p, [v]: e.target.value }))}
                      rows={3} placeholder={`Value for ${v}...`}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleTest} disabled={testing}
              style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: testing ? 0.6 : 1 }}>
              {testing ? '⏳ Running...' : '⚡ Run Test'}
            </button>
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#94A3B8' }}>
              Using: <strong>{form.provider}</strong> / <strong>{form.modelName}</strong> · temp {form.temperature}
            </div>
          </div>

          {/* Result */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px' }}>RESULT</div>
              {testLatency > 0 && <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>⚡ {testLatency}ms</span>}
            </div>
            {testError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#DC2626', marginBottom: '12px' }}>{testError}</div>
            )}
            {config.lastTestResult && !testResult && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>Last test result:</div>
                <pre style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '11px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#475569', maxHeight: '300px', overflowY: 'auto' }}>{config.lastTestResult}</pre>
              </div>
            )}
            {testResult && (
              <pre style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px', fontSize: '11px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#166534', maxHeight: '400px', overflowY: 'auto' }}>{testResult}</pre>
            )}
            {!testResult && !testError && !config.lastTestResult && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '13px' }}>
                Fill in variables and click Run Test
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}