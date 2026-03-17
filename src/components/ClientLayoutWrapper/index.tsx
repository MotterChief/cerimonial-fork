'use client';

import React, { useEffect } from 'react';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

const ClientLayoutWrapper: React.FC<ClientLayoutWrapperProps> = ({ children }) => {
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      if (isMobile && target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        // Pequeno atraso para permitir que o teclado virtual suba e a tela se ajuste
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    };

    // Adiciona o listener de foco na fase de captura
    document.addEventListener('focus', handleFocus, true);

    // Limpa o listener ao desmontar o componente
    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  return <>{children}</>;
};

export default ClientLayoutWrapper;
