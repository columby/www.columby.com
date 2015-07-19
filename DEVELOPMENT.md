# Development notes

## Grunt
Build:
  build:development   --> Minified version with config for staging site (dev.columby.com)
  build:staging       --> Minified version with config for staging site (dev.columby.com)
  build:production    --> Minified version with config for production site (www.columby.com)

Serve:
  serve:local         --> Uses local development files + local api (localhost)
  serve:development   --> Uses local development files + development api (dev.columby.com)
  serve:staging       --> Uses local built for staging files + development api (dev.columby.com)
  serve:production    --> Uses local Build for staging files + production api (www.columby.com)


## Login and authentication
Using satellizer. JWT keys. Authorization header for API calls.

## App routing
Using ui-router.
Router takes care of routes, access permissions for states and body classes for a state.

## Permissions
ui-router resolve
has permission
statechange check has permission

Use resolve on statemanager. First get data from api. Use the controller to handle the result of the resolve. Only then all data is available from the front end.
Use a permissions list when data is available.
http://www.jvandemo.com/how-to-resolve-angularjs-resources-with-ui-router/


## Body classes
Using 'data' parameter of state and bodyClasses element of $rootScope.
