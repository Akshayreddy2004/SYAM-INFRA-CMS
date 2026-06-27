import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Activity } from 'lucide-react';

const ProgressTab = ({ project, onProgressUpdate }) => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ stage_name: '', percentage_update: '', notes: '' });

  useEffect(() => {
    fetchHistory();
  }, [project.id]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/progress/project/${project.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStage = async (e) => {
    e.preventDefault();
    const payload = { ...formData, project_id: project.id, percentage_update: parseInt(formData.percentage_update) };
    
    try {
      const res = await api.post('/progress/', payload);
      setShowModal(false);
      setFormData({ stage_name: '', percentage_update: '', notes: '' });
      fetchHistory();
      
      // Update parent component's progress
      onProgressUpdate(payload.percentage_update);
    } catch (err) {
      console.error(err);
      alert('Failed to add progress stage.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Progress Updates</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Log completed stages to automatically update overall project progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={project.progress_percentage >= 100}>
          Record Completed Stage
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((record) => (
          <div key={record.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--success-bg)', padding: '0.75rem', borderRadius: '50%', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{record.stage_name}</h4>
                <span className="badge badge-success">+{record.percentage_update}%</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {new Date(record.update_date).toLocaleString('en-IN')}
              </p>
              {record.notes && <p style={{ backgroundColor: 'var(--bg-color)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid var(--border-color)' }}>{record.notes}</p>}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius)', border: '1px dashed var(--border-color)' }}>
            No stages recorded yet. Click "Record Completed Stage" to start tracking progress.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Record Completed Stage</h3>
            <div style={{ backgroundColor: 'var(--accent-color)20', color: 'var(--accent-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Current Project Progress: <strong>{project.progress_percentage}%</strong>
            </div>
            <form onSubmit={handleAddStage}>
              <div className="input-group">
                <label>Stage Name *</label>
                <input className="input" required value={formData.stage_name} onChange={e => setFormData({...formData, stage_name: e.target.value})} placeholder="e.g., Foundation, Framing, Site Clearance" />
              </div>
              <div className="input-group">
                <label>Percentage Contribution to Project *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="number" min="1" max={100 - project.progress_percentage} className="input" required value={formData.percentage_update} onChange={e => setFormData({...formData, percentage_update: e.target.value})} placeholder="e.g., 20" style={{ flex: 1 }} />
                  <span style={{ fontWeight: 600 }}>%</span>
                </div>
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                  Maximum allowed: {100 - project.progress_percentage}%
                </small>
              </div>
              <div className="input-group">
                <label>Notes</label>
                <textarea className="textarea" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Optional remarks..."></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Stage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;
