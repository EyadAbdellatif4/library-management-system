# 1. Use Node.js base image
FROM node:20-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package.json first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all project files
COPY . .

# 6. Build NestJS app (TS → JS)
RUN npm run build

# 7. Expose app port
EXPOSE 3001

# 8. Run migrations, seed data, and then the app
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && node dist/main"]