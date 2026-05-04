FROM node:20

# 1. Instala dependências do sistema para o Linux
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libasound2

WORKDIR /app

# 2. Copia arquivos de dependência
COPY package*.json ./
# Copia a pasta prisma (necessária para o generate ler o schema.prisma)
COPY prisma ./prisma/

# 3. Instala as bibliotecas e o tsx
RUN npm install && npm install -g tsx

# 4. GERA O CLIENTE PRISMA (Sincroniza o código com o banco)
RUN npx prisma generate

# 5. BAIXA O NAVEGADOR (Para o crawler funcionar)
RUN npx playwright install chromium --with-deps

# 6. Copia o restante do código
COPY . .

# 7. Comando de inicialização
CMD ["tsx", "src/scheduler.ts"]
