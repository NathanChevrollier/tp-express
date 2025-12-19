# syntax=docker/dockerfile:1
FROM node:18-bullseye-slim


WORKDIR /usr/src/app

# install system deps needed by Prisma (OpenSSL, ca-certificates)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl curl \
	&& rm -rf /var/lib/apt/lists/*

# copy package files first so Docker can cache installs
COPY package*.json ./

# install all deps (we need dev deps to run `prisma generate` at build time)
RUN npm install

# copy app sources (including prisma schema)
COPY . .

# generate Prisma client from schema
RUN npx prisma generate

# remove devDependencies to keep image small
RUN npm prune --production

# create a non-root user (for better security) — use Debian-compatible commands
RUN groupadd --system appgroup \
	&& useradd --system --no-create-home --gid appgroup --shell /usr/sbin/nologin appuser \
	&& chown -R appuser:appgroup /usr/src/app
USER appuser

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]