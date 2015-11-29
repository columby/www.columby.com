# File server for columby.com

File server for columby.com

Every file in the files-server is stored in the CMS Database (Files table). Each file has an id.


## Routes
Static assets
https://files.columby.com/assets/filename.ext

Retrieve a file:
https://files.columby.com/f/:filename.ext
f=file

Retrieve a derivative of a file (image style)
https://files.columby.com/s/:style/:filename.ext
s=styles

## Amazon bucket
All files are stored in an Amazon S3 bucket: https://s3.amazonaws.com/columby/.  
Each environment has a subfolder, e.g. https://s3.amazonaws.com/columby/production or https://s3.amazonaws.com/columby/development

Each request for a file is proxied by columby-files. The file is streamed from S3 by the server.

## Image styles
Derivatives of images are created on-demand. If a derivative does not exist, the server tries to create one. To do this, the original file is downloaded, converted and uploaded.

## Uploading Files
Uploading files is handled by the Columby API. https://api/columby.com/v2/file/sign. An upload signed request is requested by and, if permitted, sent back to the user.
