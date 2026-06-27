import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Home, Hammer, PaintBucket, PenTool } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { numberToWords } from '../utils/numberToWords';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get('client');

  const [formData, setFormData] = useState({ 
    name: '', client_name: '', client_phone: '', location: '', value: '', start_date: '', expected_completion: '', project_type: 'Cement + Interiors'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/projects/');
      setProjects(pRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.start_date) payload.start_date = null;
    if (!payload.expected_completion) payload.expected_completion = null;
    
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
      } else {
        await api.post('/projects/', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      client_name: project.client_name || '',
      client_phone: project.client_phone || '',
      location: project.location || '',
      value: project.value,
      start_date: project.start_date || '',
      expected_completion: project.expected_completion || '',
      project_type: project.project_type || 'Cement + Interiors'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete project');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', client_name: '', client_phone: '', location: '', value: '', start_date: '', expected_completion: '', project_type: 'Cement + Interiors' });
  };

  let filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (clientFilter) {
    filteredProjects = filteredProjects.filter(p => p.client_name === clientFilter);
  }
  if (typeFilter) {
    filteredProjects = filteredProjects.filter(p => p.project_type === typeFilter);
  }



  // Calculate Revenue Summaries
  const summaryStats = [
    { type: 'Cement + Interiors', icon: Home, color: 'var(--primary-color)' },
    { type: 'Cement Work Only', icon: Hammer, color: 'var(--warning)' },
    { type: 'Interiors', icon: PaintBucket, color: 'var(--success)' },
    { type: 'Designs And Supervison', icon: PenTool, color: '#3b82f6' }
  ].map(cat => {
    const pList = projects.filter(p => p.project_type === cat.type);
    const revenue = pList.reduce((sum, p) => sum + p.value, 0);
    return { ...cat, count: pList.length, revenue };
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {summaryStats.map((stat, idx) => (
          <div 
            key={idx} 
            className="card" 
            onClick={() => setTypeFilter(typeFilter === stat.type ? null : stat.type)}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem', 
              padding: '1.5rem',
              cursor: 'pointer',
              border: typeFilter === stat.type ? `2px solid ${stat.color}` : '2px solid transparent',
              transition: 'all 0.2s ease',
              transform: typeFilter === stat.type ? 'translateY(-2px)' : 'none',
              boxShadow: typeFilter === stat.type ? `0 4px 12px ${stat.color}30` : 'var(--shadow)'
            }}
          >
            <div style={{ 
              backgroundColor: `${stat.color}15`, 
              color: stat.color, 
              padding: '1rem', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.type}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>₹{stat.revenue.toLocaleString('en-IN')}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.count} Project{stat.count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search projects..." 
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
              <th>Project Name</th>
              <th>Type</th>
              <th>Client Details</th>
              <th>Location</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td style={{ fontWeight: 500 }}>{project.name}</td>
                <td>
                  <span className="badge badge-info" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {project.project_type}
                  </span>
                </td>
                <td>
                  <div>{project.client_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{project.client_phone}</div>
                </td>
                <td>{project.location}</td>
                <td>₹{project.value.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                    {project.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link to={`/projects/${project.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Manage</Link>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none' }} onClick={() => handleEdit(project)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--danger)' }} onClick={() => handleDelete(project.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Project Name *</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Client Name *</label>
                  <input className="input" required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Client Phone</label>
                  <input className="input" value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Project Type *</label>
                <select className="select" required value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value})}>
                  <option value="Cement + Interiors">Cement + Interiors</option>
                  <option value="Cement Work Only">Cement Work Only</option>
                  <option value="Interiors">Interiors</option>
                  <option value="Designs And Supervison">Designs And Supervison</option>
                </select>
              </div>
              <div className="input-group">
                <label>Location</label>
                <input className="input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Project Value (₹) *</label>
                <input type="number" className="input" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                {formData.value && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{numberToWords(formData.value)}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" className="input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Expected Completion</label>
                  <input type="date" className="input" value={formData.expected_completion} onChange={e => setFormData({...formData, expected_completion: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Project' : 'Save Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
