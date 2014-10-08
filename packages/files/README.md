README: files

# Files
Columby user fine uploader to handle all files. Files are uploaded through the browser into a bucket on Amazon S3. The Columby Server issues signed requests with which a direct browser upload to S3 is possible.


## Server Setup
### Settings
To create a signed request, the frontend needs to know the aws key and bucket. These values are different for different deploys (dev, live). Currently the server attaches these configuration settings to the $window (similar to the user-object).
When rendering the index.html, the settings need to be attached to this window. This happens in the system package.

In system/server/controllers/index.js add

    var mean = require('meanio'),
      config = mean.loadConfig()
    ;

    res.render('index', {
      settings: {
        aws : {
          publicKey: config.aws.publicKey,
          endpoint: config.aws.endpoint
        }
      }
    }



### Routes


## AngularJS Setup
### Service

### Directive

### Controller
