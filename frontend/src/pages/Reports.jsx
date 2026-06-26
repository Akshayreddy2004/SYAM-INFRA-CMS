import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const res = await api.get(`/reports/financial?${params.toString()}`);
      setReportData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateReportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Financial Report`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date Range: ${startDate || 'Start'} to ${endDate || 'Today'}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `Rs. ${reportData.total_revenue.toLocaleString()}`],
        ['Total Expenses', `Rs. ${reportData.total_expenses.toLocaleString()}`],
        ['Net Profit/Loss', `Rs. ${reportData.profit.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    return doc;
  };

  const exportReport = () => {
    if (!reportData) return;
    const doc = generateReportPDF();
    doc.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const viewReport = () => {
    if (!reportData) return;
    const doc = generateReportPDF();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Generate Financial Report</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Start Date</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>End Date</label>
            <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Financial Summary</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={viewReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} /> View
              </button>
              <button className="btn btn-secondary" onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={16} /> Export
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--success)' }}>
              <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Revenue</p>
              <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>₹{reportData.total_revenue.toLocaleString()}</h2>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--danger-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--danger)' }}>
              <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Expenses</p>
              <h2 style={{ fontSize: '2rem', color: 'var(--danger)' }}>₹{reportData.total_expenses.toLocaleString()}</h2>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: reportData.profit >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: 'var(--border-radius)', border: `1px solid ${reportData.profit >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
              <p style={{ color: reportData.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginBottom: '0.5rem' }}>Net Profit/Loss</p>
              <h2 style={{ fontSize: '2rem', color: reportData.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>₹{reportData.profit.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
