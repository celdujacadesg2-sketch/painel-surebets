import React, { useState, useEffect } from 'react';
import api from '../api';
import './CadastroAfiliado.modern.css';

import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


export default function CadastroAfiliado({ token: propToken }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState(propToken || '');
  const [linkUnico, setLinkUnico] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // Tenta autenticar anonimamente se não houver token
      signInAnonymously(auth).catch(() => {});
    }
    // Escuta mudanças de autenticação para pegar o token
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const t = await user.getIdToken();
        setToken(t);
      }
    });
    return () => unsubscribe();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.post('/afiliados', { nome, email }, { headers });
      setLinkUnico(res.data.link_unico);
      setMsg('Afiliado cadastrado!');
      setTimeout(() => {
        navigate(`/afiliado/${res.data.link_unico}`);
      }, 2000);
    } catch (err) {
      setMsg('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="cadastro-afiliado">
      <h2><span role="img" aria-label="afiliado">👤</span> Cadastro de Afiliado</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required type="email" />
        <button type="submit"><span role="img" aria-label="plus">➕</span> Cadastrar</button>
      </form>
      {msg && <p>{msg}</p>}
      {linkUnico && (
        <div style={{marginTop:16}}>
          <button
            style={{background:'#00ffb0',color:'#18191a',fontWeight:700,padding:'8px 12px',borderRadius:8,cursor:'pointer'}}
            onClick={() => {
              navigator.clipboard.writeText(linkUnico);
            }}
          >
            Copiar Link Único
          </button>
          <div style={{marginTop:8,wordBreak:'break-all',fontSize:14}}>{linkUnico}</div>
          <div style={{marginTop:8,fontSize:13,color:'#00ffb0'}}>Redirecionando para o painel...</div>
        </div>
      )}
    </div>
  );
}
