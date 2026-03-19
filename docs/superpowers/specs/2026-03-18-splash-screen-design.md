# Splash Screen — CerimoniasPro Landing Page

**Data:** 2026-03-18
**Status:** Aprovado

## Contexto

A tela inicial (`/`) do sistema exibia apenas uma mensagem genérica "Bem-vindo" com um link para login. O objetivo é substituí-la por uma splash screen interna que apresenta as funcionalidades do sistema para usuários não autenticados.

## Escopo

- **Tipo:** Splash screen interna (não é página de marketing pública)
- **Visível para:** Apenas usuários não autenticados
- **Comportamento de autenticação:** Mantido — se o usuário já estiver logado, redireciona para `/agenda`

## Arquitetura

**Arquivos:**
- `src/app/page.tsx` — substituído pela splash screen
- `src/app/page.module.css` — estilos isolados (novo arquivo CSS Module)

Nenhum componente global novo. Nenhuma alteração em `globals.css`.

## Estrutura da Página

```
<main>
  ├── <section> hero
  │     ├── ícone (fas fa-gem) com fundo gradiente primário
  │     ├── <h1> "CerimoniasPro"
  │     └── <p> subtítulo
  ├── <section> features
  │     └── grid de 8 feature-cards
  │           ├── <i> ícone Font Awesome
  │           ├── <h3> nome do módulo
  │           └── <p> descrição curta
  ├── <Link href="/login"> botão CTA (.btn)
  └── <footer> nome + versão
</main>
```

## Conteúdo dos Cards

| Módulo      | Ícone FA              | Descrição                                          |
|-------------|----------------------|----------------------------------------------------|
| Agenda      | fa-calendar-alt      | Gerencie seus eventos com datas, locais e status   |
| Clientes    | fa-users             | Cadastre e acompanhe seus clientes                 |
| Fornecedores| fa-store             | Organize seus fornecedores e contatos              |
| Documentos  | fa-file-alt          | Armazene e acesse documentos dos eventos           |
| Financeiro  | fa-wallet            | Controle receitas, despesas e pagamentos           |
| Checklists  | fa-check-square      | Crie listas de tarefas por evento                  |
| Roteiros    | fa-route             | Monte roteiros detalhados para o dia do evento     |
| Convidados  | fa-user-friends      | Gerencie lista de convidados e mesas               |

## Estilo Visual

- **Paleta:** variáveis CSS existentes (`--bg-surface`, `--border-primary`, `--color-primary`, `--gradient-primary`, `--shadow-sm`, `--shadow-md`, `--text-primary`, `--text-secondary`, `--text-muted`)
- **Sem cores hardcoded** — dark/light mode automático via variáveis semânticas
- **Hero:** ícone grande com fundo `--gradient-primary`, título H1, subtítulo
- **Cards:** fundo `--bg-surface`, borda `--border-primary`, sombra `--shadow-sm`; hover → `--shadow-md` + borda `--color-primary`; ícone com cor `--color-primary`
- **CTA:** botão `.btn` global centralizado, texto "Acessar Plataforma"
- **Footer:** texto `--text-muted`, "CerimoniasPro · v1.0"

## Responsividade

| Breakpoint     | Colunas do grid |
|----------------|-----------------|
| Desktop (>768px) | 4 colunas     |
| Tablet (≤768px)  | 2 colunas     |
| Mobile (≤480px)  | 1 coluna      |

## Restrições

- Sem CSS frameworks
- Sem novos arquivos CSS globais
- Sem `'use server'`
- Manter lógica de redirecionamento existente (`useAuth`)
