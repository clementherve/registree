#!/bin/sh
set -eu

: "${REGISTRY_URL:=http://registry:5000}"

# Strip trailing slash so the template's appended /v2/ doesn't double up
REGISTRY_URL="${REGISTRY_URL%/}"
export REGISTRY_URL

envsubst '${REGISTRY_URL}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
