import React from "react";

const whatsappNumber = "5521998405571";
const whatsappMessage =
  "Olá! Vim pelo painel Surecapta e gostaria de renovar o meu plano !";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const WhatsAppButton: React.FC = () => (
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco no WhatsApp"
    style={{
      position: "fixed",
      right: 24,
      bottom: 24,
      zIndex: 1000,
      backgroundColor: "#25D366",
      borderRadius: "50%",
      width: 56,
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      transition: "box-shadow 0.2s",
      cursor: "pointer",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="white"
      aria-hidden="true"
    >
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.646.867 5.09 2.34 7.09L4 29l7.184-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.5c-1.97 0-3.89-.51-5.56-1.48l-.4-.23-4.28 1.38 1.4-4.17-.26-.42A9.97 9.97 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.13-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.68 1.12 2.87.14.18 1.93 2.95 4.68 4.02.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
    </svg>
  </a>
);

export default WhatsAppButton;
