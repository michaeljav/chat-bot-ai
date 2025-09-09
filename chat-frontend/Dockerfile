# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime (nginx) ----
FROM nginx:alpine AS runner

# Copiamos la config estática de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Servimos el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]