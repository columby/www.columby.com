serve assets using nginx static files, serve all others using a nodejs server

Add new config file

    /etc/nginx/sites-available/files.columby.com

config file contents:

    server {
      listen 80;
      server_name files.columby.com;

      access_log /var/log/columby/files.columby.com_access.log;
      error_log  /var/log/columby/files.columby.com_error.log;

      charset utf-8;

      location / {
        rewrite ^ https://$host$request_uri? permanent;
      }
    }

    server {
      listen       443 ssl;
      server_name  files.columby.com;

      access_log    /var/log/columby/files.columby.com_access.log;
      error_log     /var/log/columby/files.columby.com_error.log;

      ssl_certificate  /dir/ssl.pem;
      ssl_certificate_key /dir/server.key;
      charset utf-8;

      ssl_protocols TLSv1.2 TLSv1.1 TLSv1;


      location / {
        proxy_pass http://localhost:8500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
      }
    }

Make site available in nginx

    ln -s /var/nginx/sites-enabled/files.columby.com /var/sites-available/files.columby.com
