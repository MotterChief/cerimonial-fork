---
name: aprimorar-tela
description: Aprimora uma tela existente mantendo a consistencia visual e os padroes do projeto
user_invocable: true
---

# Skill: Aprimorar Tela

Use esta skill ao modificar ou melhorar uma pagina existente.

## Antes de comecar

1. Leia o arquivo da pagina em `src/app/[rota]/page.tsx`
2. Leia o service relacionado em `src/services/[entidade].service.ts`
3. Identifique quais componentes reutilizaveis ja existem no projeto

## Componentes reutilizaveis disponiveis

| Componente | Import | Uso |
|---|---|---|
| `<Modal>` | `@/components/Modal` | Modal com formId ou handleSave |
| `<ConfirmActionModal>` | `@/components/ConfirmActionModal` | Confirmacao de acao destrutiva |
| `<ExpandableCard>` | `@/components/ExpandableCard` | Card colapsavel |
| `<HeaderHelper>` | `@/components/HeaderHelper` | Mensagem de ajuda no topo |
| `<LoadingOverlay>` | `@/components/LoadingOverlay` | Loading fullscreen |
| `<Select>` | `@/components/Select` | Dropdown react-select |
| `<MultiSelect>` | `@/components/MultiSelect` | Multi-selecao |
| `<PhoneInput>` | `@/components/fields/PhoneInput` | Input telefone BR |
| `<CurrencyInput>` | `@/components/fields/CurrencyInput` | Input moeda BRL |
| `<TextArea>` | `@/components/fields/TextArea` | Textarea com contador |
| `<DatePicker>` | `@/components/fields/DatePicker` | Seletor de data |
| `<Switcher>` | `@/components/fields/Switcher` | Toggle switch |
| `<InfoCard>` | `@/components/InfoCard` | Card informativo |

## Classes CSS globais disponiveis (globals.css)

**Layout:** `container`, `grid`, `grid-1`, `grid-2`, `grid-3`
**Cards:** `card`, `card-background`, `card-consult`, `card-consult-expandable`, `card-inferior`
**Botoes:** `btn`, `btn-secondary`, `btn-small`, `btn-full-mobile`, `btn-outline`, `btn-danger`, `btn-delete-icon`, `btn-edit-icon`
**Forms:** `form-group`, `form-check`
**Listas:** `list-container`, `supplier-card`
**Modal:** `modal-overlay`, `modal-content`, `modal-header`, `modal-footer`, `modal-children`
**Textos:** `query-message`, `counter`, `helper-message`, `status-badge`
**Checklist:** `checklist-item`, `checklist-item.completed`

## Regras ao aprimorar

- Preferir classes globais de `globals.css` a criar CSS inline ou novos estilos
- Se precisar de CSS novo especifico da pagina, usar CSS Module
- Manter o padrao de grid: `grid grid-2` para layout com form + lista
- Manter animacoes com Framer Motion (nao usar CSS transitions para aparecer/desaparecer)
- Icones sempre via Font Awesome: `<i className="fas fa-icon-name"></i>`
- Cor primaria: `#667eea` | Gradiente: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Notificacoes: sempre `addNotification()` para feedback do usuario
- Loading: `setLoading(true/false)` ou `<LoadingOverlay isLoading={loading} />`
- Responsividade: breakpoint mobile em `768px`, testar com `useIsMobile()`
- Nao remover funcionalidades existentes ao aprimorar
