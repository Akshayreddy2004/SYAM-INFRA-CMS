import { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, IndianRupee, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading Dashboard...</div>;

  const statCards = [

    { title: 'Active Projects', value: stats?.active_projects || 0, icon: Briefcase, color: '#3b82f6' },
    { title: 'Completed Projects', value: stats?.completed_projects || 0, icon: CheckCircle, color: 'var(--success)' },
    { title: 'Total Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'var(--success)' },
    { title: 'Pending Payments', value: `₹${(stats?.pending_payments || 0).toLocaleString()}`, icon: AlertCircle, color: 'var(--danger)' },
    { title: 'Total Expenses', value: `₹${(stats?.total_expenses || 0).toLocaleString()}`, icon: TrendingUp, color: '#f97316' },
  ];

  const generateDashboardPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Dashboard Overview`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: statCards.map(card => [card.title, card.value.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    if (stats?.recent_projects?.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Recent Project', 'Status', 'Progress']],
        body: stats.recent_projects.map(p => [p.name, p.status, `${p.progress_percentage}%`]),
        theme: 'striped',
        headStyles: { fillColor: [39, 174, 96] }
      });
    }

    return doc;
  };

  const exportDashboard = () => {
    if (!stats) return;
    const doc = generateDashboardPDF();
    doc.save(`Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Dashboard Overview</h2>
        <button className="btn btn-secondary" onClick={exportDashboard} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Export PDF
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: `${card.color}20`, borderRadius: '50%', color: card.color }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Revenue vs Expenses (6 Months)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chart_data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Projects</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Project Name</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_projects?.map(project => (
                  <tr key={project.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 500 }}>{project.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{project.id}</div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${project.progress_percentage}%`, backgroundColor: 'var(--success)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>{project.progress_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_projects || stats.recent_projects.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No projects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
