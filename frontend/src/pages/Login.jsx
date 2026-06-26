import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import api from '../utils/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('userRole', response.data.role);
      onLogin(response.data.access_token);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--accent-light)', borderRadius: '50%' }}>
              <Briefcase size={32} color="var(--accent-color)" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>SYAM INFRA</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Management System Login</p>
        </div>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--border-radius)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
