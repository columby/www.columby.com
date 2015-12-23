$VERSION=1.2.2

mkdir /srv/columby/$VERSION
cd /srv/columby/$VERSION

git clone https://github.com/columby/www.columby.com.git

npm install
bower install
gulp build

pm2 kill
pm2 start /srv/columby/scripts/pm2/startall.json

service nginx reload

echo 'done';
