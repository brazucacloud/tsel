FROM node:18-bookworm-slim

ENV NODE_ENV=production

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências do sistema (Debian/Ubuntu)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências somente de produção
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads logs backups

# Definir permissões
RUN chown -R node:node /app
USER node

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando para iniciar a aplicação
CMD ["npm", "start"] 