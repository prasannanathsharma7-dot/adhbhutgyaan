# Adhbhut Gyaan backend — Cloud Run container.
# This ONLY runs the API (server/index.js -> api/*.js). The website itself
# (the React/Vite frontend) stays on Vercel; this container has no frontend code.

FROM node:20-slim

WORKDIR /app

# Copy only what the backend needs to install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the actual backend code.
COPY api ./api
COPY server ./server

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server/index.js"]
