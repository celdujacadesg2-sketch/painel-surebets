import React from "react";
import { useAuth } from '@/components/providers/';

const whatsappNumber = "21998405571";

export default function BotaoRenovarWhatsapp() {
  const { user } = useAuth();
  const email = user?.email || '';
  const mensagem = encodeURIComponent(
    `Olá! Quero renovar minha assinatura do Surecapta. Meu email cadastrado é: ${email}`
  );
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${mensagem}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      Renovar via WhatsApp
    </a>
  );
}
