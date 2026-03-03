FROM node:18-alpine AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


FROM deps AS builder

WORKDIR /app
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
COPY knexfile.ts ./knexfile.ts
COPY migrations ./migrations

RUN yarn build
RUN yarn install --frozen-lockfile --production && yarn cache clean


FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["sh", "-c", "node ./node_modules/.bin/knex migrate:latest && node dist/src/server.js"]