
import React, { useState, useMemo } from 'react';
import './PainelAdminVisual.modern.css';

export default function PainelAdminVisual({ relatorio, afiliados, verRelatorio, marcarClientePago }) {
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Filtro de clientes
  const clientesFiltrados = useMemo(() => {
    if (!relatorio || !relatorio.clientes) return [];
    return relatorio.clientes.filter(cliente => {
      const busca = filtroBusca.toLowerCase();
      const matchBusca =
        cliente.nome.toLowerCase().includes(busca) ||
        cliente.email.toLowerCase().includes(busca);
      const matchStatus =
        filtroStatus === 'todos' ? true : filtroStatus === 'pago' ? cliente.pago : !cliente.pago;
      return matchBusca && matchStatus;
    });
  }, [relatorio, filtroStatus, filtroBusca]);

  return (
    <div className="painel-admin">
      <h2><span role="img" aria-label="admin">🛡️</span> Painel Admin</h2>
      <div className="admin-lista">
        <h3><span role="img" aria-label="afiliados">👥</span> Afiliados</h3>
        <ul>
          {afiliados.map(a => (
            <li key={a.id}>
              <b>{a.nome}</b> <span style={{opacity:0.7}}>{a.email}</span>
              <button onClick={() => verRelatorio(a.id)}><span role="img" aria-label="relatorio">📊</span> Ver Relatório</button>
            </li>
          ))}
        </ul>
      </div>
      {relatorio && (
        <div className="admin-relatorio">
          <h4><span role="img" aria-label="clientes">🧑‍💼</span> Clientes cadastrados de {relatorio.afiliado.nome}</h4>
          <div style={{display:'flex',gap:16,marginBottom:16,flexWrap:'wrap'}}>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtroBusca}
              onChange={e => setFiltroBusca(e.target.value)}
              style={{padding:8,borderRadius:8,border:'1.5px solid #00ffb0',background:'#18191a',color:'#fff',minWidth:180}}
            />
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              style={{padding:8,borderRadius:8,border:'1.5px solid #00ffb0',background:'#18191a',color:'#fff'}}>
              <option value="todos">Todos</option>
              <option value="pago">Pagos</option>
              <option value="pendente">Pendentes</option>
            </select>
          </div>
          {clientesFiltrados && clientesFiltrados.length > 0 ? (
            <table style={{width:'100%',marginTop:12,background:'#232526',borderRadius:10}}>
              <thead>
                <tr style={{color:'#00ffb0'}}>
                  <th style={{padding:8}}>Nome</th>
                  <th style={{padding:8}}>Email</th>
                  <th style={{padding:8}}>Data Cadastro</th>
                  <th style={{padding:8}}>Pago</th>
                  <th style={{padding:8}}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(cliente => (
                  <tr key={cliente.id} style={{background:cliente.pago?'#1e2e1e':'#2a2323'}}>
                    <td style={{padding:8}}>{cliente.nome}</td>
                    <td style={{padding:8}}>{cliente.email}</td>
                    <td style={{padding:8}}>{cliente.data_cadastro ? new Date(cliente.data_cadastro).toLocaleDateString() : '-'}</td>
                    <td style={{padding:8, color:cliente.pago?'#00ffb0':'#ffb000', fontWeight:600}}>{cliente.pago ? 'Pago' : 'Pendente'}</td>
                    <td style={{padding:8}}>
                      {!cliente.pago && (
                        <button className="admin-btn" onClick={() => marcarClientePago(cliente.id)}>
                          Marcar como Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{marginTop:18, color:'#ffb000'}}>Nenhum cliente encontrado com os filtros atuais.</div>
          )}
        </div>
      )}
    </div>
  );
}
