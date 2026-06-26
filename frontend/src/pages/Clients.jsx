import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', address: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients/');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
      } else {
        await api.post('/clients/', formData);
      }
      closeModal();
      fetchClients();
    } catch (err) {
      console.error(err);
      alert('Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      mobile: client.mobile || '',
      email: client.email || '',
      address: client.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
        alert('Failed to delete client');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', mobile: '', email: '', address: '' });
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Clients</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search clients..." 
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, color: 'var(--text-primary)' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Projects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.mobile}</td>
                <td>{client.email}</td>
                <td>
                  <Link to={`/projects?client=${client.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Link>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none' }} onClick={() => handleEdit(client)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--danger)' }} onClick={() => handleDelete(client.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No clients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Edit Client' : 'Add New Client'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Client Name *</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Mobile</label>
                  <input className="input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Address</label>
                <textarea className="textarea" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Client' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
