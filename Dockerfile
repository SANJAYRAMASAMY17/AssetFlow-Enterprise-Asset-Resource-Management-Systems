
# Stage 1: Build the application
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Dummy URL for Prisma client generation during image build
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Generate Prisma client
RUN npx prisma generate

# Supabase configuration
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build React frontend and Express backend
RUN npm run build


# Stage 2: Production application
FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependencies and application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Application port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
