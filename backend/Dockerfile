FROM node:20-alpine

RUN apk add --no-cache git openssl

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

RUN mkdir -p uploads/avatars private/documents uploads/chat

EXPOSE 3001

CMD ["npm", "run", "start:prod"]