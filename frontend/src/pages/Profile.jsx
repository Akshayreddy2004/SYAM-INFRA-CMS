import { useState, useEffect } from 'react';
import { User, Lock, Save, Camera } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = ({ onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [avatarUrl, setAvatarUrl] = useState('');

  // Built-in avatars for easy selection
  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian',
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
      setAvatarUrl(res.data.avatar || defaultAvatars[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return toast.error("New passwords don't match");
    }
    
    try {
      await api.put('/users/me/password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      toast.success('Password updated successfully. Please login again.');
      setTimeout(() => onLogout(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    }
  };

  const saveAvatar = async (url) => {
    setAvatarUrl(url);
    try {
      await api.put('/users/me/avatar', { avatar: url });
      toast.success('Avatar updated successfully');
      // Update local storage so Layout can see it if we were storing it there, but Layout will re-fetch or use state
      window.dispatchEvent(new Event('avatarChanged'));
    } catch (err) {
      toast.error('Failed to update avatar');
    }
  };

  if (!profile) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="page-title">Profile Settings</h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Profile Card */}
        <div className="card" style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', border: '4px solid var(--border-color)' }}>
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile.username}</h3>
          <p style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: '1.5rem' }}>{profile.role}</p>
          
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'left' }}>Choose an Avatar</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {defaultAvatars.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt={`Avatar ${idx}`} 
                onClick={() => saveAvatar(url)}
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  border: avatarUrl === url ? '3px solid var(--accent-color)' : '3px solid transparent',
                  transition: 'var(--transition)'
                }} 
              />
            ))}
          </div>
        </div>

        {/* Password Reset */}
        <div className="card" style={{ flex: '2', minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="input-group">
              <label>Current Password</label>
              <input type="password" required className="input" value={passwords.current_password} onChange={e => setPasswords({...passwords, current_password: e.target.value})} />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input type="password" required className="input" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input type="password" required className="input" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
