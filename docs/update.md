# Update

Update system

    sudo apt-get update
    sudo apt-get dist-upgrade
    sudo apt-get autoremove

Fetch and install code

    cd /srv/columby/htdocs/www
    git reset --hard origin/$BRACH
    git pull
    git checkout $BRANCH
    npm install
    bower install
    gulp
    
    cd /srv/columby/scripts/pm2
    pm2 kill
    pm2 start columby_api.js
    pm2 start columby_worker.js
    pm2 start columby_files.js

    service nginx reload

Check the logs  

    pm2 logs
