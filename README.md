# CerimoniasPro

Sistema completo de gestão para cerimonialistas, desenvolvido com Next.js 16, React 19, TypeScript e Firebase. Centraliza o controle de eventos, clientes, fornecedores, financeiro e muito mais em uma única plataforma.

Acesso ao app: https://demo-cerimoniaspro.vercel.app/

**Algumas informações foram ocultadas por questões de segurança!**

---

## Funcionalidades

- **Agenda** — Visualização e gestão de todos os eventos agendados
- **Clientes** — Cadastro e histórico completo de clientes
- **Convidados** — Gerenciamento de listas de convidados com geração de QR Code para confirmação de presença
- **Mesas** — Montagem do mapa de mesas com drag-and-drop para alocação de convidados
- **Checklists** — Templates reutilizáveis e checklists personalizados por evento
- **Roteiros** — Criação e gestão de roteiros detalhados para cerimônias
- **Fornecedores** — Cadastro de prestadores de serviço com contatos e especialidades
- **Financeiro** — Controle de receitas, despesas e fluxo de caixa por evento
- **Documentos** — Armazenamento e organização de documentos por evento
- **Tema Dark/Light** — Alternância de tema com persistência de preferência

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Backend / Auth | Firebase 12 (Firestore + Authentication) |
| Animações | Framer Motion |
| Drag & Drop | dnd-kit |
| Tema | next-themes |
| Utilitários | date-fns, react-select, react-datepicker, qrcode |

---

## Arquitetura

```
src/
├── app/             # Rotas (App Router) — cada pasta é uma rota
├── components/      # Componentes reutilizáveis
├── context/         # React Contexts (Auth, Notifications)
├── entities/        # Interfaces base (AbstractEntity)
├── services/        # CRUD Firestore por entidade
├── utils/           # Funções utilitárias
└── lib/             # Configuração do Firebase
```

Toda a persistência é feita no Firestore sob o path `users/{userId}/[collection]`, garantindo isolamento total dos dados por usuário. Eventos possuem subcoleções próprias para convidados e mesas.

---

## Configuração local

### Pré-requisitos

- Node.js 18+
- Projeto no [Firebase Console](https://console.firebase.google.com) com Firestore e Authentication habilitados

### Instalação

```bash
git clone https://github.com/seu-usuario/cerimonial-fork.git
cd cerimonial-fork
npm install
```

### Rodando

```bash
npm run dev      # Servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção
npm run lint     # Lint
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Licença

Este projeto é disponibilizado **exclusivamente como demonstração de portfólio**. Foi desenvolvido sob encomenda para um cliente específico e **não pode ser reutilizado, copiado ou adaptado** para outros projetos sem autorização expressa do autor.
