import React from 'react';
import './PainelAfiliadoVisual.modern.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PainelAfiliadoVisual({ dados }) {
  // Monta o link direto para a página de registro
  const linkFinal = `https://surecapta.com/register?aff_id=${dados?.afiliado?.link_unico || ''}`;
  const vendas = Array.isArray(dados?.vendas) ? dados.vendas : [];
  return (
    <div className="painel-afiliado painel-card" style={{minWidth:320,maxWidth:400,padding:'48px 56px',alignItems:'center',boxShadow:'0 0 32px #00ffb088',margin:'48px auto'}}>
      <h2><span role="img" aria-label="user">👤</span> Bem-vindo, <span style={{color:'#00ffb0'}}>{dados?.afiliado?.nome || ''}</span></h2>
      <div className="afiliado-info">
        <p><span role="img" aria-label="email">📧</span> <b>Email:</b> {dados?.afiliado?.email || ''}</p>
        <p><span role="img" aria-label="cliques">🖱️</span> <b>Cliques:</b> {dados?.cliques ?? 0}</p>
        <p><span role="img" aria-label="vendas">💰</span> <b>Vendas:</b> {vendas.length}</p>
        <p><span role="img" aria-label="comissao">💸</span> <b>Comissão:</b> R$ {(dados?.comissao ?? 0).toFixed(2)}</p>
      </div>
      <div className="afiliado-btns" style={{marginTop:32, marginBottom:24}}>
        <button
          className="afiliado-btn"
          style={{background:'#00ffb0',color:'#18191a',fontWeight:700,padding:'12px 28px',borderRadius:12,boxShadow:'0 0 16px #00ffb0cc',fontSize:'1.1rem'}}
          onClick={() => {
            navigator.clipboard.writeText(linkFinal);
          }}
        >
          <span role="img" aria-label="link">🔗</span> <span style={{color:'#00ffb0',fontWeight:700}}>Copiar Link de Afiliado</span>
        </button>
        <button className="afiliado-btn" style={{background:'#232526',color:'#00ffb0',fontWeight:700,padding:'12px 28px',borderRadius:12,boxShadow:'0 0 16px #00ffb0cc',fontSize:'1.1rem',border:'1.5px solid #00ffb0'}}>
          <span role="img" aria-label="relatorio">📊</span> <span style={{color:'#00ffb0',fontWeight:700}}>Ver Relatório</span>
        </button>
      </div>

      {/* Lista de clientes cadastrados */}
      {Array.isArray(dados?.clientes) && dados.clientes.length > 0 && (
        <div style={{marginTop:32, width:'100%'}}>
          <h3 style={{color:'#00ffb0',marginBottom:12}}><span role="img" aria-label="clientes">🧑‍💼</span> Clientes Cadastrados</h3>
          <table style={{width:'100%',background:'#232526',borderRadius:10}}>
            <thead>
              <tr style={{color:'#00ffb0'}}>
                <th style={{padding:8}}>Nome</th>
                <th style={{padding:8}}>Email</th>
                <th style={{padding:8}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dados.clientes.map(cliente => (
                <tr key={cliente.id} style={{background:cliente.pago?'#1e2e1e':'#2a2323'}}>
                  <td style={{padding:8}}>{cliente.nome}</td>
                  <td style={{padding:8}}>{cliente.email}</td>
                  <td style={{padding:8, color:cliente.pago?'#00ffb0':'#ffb000', fontWeight:600}}>
                    {cliente.pago ? 'Pago' : 'Pendente'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:10, color:'#ffb000', fontSize:13}}>
            Clientes ficam como <b>Pendente</b> até o fim do teste grátis e só contam comissão após pagamento confirmado pelo admin.
          </div>
        </div>
      )}

      <h3 style={{color:'#00ffb0',marginTop:24}}><span role="img" aria-label="grafico">📈</span> Vendas</h3>
      <div className="afiliado-grafico">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={vendas.map(v => ({ data: v.data, valor: v.valor }))}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#00ffb0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
