FROM node:20-alpine

# Install required system dependencies
RUN apk add --no-cache git openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before installing dependencies (needed for postinstall hook)
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy application source code
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:dev"]
