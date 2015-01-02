# Dockerfile for http://columby.com
FROM debian:wheezy

# Set timezone
#RUN dpkg-reconfigure locales && \
#    locale-gen C.UTF-8 && \
#    /usr/sbin/update-locale LANG=C.UTF-8
#ENV LC_ALL C.UTF-8

# Install packages
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    build-essential

# Install nodejs
# https://github.com/joyent/node/wiki/installing-node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions
RUN \
  cd /tmp && \
  curl -sL https://deb.nodesource.com/setup | bash - && \
  apt-get install -y nodejs

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["bash"]

# Install myqsl

# Install postgresql / postGIS

