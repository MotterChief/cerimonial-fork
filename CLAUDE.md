# CerimoniasPro - CLAUDE.md

## Sobre o Projeto
Sistema de gestao para cerimonialistas. Stack: Next.js 16 (App Router), React 19, TypeScript 5, Firebase 12.
Idioma da UI: Portugues brasileiro. Idioma do codigo: ingles (nomes de variaveis, interfaces, funcoes).

## Comandos

```bash
npm run dev       # Dev server com Turbopack
npm run build     # Build de producao
npm run lint      # ESLint
```

## Arquitetura de Pastas

```
src/
  app/             # Paginas (App Router) - cada pasta = uma rota
  components/      # Componentes reutilizaveis (cada um em pasta propria com index.tsx)
  context/         # React Contexts (AuthContext, NotificationContext)
  entities/        # Interfaces base (AbstractEntity)
  services/        # CRUD Firestore por entidade
  utils/           # Funcoes utilitarias
  lib/             # Configuracao Firebase
```

## Convencoes de Codigo

### Services (src/services/)
- Cada service exporta: interface da entidade, DTO de criacao, e funcoes CRUD
- DTO de criacao: `type EntityDTO = Omit<Entity, 'id' | keyof AbstractEntity>`
- Todas entidades extendem `AbstractEntity` (idCreateUser, createdAt, idUpdateUser, updatedAt)
- Path Firestore: `users/{userId}/documents` (subcollection do usuario)
- Primeiro param sempre `userId: string`
- add: spread `...data` + campos AbstractEntity com `serverTimestamp()`
- get: `orderBy('createdAt', 'desc')` (ou campo relevante)
- update: spread `...data` + `updatedAt: serverTimestamp()` + `idUpdateUser: userId`
- delete: `deleteDoc` direto
- Validacao: `if (!userId) throw new Error('...')`

### Paginas (src/app/[rota]/page.tsx)
- Sempre `'use client'` no topo
- Hooks obrigatorios: `useAuth()`, `useNotification()`
- State padrao: lista de itens, loading, searchTerm, isModalOpen, editingItem, isDeleteModalOpen, itemToDelete
- Form state: `initialFormState` como objeto literal, resetado apos submit
- `fetchItems()` async com try/catch + `addNotification` para erros
- `useEffect` com dependencia em `user` para fetch inicial
- Layout: `<HeaderHelper>` + `<div className="grid grid-2">` com ExpandableCard (form) + card-consult (lista)
- Busca: filtro local por nome com `searchTerm`
- Edicao: `<Modal>` com `formId` linkando ao form interno
- Exclusao: `<ConfirmActionModal>` com confirmacao

### Componentes (src/components/)
- Cada componente em pasta propria: `NomeComponente/index.tsx`
- CSS scoped: `NomeComponente.module.css` (quando necessario)
- Interface de props tipada com sufixo `Props`
- Exportacao: `export default NomeComponente`
- Animacoes: Framer Motion (`AnimatePresence`, `motion.div`)

### Estilos
- CSS global em `globals.css` - sem framework CSS
- Classes globais: `card`, `btn`, `form-group`, `grid grid-2`, `supplier-card`, `list-container`, `modal-overlay`, `query-message`, `counter`, `helper-message`
- Cor primaria: `var(--color-primary)` (#667eea) | Gradiente: `var(--gradient-primary)`
- **Dark/Light mode**: variaveis CSS semanticas em `:root` (light) sobrescritas em `[data-theme='dark']`. Gerenciado por `next-themes` via `ThemeProvider`. NUNCA usar cores hardcoded — sempre usar `var(--nome-da-variavel)`.
- Variaveis principais: `--bg-surface`, `--bg-input`, `--text-primary`, `--text-secondary`, `--border-primary`, `--color-primary`, `--gradient-primary`, `--overlay-bg`, `--shadow-md`
- Breakpoint mobile: `768px`
- Icones: Font Awesome 6 via CDN (classes `fas fa-*`)
- CSS Modules para estilos especificos de componentes

### Componentes Reutilizaveis Disponiveis
- `<Modal>` - modal com formId ou handleSave, animacao Framer Motion
- `<ConfirmActionModal>` - confirmacao de acao destrutiva
- `<ExpandableCard>` - card colapsavel com titulo e icone
- `<HeaderHelper>` - mensagem de ajuda no topo da pagina
- `<LoadingOverlay>` - loading fullscreen
- `<Select>` / `<MultiSelect>` - dropdowns com react-select estilizado
- `<PhoneInput>` - input telefone BR (+55)
- `<CurrencyInput>` - input moeda BRL
- `<TextArea>` - textarea com contador de caracteres
- `<DatePicker>` - seletor de data
- `<Switcher>` - toggle switch
- `<InfoCard>` - card informativo com icone e valor
- `<ExpandableCard>` - card com collapse (collapsible prop)
- `<ThemeSwitcher>` - botao de alternancia dark/light mode (renderiza no Header)
- `<ThemeProvider>` - wrapper next-themes (envolve o layout raiz)

### Notifications
- `addNotification(mensagem, 'success' | 'error' | 'warning')`
- Sempre usar em try/catch de operacoes CRUD

### Firestore
- Dados autenticados: `users/{userId}/[collection]`
- Subcollections de evento: `users/{userId}/events/{eventId}/guests`, `.../tables`
- Dados publicos: `publicGuestPages/{token}` (colecao raiz)

## Nao fazer
- Nao usar CSS frameworks (Tailwind, Bootstrap, etc)
- Nao criar arquivos `.css` globais novos - usar `globals.css` ou CSS Modules
- Nao usar `'use server'` - o projeto e client-side com Firebase
- Nao alterar a estrutura do AbstractEntity
- Nao criar services sem seguir o padrao DTO existente
- Nao adicionar dependencias sem necessidade clara

## Auto-evolucao deste documento e das skills

Este CLAUDE.md e as skills em `.claude/skills/` sao documentos vivos. Ao trabalhar no projeto, voce DEVE atualiza-los quando:

1. **Novo padrao adotado**: Se implementarmos algo de forma diferente do documentado e o usuario confirmar que e o novo padrao, atualize a convencao correspondente neste arquivo e na skill relacionada.
2. **Novo componente reutilizavel criado**: Adicione-o na secao "Componentes Reutilizaveis Disponiveis" acima e na tabela da skill `aprimorar-tela.md`.
3. **Novo util criado**: Adicione-o na tabela de utils existentes na skill `criar-utils.md`.
4. **Nova classe CSS global criada**: Adicione-a na secao "Estilos" acima e na skill `adicionar-css.md`.
5. **Nova dependencia instalada**: Documente-a aqui se for relevante para o desenvolvimento (ex: nova lib de UI).
6. **Nova skill necessaria**: Se surgir um tipo de tarefa recorrente que nao tem skill, crie uma nova em `.claude/skills/`.
7. **Convencao obsoleta**: Se um padrao documentado nao for mais usado, remova ou atualize.

### Como atualizar
- Ao finalizar uma tarefa que introduz algo novo, verifique se este arquivo e as skills refletem a mudanca.
- Prefira editar o existente a duplicar informacao.
- Mantenha este arquivo conciso — detalhes extensos devem ficar nas skills, nao aqui.
