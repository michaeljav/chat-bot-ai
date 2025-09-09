#!/bin/sh
set -eu

: "${API_ORIGIN:=http://host.docker.internal:3000}"
echo "Using API_ORIGIN=${API_ORIGIN}"

# Renderiza la plantilla al conf final
envsubst '\$API_ORIGIN' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Arranca Nginx en primer plano
nginx -g 'daemon off;'
