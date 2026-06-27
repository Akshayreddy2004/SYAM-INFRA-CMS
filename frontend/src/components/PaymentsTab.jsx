import { useState, useEffect } from 'react';
import api from '../utils/api';
import { numberToWords } from '../utils/numberToWords';

const PaymentsTab = ({ projectId }) => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySchedule, setHistorySchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editingId, setEditingId] = useState(null);
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

  const handleSubmitStage = async (e) => {
    e.preventDefault();
    const payload = { ...formData, project_id: projectId };
    if (!payload.due_date) payload.due_date = null;
    
    if (editingId) {
      await api.put(`/payments/${editingId}`, payload);
    } else {
      await api.post('/payments/', payload);
    }
    
    setShowModal(false);
    setEditingId(null);
    setFormData({ stage_name: '', expected_amount: '', due_date: '' });
    fetchSchedules();
  };

  const handleEditStage = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      stage_name: schedule.stage_name,
      expected_amount: schedule.expected_amount,
      due_date: schedule.due_date || ''
    });
    setShowModal(true);
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

  const openHistoryModal = (schedule) => {
    setHistorySchedule(schedule);
    setShowHistoryModal(true);
  };

  const handleDeleteHistory = async (historyId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await api.delete(`/payments/history/${historyId}`);
        setShowHistoryModal(false);
        fetchSchedules();
      } catch (err) {
        console.error(err);
        alert('Failed to delete payment record');
      }
    }
  };

  const handleDeleteLegacy = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this legacy payment?')) {
      try {
        await api.delete(`/payments/${scheduleId}/legacy`);
        setShowHistoryModal(false);
        fetchSchedules();
      } catch (err) {
        console.error(err);
        alert('Failed to delete legacy payment');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Payment Schedules</h3>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ stage_name: '', expected_amount: '', due_date: '' }); setShowModal(true); }}>Add Stage</button>
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
                <td>{s.expected_amount.toLocaleString('en-IN')}</td>
                <td>{s.amount_received.toLocaleString('en-IN')}</td>
                <td>{s.due_date || 'N/A'}</td>
                <td>
                  <span className={`badge ${s.status === 'Paid' ? 'badge-success' : s.status === 'Partial' ? 'badge-warning' : 'badge-danger'}`} style={{ backgroundColor: s.status === 'Pending' ? 'var(--danger)' : '' }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditStage(s)}>
                      Edit
                    </button>
                    {s.status !== 'Paid' && (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openCollectModal(s)}>
                        Collect
                      </button>
                    )}
                    {s.amount_received > 0 && (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openHistoryModal(s)}>
                        History
                      </button>
                    )}
                  </div>
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Edit Payment Stage' : 'Add Payment Stage'}</h3>
            <form onSubmit={handleSubmitStage}>
              <div className="input-group">
                <label>Stage Name *</label>
                <input className="input" required value={formData.stage_name} onChange={e => setFormData({...formData, stage_name: e.target.value})} placeholder="e.g., Advance Payment" />
              </div>
              <div className="input-group">
                <label>Expected Amount (₹) *</label>
                <input type="number" className="input" required value={formData.expected_amount} onChange={e => setFormData({...formData, expected_amount: e.target.value})} />
                {formData.expected_amount && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{numberToWords(formData.expected_amount)}</p>}
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" className="input" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Stage' : 'Save Stage'}</button>
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
                {collectData.amount && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{numberToWords(collectData.amount)}</p>}
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

      {showHistoryModal && historySchedule && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Payment History: {historySchedule.stage_name}</h3>
            
            {historySchedule.history && historySchedule.history.length > 0 ? (
              <table style={{ minWidth: '100%', marginBottom: '1.5rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Notes</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historySchedule.history.map(h => (
                    <tr key={h.id}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{h.payment_date}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>₹{h.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>{h.notes || '-'}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteHistory(h.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : historySchedule.amount_received > 0 ? (
              <table style={{ minWidth: '100%', marginBottom: '1.5rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Notes</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>-</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>₹{historySchedule.amount_received.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Legacy Payment</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteLegacy(historySchedule.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No payments recorded yet.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
