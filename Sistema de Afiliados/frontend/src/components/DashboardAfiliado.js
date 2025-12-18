import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import PainelAfiliadoVisual from './PainelAfiliadoVisual';
import './PainelAfiliadoVisual.css';

export default function DashboardAfiliado() {
  const { link_unico } = useParams();
  const [dados, setDados] = useState(null);

  useEffect(() => {
    api.get(`/dashboard/${link_unico}`)
      .then(res => setDados(res.data));
  }, [link_unico]);

  if (!dados) return <div>Carregando...</div>;

  return <PainelAfiliadoVisual dados={dados} />;
}
