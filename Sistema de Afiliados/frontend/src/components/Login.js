import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const token = await userCredential.user.getIdToken();
      onLogin(token);
      setMsg('Login realizado!');
    } catch (err) {
      setMsg('Erro: ' + err.message);
    }
  };

  return (
    <div className="login-box" style={{maxWidth:400,margin:'48px auto',background:'#18191a',color:'#f5f6fa',borderRadius:18,boxShadow:'0 4px 24px #00ffb0a0',padding:'40px 32px',fontFamily:'Roboto,Open Sans,Arial,sans-serif'}}>
      <h2 style={{color:'#00ffb0',fontWeight:700,marginBottom:24}}>Login Admin</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required type="email" style={{marginBottom:16}} />
        <input placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required type="password" style={{marginBottom:24}} />
        <button type="submit" style={{background:'#00ffb0',color:'#18191a',fontWeight:700,padding:'12px 0',width:'100%',borderRadius:8}}>Entrar</button>
      </form>
      {msg && <p style={{marginTop:16}}>{msg}</p>}
    </div>
  );
}
