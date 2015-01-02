#!/usr/bin/env bash

server {
    listen 80;

    server_name api.$HOSTNAME;

    location / {
        proxy_pass http://localhost:{NGINX_API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
