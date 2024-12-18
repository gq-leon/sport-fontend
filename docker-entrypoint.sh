#!/bin/sh

# 替换环境变量
envsubst '${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# 执行 CMD
exec "$@" 