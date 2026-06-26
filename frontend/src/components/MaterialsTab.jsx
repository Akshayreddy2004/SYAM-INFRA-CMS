import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import api from '../utils/api';

const MaterialsTab = ({ projectId }) => {
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    total_quantity: '',
    used_quantity: '0',
    unit: 'bags'
  });

  useEffect(() => {
    fetchMaterials();
  }, [projectId]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/materials/`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      total_quantity: parseFloat(formData.total_quantity),
      used_quantity: parseFloat(formData.used_quantity) || 0,
      unit: formData.unit
    };

    try {
      if (editingId) {
        await api.put(`/projects/${projectId}/materials/${editingId}`, payload);
      } else {
        await api.post(`/projects/${projectId}/materials/`, payload);
      }
      closeModal();
      fetchMaterials();
    } catch (err) {
      console.error(err);
      alert('Failed to save material');
    }
  };

  const handleEdit = (material) => {
    setEditingId(material.id);
    setFormData({
      name: material.name,
      total_quantity: material.total_quantity.toString(),
      used_quantity: material.used_quantity.toString(),
      unit: material.unit
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this material?')) {
      try {
        await api.delete(`/projects/${projectId}/materials/${id}`);
        fetchMaterials();
      } catch (err) {
        console.error(err);
        alert('Failed to delete material');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', total_quantity: '', used_quantity: '0', unit: 'bags' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Material Tracking</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Total Quantity</th>
              <th>Used Quantity</th>
              <th>Balance (Remaining)</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => {
              const remaining = material.total_quantity - material.used_quantity;
              let statusText = 'In Stock';
              let statusClass = 'badge-success';
              
              if (remaining <= 0) {
                statusText = 'Out of Stock';
                statusClass = 'badge-warning';
              } else if (remaining < (material.total_quantity * 0.2)) {
                statusText = 'Low Stock';
                statusClass = 'badge-warning';
              }

              return (
                <tr key={material.id}>
                  <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={16} color="var(--text-secondary)" />
                    {material.name}
                  </td>
                  <td>{material.total_quantity}</td>
                  <td>{material.used_quantity}</td>
                  <td style={{ fontWeight: 600, color: remaining <= 0 ? 'var(--danger)' : 'inherit' }}>
                    {remaining}
                  </td>
                  <td>{material.unit}</td>
                  <td>
                    <span className={`badge ${statusClass}`}>{statusText}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none' }} onClick={() => handleEdit(material)} title="Update Usage">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--danger)' }} onClick={() => handleDelete(material.id)} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {materials.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No materials tracked for this project yet. Click "Add Material" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
              {editingId ? 'Update Material Details' : 'Add New Material'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Material Name *</label>
                <input 
                  className="input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Cement, Steel, Sand, Tiles"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Total Quantity (Estimated) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    required 
                    value={formData.total_quantity} 
                    onChange={e => setFormData({...formData, total_quantity: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Unit *</label>
                  <select 
                    className="select" 
                    required 
                    value={formData.unit} 
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="bags">Bags</option>
                    <option value="tons">Tons</option>
                    <option value="sqft">Sq Ft</option>
                    <option value="cft">Cubic Feet</option>
                    <option value="kg">Kg</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>

              {editingId && (
                <div className="input-group" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <label>Currently Used Quantity</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    value={formData.used_quantity} 
                    onChange={e => setFormData({...formData, used_quantity: e.target.value})} 
                  />
                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                    Update this value as material is consumed on site.
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add Material'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;
