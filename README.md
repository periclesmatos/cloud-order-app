# Cloud Order - Frontend

Plataforma de e-commerce para gerenciamento de pedidos e produtos com painel administrativo.

## 🚀 Setup Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

**Desenvolvimento:**

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

**Produção:**
Arquivo `.env.production` já vem pré-configurado com HTTPS obrigatória.

### 3. Iniciar desenvolvimento

```bash
npm run dev
```

Acesso: http://localhost:5173

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Visualiza build de produção localmente
- `npm run lint` - Executa ESLint
- `npm run format` - Formata código com Prettier
- `npm run test` - Executa testes com Vitest

## 🛠️ Stack Tecnológico

- **React 19** - UI components
- **React Router 7** - Roteamento
- **Zustand 5** - State management
- **Tailwind CSS 4** - Estilo
- **Lucide React** - Ícones
- **Axios** - HTTP client
- **Zod** - Validação de dados
- **Vite** - Build tool

## 🔐 Segurança

- ✅ Bearer JWT para autenticação
- ✅ HTTPS obrigatória em produção
- ✅ Variáveis de ambiente para configuração
- ✅ SessionStorage para tokens
- ✅ Validação de dados com Zod

## 📱 Funcionalidades

### Cliente

- 🛒 Catálogo de produtos
- 📦 Carrinho de compras
- 📋 Fazer pedidos
- 📊 Ver histórico de pedidos
- 📍 Gerenciar endereços

### Admin

- 📈 Dashboard com analytics
- 🏷️ Gerenciamento de produtos (CRUD)
- 📦 Filtros por período e status
- ⚠️ Alertas de estoque baixo
- 👥 Gestão de clientes (planejado)

## 🌍 Variáveis de Ambiente

| Variável           | Dev                   | Prod                        | Descrição          |
| ------------------ | --------------------- | --------------------------- | ------------------ |
| `VITE_API_URL`     | http://localhost:3000 | https://api.cloud-order.com | URL da API backend |
| `VITE_API_TIMEOUT` | 10000                 | 10000                       | Timeout HTTP em ms |

## 📝 Commits

Commits seguem o padrão:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `security:` Melhoria de segurança
- `style:` Formatação
- `config:` Configuração
- `docs:` Documentação

## 🚀 Deploy

**Vercel/Netlify:**

1. Add `.env.production` com `VITE_API_URL=https://api.seu-dominio.com`
2. Git push
3. Build automático

**Docker:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "preview"]
```

---

**Última atualização:** 25/03/2026
