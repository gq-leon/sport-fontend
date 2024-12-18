#!/bin/sh

echo 'start run entrypoint script'

# 替换环境变量
envsubst '${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo 'end run entrypoint script'

# 执行 CMD
exec "$@" 