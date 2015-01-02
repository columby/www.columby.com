#!/usr/bin/env bash

##### VARIABLES #####
source /vagrant/config/parameters.sh

##### FUNCTIONS #####
source /vagrant/functions.sh


# Set locale
echo "[vagrant provisioning] Setting locale..."
sudo locale-gen $LOCALE_LANGUAGE $LOCALE_CODESET


# Set timezone
echo "[vagrant provisioning] Setting timezone..."
echo $TIMEZONE | sudo tee /etc/timezone
sudo dpkg-reconfigure --frontend noninteractive tzdata


# Hostname
echo "[vagrant provisioning] Setting hostname..."
echo "$HOSTNAME" > /etc/hostname
echo $HOSTNAME
hostname $HOSTNAME


# NEWRELIC SERVER MONITOR
echo "[vagrant provisioning] Installing New Relic Monitor"
echo deb http://apt.newrelic.com/debian/ newrelic non-free >> /etc/apt/sources.list.d/newrelic.list
wget -O- https://download.newrelic.com/548C16BF.gpg | apt-key add -
apt-get update
zapt-get install -y newrelic-sysmond
nrsysmond-config --set license_key=66dd2615cf20ca20ed120df1dc8f4fa4234431e3
/etc/init.d/newrelic-sysmond start

## Download and update package lists
echo "[vagrant provisioning] Package manager updates..."
apt-get dist-upgrade

# Tools
echo "[vagrant provisioning] Installing basic tools"
apt-get install -y build-essential git-core curl make openssl unzip



# Postfix
echo "[vagrant provisioning] Installing postfix with mandrill"
echo postfix postfix/mailname string $HOSTNAME | debconf-set-selections
echo postfix postfix/main_mailer_type string 'Internet Site' | debconf-set-selections
apt-get -y install postfix mailutils libsasl2-2 ca-certificates libsasl2-modules
echo "[smtp.mandrillapp.com]    $MANDRILL_USERNAME:$MANDRILL_API_KEY" > /etc/postfix/sasl_passwd
postmap /etc/postfix/sasl_passwd
cat /etc/ssl/certs/Thawte_Premium_Server_CA.pem | sudo tee -a /etc/postfix/cacert.pem
cat /vagrant/config/postfix/main.cf > /etc/postfix/main.cf
service postfix reload && service postfix restart
#echo "This is a test message from ${USER}@${HOSTNAME} at $(date)" | sendmail arn@urbanlink.nl
#mailq  # Should be empty
#tail /var/log/mail.log
#telnet localhost 25


### NGINX
echo "[vagrant provisioning] Installing NGINX"
apt-get install -y nginx
# configuration files for different sites
source /vagrant/config/nginx/columby.com.sh
touch /etc/nginx/conf.d/$HOSTNAME.conf
echo -e $SITE_COLUMBY > /etc/nginx/conf.d/$HOSTNAME.conf
echo -e $SITE_WORKER > /etc/nginx/conf.d/worker.$HOSTNAME.conf
echo -e $SITE_API > /etc/nginx/conf.d/api.$HOSTNAME.conf
service nginx reload && service nginx restart


### NodeJS
echo "[vagrant provisioning] Installing NodeJS"
apt-get install -y nodejs npm nodejs-legacy
npm install -g express forever
npm install -g grunt-cli
npm install -g bower


### DATABASES
echo "[vagrant provisioning] Installing Databases"
sudo apt-get -y install "postgresql-$PG_VERSION-postgis-$PGIS_VERSION"
echo "$postgresql-$PG_VERSION-postgis-$PGIS_VERSION"
echo "$PG_CONF"
# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
# Append to pg_hba.conf to add password auth:
echo "host    all             all             all                     md5" >> "$PG_HBA"
# Explicitly set default client_encoding
echo "client_encoding = utf8" >> "$PG_CONF"
service postgresql restart
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres createdb -O $DB_USER $DB_NAME
sudo -u postgres createdb -O $DB_USER $GEO_DB_NAME
sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" "$GEO_DB_NAME"
# Restart so that all new config is loaded:
service postgresql restart
print_db_usage


## WEBSITES
mkdir /srv/sites
echo "[vagrant provisioning] Setting up websites"
echo "[vagrant provisioning] Setup columby.com"
## www.columby.com
# Clone repo
git clone https://github.com/columby/www.columby.com.git /srv/sites/columby.com
cd /srv/sites/columby.com
npm install
bower install --allow-root
grunt serve

# Add configuration

# Start server


# worker.columby.com

# api.columby.com


### CRON




echo "[vagrant provisioning] Done"


## Download and update package lists
#echo "[vagrant provisioning] Package manager updates..."
#apt-get update
#
## Upgrade installed packages. Info on unattended update: http://askubuntu.com/a/262445
#echo "[vagrant provisioning] Updating installed packages..."
#unset UCF_FORCE_CONFFOLD
#export UCF_FORCE_CONFFNEW=YES
#ucf --purge /boot/grub/menu.lst
#export DEBIAN_FRONTEND=noninteractive
#apt-get -o Dpkg::Options::="--force-confnew" --force-yes -fuy dist-upgrade
#
#
#
#
#
#
###### CLEAN UP #####
#
##sudo dpkg --configure -a # when upgrade or install doesnt run well (e.g. loss of connection) this may resolve quite a few issues
#apt-get autoremove -y # remove obsolete packages


### DOKKU ALTERNATIVE ####
#echo '  ------------------------'
#echo '  --- Installing dokku-alt'
#echo '  ------------------------'
##sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/dokku-alt/dokku-alt/master/bootstrap.sh)"
#echo '  --- dokku-alt installed'
#
## Dokku alt manager
#echo '  ------------------------'
##echo '  --- Installing dokku-alt manager'
#echo '  ------------------------'
##dokku manager:install
#echo '  --- dokku-alt manager installed'
