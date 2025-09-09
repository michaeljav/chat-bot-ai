
# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias con cache limpio
COPY package*.json ./
RUN npm ci

# Copia el código y construye
COPY . .
RUN npm run build

# ---------- Runtime stage (Nginx) ----------
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Necesario para reemplazar variables de entorno en la plantilla (envsubst)
RUN apk add --no-cache gettext

# Copia archivos estáticos generados por Vite
COPY --from=build /app/dist ./

# Plantilla de Nginx con el proxy a /chat
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Script de arranque que renderiza la plantilla con API_ORIGIN
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Valor por defecto: backend corriendo en el host (Win/Mac).
# En Linux usarás --add-host para que host.docker.internal funcione.
ENV API_ORIGIN=http://host.docker.internal:3000

ENTRYPOINT ["/docker-entrypoint.sh"]
