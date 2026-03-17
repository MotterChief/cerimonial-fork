---
name: adicionar-css
description: Adiciona estilos ao projeto seguindo os padroes visuais existentes (globals.css ou CSS Modules)
user_invocable: true
---

# Skill: Adicionar CSS

Use esta skill ao criar ou modificar estilos no projeto.

## Decisao: globals.css vs CSS Module

- **globals.css** (`src/app/globals.css`): para classes reutilizaveis em multiplas paginas/componentes
- **CSS Module** (`Componente.module.css`): para estilos especificos de um unico componente

## Paleta de cores do projeto

```
Primaria:           #667eea
Secundaria:         #764ba2
Gradiente:          linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Background body:    linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
Card background:    white / #fdfdff
Card border:        #eef2f7 / #d2d9e2
Texto principal:    #333
Texto secundario:   #666 / #777
Labels:             #555
Input border:       #ddd
Focus ring:         rgba(102, 126, 234, 0.2)
Sucesso:            #38a169 / #4CAF50
Erro/Danger:        #d32f2f / #e53e3e
Warning:            #e07b00
```

## Padroes de estilo existentes

```css
/* Borders */
border-radius: 8px;     /* inputs, cards internos */
border-radius: 12px;    /* cards */
border-radius: 15px;    /* modais, header */
border-radius: 25px;    /* botoes, nav-tabs */

/* Shadows */
box-shadow: 0 2px 6px rgba(0,0,0,0.1);     /* leve */
box-shadow: 0 5px 15px rgba(0,0,0,0.05);   /* card */
box-shadow: 0 10px 30px rgba(0,0,0,0.1);   /* elevado */
box-shadow: 0 10px 30px rgba(0,0,0,0.2);   /* modal */

/* Transitions */
transition: all 0.3s ease;    /* padrao geral */
transition: all 0.2s ease;    /* hover rapido */

/* Spacing */
padding: 25px;     /* card */
padding: 20px;     /* modal, header */
margin-bottom: 20px;  /* form-group */
gap: 10px;         /* flex/grid gaps */
gap: 20px;         /* grid system */
```

## Breakpoint mobile

```css
@media (max-width: 768px) {
  /* Ajustes mobile aqui */
}
```

## Regras

- Nunca usar Tailwind, Bootstrap ou qualquer framework CSS
- Seguir a paleta de cores existente
- Manter consistencia de border-radius, shadows e transitions
- Hover effects: `translateY(-2px)` + shadow aumentado
- Fonte: herdada do body ('Segoe UI', Tahoma, Geneva, Verdana, sans-serif)
- Scrollbar customizada ja configurada globalmente - nao sobrescrever
- Em mobile, grids colapsam para `1fr`
- Botoes primarios usam o gradiente, secundarios usam `#f0f2f5` com border
