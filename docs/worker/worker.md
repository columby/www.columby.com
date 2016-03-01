# Columby worker

## Initialization
The worker is initialized by calling

    var Worker = require('worker');
    var worker = new Worker();

This creates a new worker instance and opens the connection to the database.  
When starting the process with ***worker.start()*** it first cleans the existing Jobs list in the database. To make sure there are no strained processes. Every job with status 'processing' is set to error. After that the processInterval is started. With every tick of the interval the worker checks for new processes to execute.

## Interval: Check for new jobs

  1. Make sure the process is not already running, otherwise return.
  2. Set the processing flag to true
  3. Select the latest job item from the Jobs list
  4. Validate the job-item and return if not a valid job
  5. Determine the job-type(arcgis, csv, fortes) and get the required data from the database
    1. Set Job status to 'processing'
    2. Set the Primary status to 'processing'
    2. if no valid data is found, finish the job with an error message in the database
  6. Create a new worker-type-instance based on the worker-type
  7. Start the worker-type-instance (some.worker.js)
    1. Connect to the data-database
    2. Validate the job data-data
    3. Drop the existing data table
    5. Get Data details from the datasource
    6. Create the new table
    7. Synchronize the data
  8. Finish the job (worker.js)
    1. Handle error if present (returned from worker-type)
    2. Set Job status to 'done'
    3. Set Primary status to 'processed' and update last_update date
    3. Convert primary source to downloadable file
      1. api/primary/convert handles conversion and sets Primary status to 'converted'


## Cron
The cron process checks every hour if there are new Jobs ready for processing. It checks if there are datasets that have periodic synchronisation turned on and the last_processed_data is earlier than the periodic date and are not currently in the processing queue.
If the cron process finds jobs it adds them to the Jobs processing queue.
