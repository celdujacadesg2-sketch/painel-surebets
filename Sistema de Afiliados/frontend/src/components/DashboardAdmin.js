import React, { useEffect, useState } from 'react';
import api from '../api';
import PainelAdminVisual from './PainelAdminVisual';
import './PainelAdminVisual.css';

export default function DashboardAdmin({ token }) {
  const [afiliados, setAfiliados] = useState([]);
  const [relatorio, setRelatorio] = useState(null);

  useEffect(() => {
    api.get('/afiliados', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAfiliados(res.data));
  }, [token]);

  const verRelatorio = (id) => {
    api.get(`/relatorio/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRelatorio(res.data));
  };

  const marcarClientePago = (clienteId) => {
    if (!relatorio) return;
    api.post(`/clientes/${clienteId}/pago`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        // Atualiza o relatório após marcar como pago
        verRelatorio(relatorio.afiliado.id);
      });
  };

  return (
    <PainelAdminVisual
      relatorio={relatorio}
      afiliados={afiliados}
      verRelatorio={verRelatorio}
      marcarClientePago={marcarClientePago}
    />
  );
}
