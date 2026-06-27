import { useState, useEffect } from 'react';
import api from '../utils/api';

const ExpensesTab = ({ projectId }) => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ date: '', category: '', amount: '', description: '' });

  useEffect(() => {
    fetchExpenses();
  }, [projectId]);

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/project/${projectId}`);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    const payload = { ...formData, project_id: projectId };
    
    await api.post('/expenses/', payload);
    setShowModal(false);
    setFormData({ date: '', category: '', amount: '', description: '' });
    fetchExpenses();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Expenses</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Expense</button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {e.category}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{e.amount.toLocaleString('en-IN')}</td>
                <td>{e.description || '-'}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No expenses recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Add Expense</h3>
            <form onSubmit={handleCreateExpense}>
              <div className="input-group">
                <label>Date *</label>
                <input type="date" className="input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Category *</label>
                <select className="select" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="Materials">Materials</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Permits">Permits</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="input-group">
                <label>Amount (₹) *</label>
                <input type="number" className="input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input className="input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g., Cement bags" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
