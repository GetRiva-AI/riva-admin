'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AIConfig {
  _id: string;
  key: string;
  name: string;
  category: string;
  provider: string;
  modelName: string;
  isActive: boolean;
  lastTestedAt?: string;
  lastTestLatency?: number;
  updatedAt: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  gemini: '#1A56DB',
  anthropic: '#7C3AED',
  openai: '#059669',
};

const CATEGORY_LABELS: Record<string, string> = {
  interview: 'Interview',
  screening: 'Screening',
  jd: 'JD',
  scoring: 'Scoring',
  transcript: 'Transcript',
  proctoring: 'Proctoring',
};

export default function AIConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState('');
  const [seedMsg, setSeedMsg] = useState('');

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setConfigs(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg('');
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai-config/seed/all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setSeedMsg('✅ Seeded successfully'); fetchConfigs(); }
      else setSeedMsg('❌ ' + data.message);
    } catch { setSeedMsg('❌ Failed'); }
    finally { setSeeding(false); }
  };

  const filtered = configs.filter(c =>
    !filter || c.category === filter
  );

  const categories = [...new Set(configs.map(c => c.category))];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '3px' }}>AI Config Center</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>{configs.length} prompts · manage models and prompts in real time</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {seedMsg && <span style={{ fontSize: '12px', color: seedMsg.includes('✅') ? '#059669' : '#DC2626' }}>{seedMsg}</span>}
          <button onClick={handleSeed} disabled={seeding}
            style={{ padding: '8px 16px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: seeding ? 0.6 : 1 }}>
            {seeding ? 'Seeding...' : '⚡ Seed Defaults'}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('')}
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: !filter ? '#0F172A' : '#fff', color: !filter ? '#fff' : '#64748B' }}>
          All ({configs.length})
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(filter === cat ? '' : cat)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: filter === cat ? '#0F172A' : '#fff', color: filter === cat ? '#fff' : '#64748B' }}>
            {CATEGORY_LABELS[cat] || cat} ({configs.filter(c => c.category === cat).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading configs...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>No configs yet</div>
          <div style={{ fontSize: '13px' }}>Click "Seed Defaults" to populate all prompts</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['Name', 'Key', 'Category', 'Provider / Model', 'Last Tested', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94A3B8', letterSpacing: '0.3px' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((config, i) => (
                <tr key={config._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => router.push(`/dashboard/ai-config/${encodeURIComponent(config.key)}`)}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{config.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>{config.key}</code>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      {CATEGORY_LABELS[config.category] || config.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: PROVIDER_COLORS[config.provider] || '#64748B', textTransform: 'capitalize' }}>{config.provider}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{config.modelName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {config.lastTestedAt ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>{new Date(config.lastTestedAt).toLocaleDateString('en-IN')}</span>
                        {config.lastTestLatency && <span style={{ fontSize: '11px', color: '#94A3B8' }}>{config.lastTestLatency}ms</span>}
                      </div>
                    ) : <span style={{ fontSize: '11px', color: '#CBD5E1' }}>Never</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: config.isActive ? '#DCFCE7' : '#FEE2E2', color: config.isActive ? '#059669' : '#DC2626' }}>
                      {config.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '18px', color: '#CBD5E1' }}>›</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}