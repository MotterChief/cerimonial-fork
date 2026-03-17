---
name: criar-componente
description: Cria um novo componente reutilizavel seguindo a estrutura de pastas e padroes do projeto
user_invocable: true
---

# Skill: Criar Componente

Use esta skill ao criar um novo componente em `src/components/`.

## Checklist

1. Crie a pasta `src/components/NomeComponente/`
2. Crie `index.tsx` com o componente
3. Se precisar de estilos scoped, crie `NomeComponente.module.css`

## Template do Componente

```tsx
import React, { ReactNode } from 'react';
// import styles from './NomeComponente.module.css'; // se usar CSS Module

interface NomeComponenteProps {
  // props tipadas aqui
}

const NomeComponente: React.FC<NomeComponenteProps> = ({ /* props */ }) => {
  return (
    // JSX aqui
  );
};

export default NomeComponente;
```

## Template do CSS Module (quando necessario)

```css
/* NomeComponente.module.css */
.container {
  /* estilos scoped */
}
```

## Regras

- Pasta propria com `index.tsx` — nunca arquivo solto em `components/`
- Interface de props com sufixo `Props` (ex: `ExpandableCardProps`)
- Sempre `export default`
- Animacoes: usar `framer-motion` (`AnimatePresence`, `motion.div`)
- Icones: Font Awesome via className `fas fa-*` (nunca instalar pacotes de icone React)
- Estilos:
  - Usar classes globais de `globals.css` quando disponivel (card, btn, form-group, etc)
  - CSS Modules (`.module.css`) apenas para estilos especificos do componente
  - Nunca criar novos arquivos `.css` globais
- Cor primaria do projeto: `#667eea`
- Se for componente de campo de formulario, colocar em `src/components/fields/NomeCampo/`
