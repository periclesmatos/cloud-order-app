FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio final - imagem de produção
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expor porta 8080
EXPOSE 8080

# Comando padrão para iniciar a aplicação
CMD ["serve", "-s", "dist", "-l", "8080"]
