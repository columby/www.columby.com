# SSL Letsencrypt certificates

## Install

    sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt
    cd /opt/letsencrypt
    sudo service nginx stop
    ./letsencrypt-auto certonly

Result  

    Congratulations! Your certificate and chain have been saved at /etc/letsencrypt/live/columby.com/fullchain.pem. Your cert will expire on 2016-05-29. To obtain a new version of the certificate in the future, simply run Let's Encrypt again.

Configure

    # copy nginx configuration files
    cp /columby/Scripts/config/nginx/* /etc/nginx/sites-available/
    # test configuration
    nginx -t
    # Restart to make changes
    nginx start
    # done!


## Renew certificate

    cd /opt/letsencrypt
    ./letsencrypt-auto certonly --renew


## References
https://community.letsencrypt.org/t/nginx-installation/3502/5
