# LOGGING

Logging is provided using Winston and winston-express.
At ./config/logger.js the logger is defined and initiated. A regular winston object is used. For express a winston-express instance is created, this instance makes use of the winston instance.

## Log levels
error: 0,
warn: 1,
info: 2,
verbose: 3,
debug: 4,
silly: 5


## Transports
All log events are send to the console.
Error log events are also emailed to the sysadmin.
Info and above events are written to the database.

## usage

    var logger = require('winston');
    
    logger.debug('this is a debug message.');
    logger.info('this is an info message. ');
    logger.warn('this is a warning message. ');
    logger.error('this is an error message. ');

## References
https://github.com/winstonjs/winston
https://github.com/bithavoc/express-winston
