---
name: criar-utils
description: Cria funcoes utilitarias seguindo o padrao do projeto
user_invocable: true
---

# Skill: Criar Utils

Use esta skill ao criar funcoes utilitarias em `src/utils/`.

## Convencao de arquivo

- Nome: `[tema].utils.ts` (ex: `date.utils.ts`, `currency.utils.ts`)
- Exportar funcoes nomeadas (nao default export)
- Path alias: `@/utils/[nome].utils`

## Utils existentes no projeto

| Arquivo | Funcoes | Uso |
|---|---|---|
| `date.utils.ts` | `toDate(date)`, `createLocalDate(dateString)` | Conversao de datas |
| `currency.utils.ts` | `parseCurrency(formatted)`, `formatCurrency(number, type?)` | Moeda BRL |
| `phone.utils.ts` | `applyPhoneMask(digits)` | Mascara telefone BR |
| `window.utils.ts` | `useIsMobile()` | Hook para detectar mobile (768px) |
| `situationStyles.utils.ts` | `getBorderCardStyle()`, `getSituationStyle()` | Estilos por situacao |
| `pdfBody.utils.ts` | `pdfGuestsAccess()` | Geracao de PDF |

## Regras

- Verificar se a funcao ja existe em algum util antes de criar
- Funcoes puras (sem side effects) quando possivel
- Se for um hook React (usa useState, useEffect), prefixar com `use` e colocar em `window.utils.ts` ou criar `[tema].hooks.ts`
- Tipar parametros e retorno
- Nao criar utils para logica que so sera usada em um lugar
