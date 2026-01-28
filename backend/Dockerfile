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

# Create uploads directories
RUN mkdir -p uploads/avatars uploads/documents

EXPOSE 3001

# Start the app (migration/seed handled by docker-compose)
CMD ["npm", "run", "start:dev"]