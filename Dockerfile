# ─────────────────────────────────────────────
# Stage 1: Build the React / Vite frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app/client

# Install deps (including devDeps for Vite)
COPY client/package*.json ./
RUN npm install

# Copy all client source and build
COPY client/ ./
RUN npm run build
# → output lands in /app/client/dist

# ─────────────────────────────────────────────
# Stage 2: Production image (Node + Express)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install root/server production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy Express server
COPY server/ ./server/

# Copy the built frontend from Stage 1
COPY --from=builder /app/client/dist ./dist

ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

# Use non-root user for security
RUN addgroup -S ww && adduser -S ww -G ww
USER ww

CMD ["node", "server/index.js"]
