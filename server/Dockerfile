# Cloud Run / Docker image for the Basera API.
# Multi-stage keep image small (~110 MB).
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
    elif [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev; fi

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cloud Run injects PORT; default to 4000 for local docker run.
ENV PORT=4000
EXPOSE 4000
CMD ["node", "server.js"]
