'use client';

import { useEffect, useState } from 'react';

interface Company {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  accountType: string;
  status: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchCompanies(); }, [filter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('riva_admin_token');
      const url = filter === 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/companies`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/companies?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCompanies(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem('riva_admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) setCompanies(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const statusColor: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: '#FFF7ED', text: '#D97706', border: '#FED7AA' },
    approved: { bg: '#F0FDF4', text: '#059669', border: '#BBF7D0' },
    rejected: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    suspended: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '3px' }}>Companies</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>{companies.length} companies</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Geist', sans-serif", background: filter === f ? '#1A56DB' : '#ffffff', color: filter === f ? 'white' : '#64748B', border: `1px solid ${filter === f ? '#1A56DB' : '#E2E8F0'}` }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Loading...</div>}

      {!loading && companies.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No companies found.</div>
      )}

      {!loading && companies.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                {['Company', 'Email', 'Industry', 'Size', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94A3B8', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map(company => {
                const s = statusColor[company.status] || statusColor.pending;
                return (
                  <tr key={company._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{company.companyName}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{new Date(company.createdAt).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>{company.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>{company.industry}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>{company.companySize}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569', textTransform: 'capitalize' }}>{company.accountType}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: s.text, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '5px', padding: '3px 8px', textTransform: 'capitalize' }}>{company.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {company.status !== 'approved' && (
                          <button onClick={() => updateStatus(company._id, 'approved')} disabled={updating === company._id} style={{ padding: '4px 10px', background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}>Approve</button>
                        )}
                        {company.status !== 'rejected' && (
                          <button onClick={() => updateStatus(company._id, 'rejected')} disabled={updating === company._id} style={{ padding: '4px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}>Reject</button>
                        )}
                        {company.status === 'approved' && (
                          <button onClick={() => updateStatus(company._id, 'suspended')} disabled={updating === company._id} style={{ padding: '4px 10px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
