# Adhbhut Gyaan backend — Cloud Run container.
# This ONLY runs the API (server/index.js -> api/*.js). The website itself
# (the React/Vite frontend) stays on Vercel; this container has no frontend code.

FROM node:20-slim

WORKDIR /app

# Copy only what the backend needs to install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the actual backend code. Source folder is named "backend" in the repo
# (Vercel only auto-detects a top-level "api" folder as its own serverless
# functions, so it's renamed here to let Vercel's rewrite hand off to this
# Cloud Run service instead - but inside the container it's placed back at
# ./api so every internal require('./_db') etc. path stays unchanged.)
COPY backend ./api
COPY server ./server
COPY src/data ./src/data

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server/index.js"]
