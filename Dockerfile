# Stage 1: Build & Generate
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source code
COPY prisma ./prisma
COPY src ./src

# Generate prisma client (for Linux)
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install openssl for prisma in production as well
RUN apk add --no-cache openssl

# Set Timezone to VN
ENV TZ=Asia/Ho_Chi_Minh

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# EXPOSE port
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
