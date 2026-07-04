# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:alpine3.23 AS build
WORKDIR /app

RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---------- Runtime stage ----------
FROM nginx:stable-alpine3.23 AS runtime

COPY --from=build /app/dist/registree/browser /usr/share/nginx/html

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/env.js.template /etc/nginx/env.js.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV REGISTRY_URL=http://registry:5000
ENV REGISTRY_UI_URL=/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O- http://127.0.0.1/healthz || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
