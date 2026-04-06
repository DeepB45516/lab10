# ── Stage 1: Base image ──────────────────────────────────
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Health check — Docker will monitor this
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/tasks || exit 1

# Start the application
CMD ["node", "src/server.js"]
