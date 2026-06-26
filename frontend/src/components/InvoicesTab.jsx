import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';

const InvoicesTab = ({ projectId }) => {
  const [invoices, setInvoices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paid_date: '',
    subtotal: '',
    status: 'Draft',
    description: 'Initial payment',
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchSchedules();
  }, [projectId]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get(`/invoices/project/${projectId}`);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get(`/payments/project/${projectId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const subtotal = parseFloat(formData.subtotal);
    const total_amount = subtotal;

    const payload = {
      ...formData,
      project_id: projectId,
      subtotal,
      total_amount
    };

    try {
      await api.post('/invoices/', payload);
      setShowModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        paid_date: '',
        subtotal: '',
        status: 'Draft',
        description: 'Initial payment',
        notes: ''
      });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`/invoices/${id}`);
        fetchInvoices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}`, { status });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Project Invoices</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Generate Invoice</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Paid Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 600 }}>{inv.id}</td>
                <td>{inv.date}</td>
                <td>{inv.paid_date}</td>
                <td style={{ fontWeight: 700 }}>₹{inv.total_amount.toLocaleString()}</td>
                <td>
                  <select 
                    value={inv.status} 
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                    className="select"
                    style={{ padding: '0.25rem', height: 'auto', fontSize: '0.875rem' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/invoices/${inv.id}/view`} target="_blank" className="btn btn-secondary" style={{ padding: '0.25rem' }} title="Print / View PDF">
                      <Printer size={16} />
                    </Link>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(inv.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No invoices generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Create Invoice</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem', backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Link to Payment Stage (Optional)</label>
                <select 
                  className="input" 
                  onChange={(e) => {
                    if (e.target.value) {
                      const schedule = schedules.find(s => s.id.toString() === e.target.value);
                      if (schedule) {
                        setFormData({...formData, subtotal: schedule.expected_amount, description: `Payment for: ${schedule.stage_name}`});
                      }
                    }
                  }}
                >
                  <option value="">-- Select a Payment Stage --</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>{s.stage_name} (₹{s.expected_amount.toLocaleString()})</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Selecting a stage will auto-fill the description and subtotal amount.</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Invoice Date *</label>
                  <input type="date" className="input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Paid Date *</label>
                  <input type="date" className="input" required value={formData.paid_date} onChange={e => setFormData({...formData, paid_date: e.target.value})} />
                </div>
              </div>
              
              <div className="input-group">
                <label>Description *</label>
                <input type="text" className="input" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Amount (₹) *</label>
                <input type="number" className="input" required value={formData.subtotal} onChange={e => setFormData({...formData, subtotal: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Notes (Terms, Bank details, etc.)</label>
                <textarea className="input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;
