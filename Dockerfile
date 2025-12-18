# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /usr/src/app

# dependencies: copy package files first for cache layer
COPY package*.json ./

RUN npm install --production

# copy app sources
COPY . .

# create a non-root user (for better security)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]