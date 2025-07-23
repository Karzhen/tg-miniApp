FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ../../../Downloads/public .
RUN npm run build

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/dist ./dist
# Просто держим контейнер живым
CMD ["tail", "-f", "/dev/null"]