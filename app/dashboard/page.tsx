'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalCompanies: number;
  pendingCompanies: number;
  approvedCompanies: number;
  totalJobs: number;
  totalCandidates: number;
  totalInterviews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('riva_admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = stats ? [
    { label: 'Total Companies', value: stats.totalCompanies, color: '#1A56DB' },
    { label: 'Pending Approval', value: stats.pendingCompanies, color: '#D97706' },
    { label: 'Approved Companies', value: stats.approvedCompanies, color: '#059669' },
    { label: 'Total Jobs', value: stats.totalJobs, color: '#7C3AED' },
    { label: 'Total Candidates', value: stats.totalCandidates, color: '#0891B2' },
    { label: 'Interviews Done', value: stats.totalInterviews, color: '#059669' },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '3px' }}>Overview</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Platform health and key metrics</p>
      </div>
      {loading && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading stats...</div>}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {cards.map(card => (
            <div key={card.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8', letterSpacing: '0.3px', marginBottom: '8px' }}>{card.label.toUpperCase()}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
