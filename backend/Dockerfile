FROM node:20-alpine

RUN apk add --no-cache git openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy rest of the application
COPY . .

EXPOSE 3001

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]