'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('riva_admin_token');
    if (!token) { router.replace('/login'); return; }
    try {
      const adminData = localStorage.getItem('riva_admin');
      if (adminData && adminData !== 'undefined') setAdmin(JSON.parse(adminData));
    } catch {}
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('riva_admin_token');
    localStorage.removeItem('riva_admin');
    router.replace('/login');
  };

  const nav = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Companies', href: '/dashboard/companies' },
    { label: 'AI Config', href: '/dashboard/ai-config' },
    { label: 'API Keys', href: '/dashboard/api-keys' },
  ];

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid #1A56DB', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Geist, sans-serif', display: 'flex' }}>
      <div style={{ width: '220px', background: '#0F172A', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', background: '#1A56DB', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>R</span>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>RIVA</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>Control Panel</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {nav.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', marginBottom: '2px', textDecoration: 'none', background: active ? 'rgba(26,86,219,0.15)' : 'transparent', color: active ? '#60A5FA' : '#64748B' }}>
                <span style={{ fontSize: '13px', fontWeight: active ? '600' : '400' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>{admin?.email}</div>
          <button onClick={logout} style={{ fontSize: '12px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Geist, sans-serif' }}>Sign out</button>
        </div>
      </div>
      <div style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>{children}</div>
    </div>
  );
}