import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Invoices from './pages/Invoices';
import InvoiceView from './pages/InvoiceView';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          isAuthenticated ? <Layout toggleTheme={toggleTheme} theme={theme} onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="team" element={<Team />} />
          <Route path="profile" element={<Profile onLogout={handleLogout} />} />
        </Route>
        
        {/* Invoice View - outside of normal layout to allow clean printing */}
        <Route path="/invoices/:id/view" element={
          isAuthenticated ? <InvoiceView /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;
