# Cloud Order - Frontend

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-yellowgreen)](https://zustand-demo.pmnd.rs/)
[![Axios](https://img.shields.io/badge/Axios-1.4.0-orange)](https://axios-http.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0.18-yellowgreen)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#licença)

## Visão Geral do Projeto

Cloud Order é uma plataforma moderna de e-commerce projetada para gerenciamento eficiente de pedidos e produtos. Ela oferece uma interface responsiva para clientes e um painel administrativo completo para análise, gerenciamento de produtos e rastreamento de pedidos.

## Arquitetura do Frontend

O frontend é construído com uma arquitetura modular, garantindo uma clara separação de responsabilidades:

- **Roteamento**: Gerenciado com React Router, dividindo rotas entre seções de cliente e administrador.
- **Gerenciamento de Estado**: Zustand é usado para estado global, com stores separados para autenticação, produtos e pedidos.
- **Integração com API**: Centralizada em uma camada de serviços usando Axios para comunicação consistente e segura.
- **Estilização**: TailwindCSS é aplicado para um design utilitário e responsivo.

## Tecnologias

- **React 19**: Biblioteca de UI baseada em componentes.
- **React Router DOM 7**: Roteamento declarativo para SPA.
- **Vite 5**: Ferramenta de build rápida com HMR.
- **Zustand 5**: Gerenciamento de estado leve.
- **TailwindCSS 4**: Framework CSS utilitário.
- **Axios**: Cliente HTTP para requisições API.

## Gerenciamento de Estado (Zustand)

Zustand é usado para gerenciar o estado global de forma eficiente:

- **Stores**:
  - `adminAuthStore`: Gerencia o estado de autenticação do administrador.
  - `customerAuthStore`: Gerencia a autenticação do cliente.
  - `productStore`: Gerencia dados de produtos e operações do carrinho.
  - `orderStore`: Rastreia o último pedido.
- **Recursos**:
  - Middleware como `persist` garante persistência de sessão.
  - Ações encapsulam lógica, mantendo os componentes focados na renderização.

## Estilização (TailwindCSS)

TailwindCSS é amplamente utilizado para um design consistente e responsivo:

- **Classes Utilitárias**: Classes como `bg-slate-50`, `text-slate-900` e `rounded-md` garantem uma estilização coesa.
- **Design Responsivo**: Breakpoints como `sm:px-6 lg:px-8` adaptam layouts para diferentes tamanhos de tela.
- **Gradientes Customizados**: Aplicados em componentes como `StatCard` para apelo visual.

## Integração com API

A comunicação com a API é centralizada na pasta `service/`:

- **`apiClient.js`**: Configura o Axios com URL base, timeout e validação HTTPS.
- **Serviços**:
  - `productService`: Gerencia chamadas de API relacionadas a produtos.
  - `orderService`: Gerencia requisições relacionadas a pedidos.
  - `dashboardService`: Busca dados do painel administrativo.
- **Tratamento de Erros**: Registra erros e fornece valores padrão quando necessário.

## Estrutura de Componentes

Os componentes são organizados para reutilização e separação de responsabilidades:

- **`components/`**: Componentes compartilhados como `Navbar` e `RequireAuth`.
- **`pages/`**: Componentes específicos de páginas agrupados por funcionalidade (ex.: `admin`, `checkout`).
- **Padrões**:
  - Componentes funcionais com destructuring de props.
  - Separação de UI e lógica usando Zustand e serviços.

## Como Executar

### Pré-requisitos

- **Node.js 20+**
- **npm 10+** ou **yarn 4+**

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/periclesmatos/cloud-order-app.git
   cd cloud-order-app
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em [http://localhost:5173](http://localhost:5173).

## Funcionalidades

- **Interface do Cliente**:
  - Catálogo de produtos com filtros e busca.
  - Carrinho interativo com atualizações em tempo real.
  - Processo de checkout simplificado.
  - Histórico de pedidos e rastreamento de status.
- **Painel Administrativo**:
  - Análise de vendas e métricas de desempenho.
  - Gerenciamento de produtos e pedidos.
  - Alertas de estoque e insights de clientes.

## Decisões Técnicas

- **Zustand**: Escolhido pela simplicidade e baixo overhead comparado ao Redux.
- **TailwindCSS**: Garante desenvolvimento rápido com estilização consistente.
- **Vite**: Proporciona builds rápidos e hot module replacement para uma melhor experiência de desenvolvimento.
- **Camada de Serviços**: Centraliza a lógica de API, melhorando a manutenibilidade e reutilização.

## Boas Práticas

- **Gerenciamento de Estado**: Encapsular lógica em stores do Zustand para manter os componentes limpos.
- **Estilização**: Usar classes utilitárias do TailwindCSS para um design consistente e responsivo.
- **Tratamento de Erros**: Registrar erros nos serviços e fornecer feedback amigável ao usuário.
- **Design de Componentes**: Separar UI e lógica para melhor manutenibilidade.

## Melhorias Futuras

- **Testes**: Aumentar a cobertura de testes com Vitest para componentes e serviços críticos.
- **Performance**: Otimizar chamadas de API com mecanismos de cache.
- **Acessibilidade**: Garantir que todos os componentes atendam aos padrões WCAG.
- **Internacionalização**: Adicionar suporte para múltiplos idiomas.

---

Desenvolvido usando React, TailwindCSS e Vite.
