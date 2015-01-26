[![Stories in Ready](https://badge.waffle.io/columby/www..columby.com.png?label=ready&title=Ready)](http://waffle.io/columby/www.columby.com)

[![Code Climate](https://codeclimate.com/github/columby/www.columby.com/badges/gpa.svg)](https://codeclimate.com/github/columby/www.columby.com)

# Front end for [columby.com](http://columby.com)

This is the front-end for the columby.com website. It is based on [Angularjs](http://www.angularjs.com), using a separate API backend. 

## Installation

Install [gruntJS](http://www.grunjs.com)  

    npm install -g grunt-cli
    npm install
    bower install

Create a file [environment.js] in ./client/config/environment with the proper environment variables. Possible environments: local, development, staging, dist Use grunt serve:environment for creating the right files. E.g. 
    
    grunt serve:local

To create the production version: 

    grunt serve:dist
    
    
## Environment specific
### Local
  UI: localhost:9000
  API: localhost:8000
  
### Development
  UI: columby.dev (alias www.columby.dev
  API: api.columby.dev
  
### Staging / production
  UI: columby.com (alias www.columby.com)
  API: api.columby.com
  
 

[git-model](http://nvie.com/posts/a-successful-git-branching-model/)
