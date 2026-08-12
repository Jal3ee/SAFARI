import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import NewRequest from './pages/NewRequest';
import History from './pages/History';
import Admin from './pages/Admin';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="glass-container">
      <div className="logos">
        <img src="/agm-logo.png" alt="AGM Logo" className="logo-img" />
        <img src="/hcga-logo.png" alt="HCGA Logo" className="logo-img" />
      </div>
      <nav>
        {isAdmin ? (
          <>
            <Link to="/" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Exit Admin</Link>
          </>
        ) : (
          <>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>New Request</Link>
            <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link>
          </>
        )}
      </nav>
    </header>
  );
};

const Layout = ({ children, isAdmin = false }) => (
  <div className={isAdmin ? 'admin-wrapper' : 'app-wrapper'}>
    <Navbar />
    <main>
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><NewRequest /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
        <Route path="/admin" element={<Layout isAdmin={true}><Admin /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
