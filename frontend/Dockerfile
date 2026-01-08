FROM node:25-alpine AS base

# Dependencies 
FROM base AS dependencies
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS build 
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Enviroment to build
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjsuser

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjsuser:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjsuser:nodejs /app/.next/static ./.next/static

USER nextjsuser

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0" 
CMD ["node", "server.js"]