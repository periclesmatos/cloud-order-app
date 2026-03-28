# Cloud Order Frontend

[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.1-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.2.2-blue)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.12-green)](https://zustand-demo.pmnd.rs/)
[![Axios](https://img.shields.io/badge/Axios-1.13.6-yellow)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#licença)

## 📌 Visão Geral

O **Cloud Order Frontend** é uma aplicação web moderna desenvolvida para gerenciar pedidos, clientes e produtos. A interface foi projetada com foco em usabilidade, responsividade e integração eficiente com a API backend. Este projeto utiliza tecnologias modernas do ecossistema JavaScript para garantir uma experiência de usuário fluida e de alta performance.

## 🏗️ Arquitetura

A arquitetura do frontend é modular e segue boas práticas de desenvolvimento, promovendo organização e reutilização de código:

- **Componentes**: Divididos entre reutilizáveis (ex.: `Navbar`, `CartSummary`) e específicos de páginas.
- **Páginas**: Representam as telas principais da aplicação, como login, dashboard e checkout.
- **Hooks**: Encapsulam lógica reutilizável, como validação de formulários e notificações.
- **Serviços**: Centralizam a comunicação com a API, garantindo consistência nas chamadas.
- **Gerenciamento de Estado**: Implementado com Zustand, permitindo persistência e compartilhamento de estados globais.

Essa estrutura facilita a manutenção e escalabilidade do projeto.

## 📡 Integração com API

A comunicação com a API backend é gerenciada pelo Axios, configurado no arquivo `apiClient.js`:

- **Configuração Base**: A URL da API é definida via variáveis de ambiente (`VITE_API_URL`).
- **Headers Dinâmicos**: Tokens de autenticação são adicionados automaticamente às requisições.
- **Serviços**: Funções específicas encapsulam chamadas aos endpoints, como login e gerenciamento de pedidos.

Essa abordagem centralizada simplifica a integração e reduz duplicação de código.

## 🌐 Gerenciamento de Estado

O gerenciamento de estado global é realizado com Zustand, garantindo simplicidade e eficiência:

- **Persistência**: Estados sensíveis, como autenticação, são armazenados localmente com o middleware `persist`.
- **Stores**:
  - `useAdminAuthStore`: Gerencia autenticação de administradores.
  - `useCustomerAuthStore`: Gerencia autenticação de clientes.
- **Benefícios**: Reduz complexidade e facilita o compartilhamento de dados entre componentes.

## 📂 Estrutura de Pastas

A organização do projeto segue uma estrutura clara e intuitiva:

- **src/**:
  - **components/**: Componentes reutilizáveis, como `Navbar` e `RequireAuth`.
  - **hooks/**: Hooks customizados, como `useToast` e `useValidateMe`.
  - **pages/**: Páginas principais, como `HomePage`, `CheckoutPage` e `AdminDashboard`.
  - **service/**: Serviços para comunicação com a API.
  - **store/**: Gerenciamento de estado com Zustand.
  - **utils/**: Funções utilitárias, como formatação e status de pedidos.

Essa estrutura modular facilita a navegação e manutenção do código.

## ⚙️ Como Executar o Projeto

### Pré-requisitos

- Node.js 20+

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_REQUIRE_HTTPS=true
```

### Execução

```bash
npm run dev
```

## 🚀 Tecnologias Utilizadas

- **React**: Framework para construção da interface do usuário.
- **Vite**: Ferramenta de build e desenvolvimento rápido.
- **Tailwind CSS**: Framework de estilização utilitário.
- **Zustand**: Gerenciamento de estado global.
- **Axios**: Comunicação com APIs.

## 📈 Melhorias Futuras

- **Testes End-to-End**: Implementação de testes com Playwright ou Cypress para validar fluxos completos.
- **Acessibilidade**: Melhorias para atender aos padrões WCAG.
- **Monitoramento**: Integração com ferramentas como Sentry para rastreamento de erros e desempenho.

## 👨‍💻 Autor

Desenvolvido por Pericles Matos.
