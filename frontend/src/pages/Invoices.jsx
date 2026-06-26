import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Printer, Search } from 'lucide-react';
import api from '../utils/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices/');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>All Invoices</h2>
        <div className="input-group" style={{ marginBottom: 0, width: '300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            className="input" 
            placeholder="Search invoices..." 
            style={{ paddingLeft: '35px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Project ID</th>
              <th>Date</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 600 }}>{inv.id}</td>
                <td><Link to={`/projects/${inv.project_id}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>{inv.project_id}</Link></td>
                <td>{inv.date}</td>
                <td>{inv.total_amount.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'Paid' ? 'badge-success' : 
                    inv.status === 'Sent' ? 'badge-primary' : 
                    inv.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/invoices/${inv.id}/view`} target="_blank" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                      <Printer size={16} /> Print
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No invoices found. Go to a Project to generate one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
