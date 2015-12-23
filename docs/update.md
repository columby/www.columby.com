# Update

Update system

    sudo apt-get update
    sudo apt-get dist-upgrade


Fetch and install code

    cd /srv/columby/htdocs/www
    git reset --hard origin/$BRACH
    git pull
    git checkout $BRANCH
    npm install
    bower install
    pm2 kill
    pm2 start /pm2/start_api.js
    pm2 start /pm2/start_worker.js
    pm2 start /pm2/start_files.js
    service nginx reload

Check the logs  

    pm2 logs
