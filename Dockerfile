FROM node:20

# Dependências para rodar navegadores no Linux
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libasound2 \
    && npx playwright install-deps chromium

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila o TypeScript para a pasta dist (opcional se usar ts-node)
RUN npx tsc

# Inicia o servidor pelo Index (que testa o banco antes)
CMD ["npx", "ts-node", "src/index.ts"]