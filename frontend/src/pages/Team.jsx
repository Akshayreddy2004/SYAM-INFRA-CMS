import { useState, useEffect } from 'react';
import { Plus, UserMinus, Shield } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Viewer' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members. Are you an Admin?');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      toast.success('Team member added successfully!');
      setShowModal(false);
      setFormData({ username: '', password: '', role: 'Viewer' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to add user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User removed');
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove user');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Team Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td style={{ fontWeight: 500 }}>{user.username}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="var(--accent-color)" />
                    {user.role}
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-warning'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--danger)' }} 
                    onClick={() => handleDelete(user.id)}
                    title="Remove User"
                    disabled={user.username === 'admin'}
                  >
                    <UserMinus size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No team members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Add Team Member</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Username *</label>
                <input className="input" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Temporary Password *</label>
                <input type="password" className="input" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Role *</label>
                <select className="select" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Manager">Manager (Can Edit)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
