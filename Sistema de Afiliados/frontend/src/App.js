import React, { useState, useEffect } from 'react';
import './App.css';
import './dark-theme.css';
import './light-theme.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import DashboardAfiliado from './components/DashboardAfiliado';
import DashboardAdmin from './components/DashboardAdmin';
import CadastroAfiliado from './components/CadastroAfiliado';
import PainelHome from './components/PainelHome';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState('');
  const [tema, setTema] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(tema === 'dark' ? 'dark-theme' : 'light-theme');
  }, [tema]);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/admin">Admin</Link> | <Link to="/cadastro">Cadastro Afiliado</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PainelHome />} />
        <Route path="/afiliado/:link_unico" element={<DashboardAfiliado />} />
        <Route path="/admin" element={token ? <DashboardAdmin token={token} /> : <Login onLogin={setToken} />} />
        <Route path="/cadastro" element={<CadastroAfiliado token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;
