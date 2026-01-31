FROM node:20-alpine

RUN apk add --no-cache git openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application
COPY . .

EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]