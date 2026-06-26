import { useState, useEffect } from 'react';
import api from '../utils/api';

const PaymentsTab = ({ projectId }) => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({ stage_name: '', expected_amount: '', due_date: '' });
  const [collectData, setCollectData] = useState({ amount: '', payment_date: '', notes: '' });

  useEffect(() => {
    fetchSchedules();
  }, [projectId]);

  const fetchSchedules = async () => {
    try {
      const res = await api.get(`/payments/project/${projectId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStage = async (e) => {
    e.preventDefault();
    const payload = { ...formData, project_id: projectId };
    if (!payload.due_date) payload.due_date = null;
    
    await api.post('/payments/', payload);
    setShowModal(false);
    setFormData({ stage_name: '', expected_amount: '', due_date: '' });
    fetchSchedules();
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    const payload = { ...collectData };
    if (!payload.payment_date) payload.payment_date = new Date().toISOString().split('T')[0];
    
    await api.post(`/payments/${selectedSchedule.id}/collect`, payload);
    setShowCollectModal(false);
    setCollectData({ amount: '', payment_date: '', notes: '' });
    fetchSchedules();
  };

  const openCollectModal = (schedule) => {
    setSelectedSchedule(schedule);
    const remaining = schedule.expected_amount - schedule.amount_received;
    setCollectData({ amount: remaining > 0 ? remaining : '', payment_date: new Date().toISOString().split('T')[0], notes: '' });
    setShowCollectModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Payment Schedules</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Stage</button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Stage Name</th>
              <th>Expected (₹)</th>
              <th>Received (₹)</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(s => (
              <tr key={s.id}>
                <td>{s.stage_name}</td>
                <td>{s.expected_amount.toLocaleString()}</td>
                <td>{s.amount_received.toLocaleString()}</td>
                <td>{s.due_date || 'N/A'}</td>
                <td>
                  <span className={`badge ${s.status === 'Paid' ? 'badge-success' : s.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`} style={{ backgroundColor: s.status === 'Pending' ? 'var(--danger)' : '' }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  {s.status !== 'Paid' && (
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openCollectModal(s)}>
                      Collect
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No payment stages added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Add Payment Stage</h3>
            <form onSubmit={handleCreateStage}>
              <div className="input-group">
                <label>Stage Name *</label>
                <input className="input" required value={formData.stage_name} onChange={e => setFormData({...formData, stage_name: e.target.value})} placeholder="e.g., Advance Payment" />
              </div>
              <div className="input-group">
                <label>Expected Amount (₹) *</label>
                <input type="number" className="input" required value={formData.expected_amount} onChange={e => setFormData({...formData, expected_amount: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" className="input" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Stage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCollectModal && selectedSchedule && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Collect Payment: {selectedSchedule.stage_name}</h3>
            <form onSubmit={handleCollect}>
              <div className="input-group">
                <label>Amount Received (₹) *</label>
                <input type="number" className="input" required value={collectData.amount} onChange={e => setCollectData({...collectData, amount: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Payment Date *</label>
                <input type="date" className="input" required value={collectData.payment_date} onChange={e => setCollectData({...collectData, payment_date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Notes</label>
                <input className="input" value={collectData.notes} onChange={e => setCollectData({...collectData, notes: e.target.value})} placeholder="e.g., Cheque No. 123456" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCollectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
