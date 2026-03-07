'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Invalid credentials'); return; }
      localStorage.setItem('riva_admin_token', data.token);
      localStorage.setItem('riva_admin', JSON.stringify(data.admin));
      router.push('/dashboard');
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };
  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '7px', fontSize: '13px', color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', fontFamily: 'Geist, sans-serif' };
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', background: '#1A56DB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>R</span>
          </div>
          <h1 style={{ f          <h1 style={{ f       00', color: '#ffffff', marginBottom: '4px' }}>RIVA Control</h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>Super Admin Portal</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' }}>
          {error && <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '7px', padding: '10px 14px', marginBottom: '16px', color: '#FCA5A5', fontSize: '13px' }}>{error}</div>}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>EMAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="control@getriva.in" style={inp} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>PASSWORD</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inp} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading: '100%', padding: '11px', background: loading ? '#334155' : '#1A56DB', color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Geist, sans-serif' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
