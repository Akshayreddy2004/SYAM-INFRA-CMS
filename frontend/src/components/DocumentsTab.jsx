import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Download, File as FileIcon } from 'lucide-react';

const DocumentsTab = ({ projectId }) => {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '' });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/project/${projectId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('type', formData.type);
    data.append('file', file);

    try {
      await api.post(`/documents/project/${projectId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowModal(false);
      setFormData({ name: '', type: '' });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    }
  };

  const handleDownload = (docId) => {
    // In a real app with auth, you might need to handle this differently
    // For now, open in new tab or download directly using the API base URL
    window.open(`${api.defaults.baseURL}/documents/download/${docId}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Documents</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Upload Document</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {documents.map(doc => (
          <div key={doc.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--border-color)', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                <FileIcon size={24} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {doc.type} • {new Date(doc.upload_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleDownload(doc.id)} title="Download">
              <Download size={16} />
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No documents uploaded yet.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Upload Document</h3>
            <form onSubmit={handleUpload}>
              <div className="input-group">
                <label>Document Name *</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Floor Plan v1" />
              </div>
              <div className="input-group">
                <label>Document Type *</label>
                <select className="select" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="">Select Type</option>
                  <option value="Contract">Contract</option>
                  <option value="Blueprint">Blueprint/Drawing</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Permit">Permit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>File *</label>
                <input 
                  type="file" 
                  className="input" 
                  required 
                  ref={fileInputRef}
                  onChange={e => setFile(e.target.files[0])} 
                  style={{ padding: '0.5rem 0' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
