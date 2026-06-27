import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileBarChart, LogOut, Moon, Sun, Menu, Shield, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const Layout = ({ toggleTheme, theme, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'Viewer';
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');

  useEffect(() => {
    // Fetch profile to get avatar
    const fetchAvatar = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data.avatar) setAvatar(res.data.avatar);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvatar();

    const handleAvatarChange = () => fetchAvatar();
    window.addEventListener('avatarChanged', handleAvatarChange);
    return () => window.removeEventListener('avatarChanged', handleAvatarChange);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: Briefcase },
    { path: '/invoices', label: 'Invoices', icon: Receipt },
    { path: '/reports', label: 'Reports', icon: FileBarChart },
  ];

  if (userRole === 'Admin') {
    navItems.push({ path: '/team', label: 'Team', icon: Shield });
  }

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={24} color="var(--accent-color)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>SYAM INFRA</h2>
        </div>
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
                  fontWeight: 500,
                  transition: 'var(--transition)'
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius)',
              textDecoration: 'none',
              color: location.pathname === '/profile' ? 'white' : 'var(--text-secondary)',
              backgroundColor: location.pathname === '/profile' ? 'var(--accent-color)' : 'transparent',
              fontWeight: 500,
              transition: 'var(--transition)'
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
              <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            Profile
          </Link>
          <button 
            onClick={onLogout}
            style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.5rem' }} 
            className="btn btn-secondary"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              style={{ display: 'inline-flex', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Management System</h1>
          </div>
          <div>
            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
