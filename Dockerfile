# ----------------------------
# Stage 1: Build React client
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install root dependencies (needed for postinstall to run client install)
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
RUN npm install && npm install --prefix client

# Copy client source and build
COPY client ./client
RUN npm run build --prefix client

# ----------------------------
# Stage 2: Production server
# ----------------------------
FROM node:20-alpine

WORKDIR /app

# Install only production server dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts

# Copy server code
COPY server ./server

# Copy built React app from builder
COPY --from=builder /app/client/dist ./client/dist

# Copy static assets (dino images)
COPY assets ./assets

ENV NODE_ENV=production

# Railway provides PORT at runtime
EXPOSE ${PORT:-3333}

CMD ["node", "server/index.js"]
