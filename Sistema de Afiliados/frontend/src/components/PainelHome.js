
import React, { useState } from 'react';
import './PainelHome.modern.css';

export default function PainelHome() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginNome, setLoginNome] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  const handleLoginAfiliado = async (e) => {
    e.preventDefault();
    setLoginMsg('');
    try {
      // Buscar afiliado pelo nome e email
      const res = await fetch('http://localhost:4000/api/afiliados');
      const afiliados = await res.json();
      const encontrado = afiliados.find(a => a.nome.trim().toLowerCase() === loginNome.trim().toLowerCase() && a.email.trim().toLowerCase() === loginEmail.trim().toLowerCase());
      if (encontrado) {
        window.location.href = `/afiliado/${encontrado.link_unico}`;
      } else {
        setLoginMsg('Afiliado não encontrado. Verifique os dados.');
      }
    } catch (err) {
      setLoginMsg('Erro ao buscar afiliado.');
    }
  };

  return (
    <div className="painel-home" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'90vh',paddingTop:0}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:40}}>
        <div style={{fontSize:'2.6rem',fontWeight:900,color:'#00ffb0',marginBottom:8,letterSpacing:1}}>
          <span role="img" aria-label="rocket">🚀</span> Bem-vindo!
        </div>
        <div style={{fontSize:'1.25rem',color:'#fff',opacity:0.9,fontWeight:500,marginBottom:0}}>Escolha uma opção para acessar o sistema:</div>
      </div>
      <div className="painel-cards" style={{gap:64}}>
        <div className="painel-card" style={{minWidth:320,maxWidth:400,padding:'48px 56px',alignItems:'center',boxShadow:'0 0 32px #00ffb088'}}>
          <div style={{fontSize:'2.2rem',marginBottom:10}}><span role="img" aria-label="admin">🛡️</span></div>
          <div style={{fontWeight:700,fontSize:'1.3rem',color:'#00ffb0',marginBottom:10}}>Painel Admin</div>
          <div style={{color:'#fff',fontWeight:500,marginBottom:12,opacity:0.95}}>Gerencie afiliados, vendas e relatórios.</div>
          <div style={{color:'#ffb000',fontWeight:600,marginBottom:18,fontSize:'1rem'}}>Acesso restrito somente ao administrador</div>
          <a href="/admin" className="painel-btn" style={{fontSize:'1.15rem',padding:'16px 36px',borderRadius:12,boxShadow:'0 0 16px #00ffb0cc'}}>
            <span role="img" aria-label="painel">📊</span> Acessar Admin
          </a>
        </div>
        <div className="painel-card" style={{minWidth:320,maxWidth:400,padding:'48px 56px',alignItems:'center',boxShadow:'0 0 32px #00ffb088'}}>
          <div style={{fontSize:'2.2rem',marginBottom:10}}><span role="img" aria-label="afiliado">👤</span></div>
          <div style={{fontWeight:700,fontSize:'1.3rem',color:'#00ffb0',marginBottom:10}}>Painel Afiliado</div>
          <div style={{color:'#fff',fontWeight:500,marginBottom:24,opacity:0.95}}>Acompanhe seus cliques, vendas e comissões.</div>
          <a href="/cadastro" className="painel-btn" style={{fontSize:'1.15rem',padding:'16px 36px',borderRadius:12,boxShadow:'0 0 16px #00ffb0cc',marginBottom:12}}>
            <span role="img" aria-label="plus">➕</span> Quero ser Afiliado
          </a>
          <button className="painel-btn" style={{fontSize:'1.08rem',padding:'12px 28px',borderRadius:10,background:'#232526',color:'#00ffb0',border:'1.5px solid #00ffb0',marginTop:0,boxShadow:'0 0 8px #00ffb055'}} onClick={() => setShowLogin(true)}>
            <span role="img" aria-label="login">🔑</span> Já sou afiliado (Login)
          </button>
        </div>
      </div>

      {/* Modal de login afiliado */}
      {showLogin && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#000a',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#18191a',padding:32,borderRadius:16,boxShadow:'0 0 32px #00ffb088',minWidth:320,maxWidth:360}}>
            <h3 style={{color:'#00ffb0',marginBottom:18}}><span role="img" aria-label="login">🔑</span> Login do Afiliado</h3>
            <form onSubmit={handleLoginAfiliado} style={{display:'flex',flexDirection:'column',gap:14}}>
              <input placeholder="Nome" value={loginNome} onChange={e => setLoginNome(e.target.value)} required style={{padding:10,borderRadius:8,border:'1px solid #00ffb0',background:'#232526',color:'#f5f6fa'}} />
              <input placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required type="email" style={{padding:10,borderRadius:8,border:'1px solid #00ffb0',background:'#232526',color:'#f5f6fa'}} />
              <button type="submit" style={{background:'#00ffb0',color:'#18191a',fontWeight:700,padding:'12px 0',borderRadius:8,marginTop:8}}>Entrar</button>
              <button type="button" onClick={()=>setShowLogin(false)} style={{background:'#232526',color:'#00ffb0',border:'1.5px solid #00ffb0',borderRadius:8,padding:'10px 0',marginTop:4}}>Cancelar</button>
            </form>
            {loginMsg && <div style={{color:'#ffb000',marginTop:10,fontSize:14}}>{loginMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
