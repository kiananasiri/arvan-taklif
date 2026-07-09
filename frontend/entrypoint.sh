#!/bin/sh
echo "window.ENV_BACKEND_URL = '${BACKEND_URL}';" > /usr/share/nginx/html/env.js
exec nginx -g 'daemon off;'
