FROM node:20-alpine

RUN apk add --no-cache git openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npm run prisma:generate

COPY . .

RUN mkdir -p uploads/avatars uploads/documents

EXPOSE 3001

CMD ["npm", "run", "start:dev"]