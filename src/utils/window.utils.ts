import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  // Inicializa o estado.
  // Verifica se window existe para não quebrar em SSR (Next.js/Gatsby)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Garante que o código só rode no cliente (navegador)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Define o valor inicial corretamente assim que o componente monta
    setIsMobile(mediaQuery.matches);

    const handleMediaChange = (event: { matches: boolean | ((prevState: boolean) => boolean); }) => setIsMobile(event.matches);

    // Moderno: addEventListener (suporte a navegadores mais recentes)
    // Se precisar de suporte a IE muito antigo, usa-se 'addListener'
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  return isMobile;
};