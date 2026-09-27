<div align="center">

# 🔐 Linha & Ponto — Painel Administrativo

**Interface completa para gestão da oficina de costura Lunnexx**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io)

[🔐 Painel em produção](https://d344yz7xjvxwku.cloudfront.net) · [📚 Documentação completa](./TECNOLOGIAS.md)

</div>

---

## ✨ Sobre o projeto

Painel administrativo **completo e profissional** para gestão da oficina de costura Lunnexx.

Interface **elegante** com a mesma identidade visual do site público, focada em **produtividade** — permite gerenciar orçamentos, romaneios de corte, usuários e gerar PDFs profissionais.

### 🎯 Módulos

- **📊 Dashboard** — estatísticas em tempo real (orçamentos, romaneios, peças)
- **📋 Orçamentos** — CRUD completo com filtros, busca e paginação
- **📄 Romaneios** — CRUD + geração de PDF profissional de corte
- **👥 Usuários** — gestão de acessos com roles (ADMIN, MANAGER, VIEWER)
- **⚙️ Configurações** — (em desenvolvimento)

### ✨ Recursos

- **Autenticação JWT** com persistência
- **Rotas protegidas** por role
- **Animações** com Framer Motion
- **Design responsivo** (desktop + mobile)
- **Toasts elegantes** para feedback
- **Componentes reutilizáveis** e tipados

---

## 🚀 Tecnologias

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** — estilização utilitária
- **React Router v7** — roteamento
- **Framer Motion** — animações
- **React Hot Toast** — notificações
- **date-fns** — formatação de datas

---

## 🛠️ Rodando localmente

### Pré-requisitos

- Node.js 20+
- Backend admin rodando em `http://localhost:3334`

### Instalação

```bash
# Clonar
git clone https://github.com/ErisonFelipe/oficina-costura-frontend-adm.git
cd oficina-costura-frontend-adm

# Instalar
npm install

# Rodar
npm run dev
O painel estará em http://localhost:5174.

Credenciais de desenvolvimento
E-mail: admin@oficina.local
Senha:  admin123

Deploy
./deploy.sh

📁 Estrutura
src/
├── components/
│   ├── layout/        # AdminLayout, Sidebar, Topbar
│   └── ui/            # Button, Modal, Badge, StatCard, etc.
├── contexts/          # AuthContext
├── hooks/             # useAuth
├── lib/               # Cliente HTTP com JWT
├── pages/             # Login, Dashboard, Quotes, Romaneios, Users
├── routes/            # AppRoutes, ProtectedRoute
├── types/             # Tipagens
├── App.tsx
└── main.tsx

🎨 Design System
Elemento	 Cor
Fundo principal	#FAF7F2
Fundo cards	#FFFFFF
Acento	#C67B5C
Acento escuro	#A85E42
Texto principal	#2C2825
Texto secundário	#6B6560

Status colors: Pending (âmbar), Progress (azul), Completed (verde), Cancelled (vermelho)

Tipografia: Playfair Display (títulos) + Inter (corpo)

🔐 Autenticação
* Login via POST /api/auth/login
* Token JWT salvo em localStorage
* Interceptor automático de 401
* Rotas protegidas por <ProtectedRoute>
* Autorização por role (ADMIN, MANAGER, VIEWER)

🔗 Projeto completo
Este repositório é 1 de 4 do sistema Lunnexx:

Repositório	Descrição
🌐 Site público	Interface pública
🔐 Painel admin	Este repositório
⚙️ API pública	Backend do site
🛡️ API admin	Backend do painel

📚 Documentação técnica completa: TECNOLOGIAS.md

<div align="center">
Feito com ☕ e dedicação

© 2026 Lunnexx — Oficina de Costura

</div>
