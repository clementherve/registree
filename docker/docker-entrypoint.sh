#!/bin/sh
set -eu

: "${REGISTRY_URL:=http://registry:5000}"
: "${REGISTRY_UI_URL:=/}"

# Strip trailing slash so the template's appended /v2/ doesn't double up
REGISTRY_URL="${REGISTRY_URL%/}"
export REGISTRY_URL

# Normalize to exactly one leading and one trailing slash, e.g. "ui" or "/ui" or
# "/ui/" all become "/ui/", matching the convention <base href> expects.
case "$REGISTRY_UI_URL" in
  /*) ;;
  *) REGISTRY_UI_URL="/${REGISTRY_UI_URL}" ;;
esac
REGISTRY_UI_URL="${REGISTRY_UI_URL%/}/"

envsubst '${REGISTRY_URL}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

envsubst '${REGISTRY_URL}' \
  < /etc/nginx/env.js.template \
  > /usr/share/nginx/html/env.js

# <base href> is read from the DOM by Angular's router at runtime, so rewriting it
# here (rather than baking it in at build time) is enough to serve the app under a
# sub-path (e.g. https://host/ui/) behind a proxy that strips that prefix before
# forwarding to this container.
sed -i "s#<base href=\"/\"[^>]*>#<base href=\"${REGISTRY_UI_URL}\">#" /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
