# Mail

Mail is sent using the sendgrid service. Mail is only sent at the backend side.
We use nodemailer and nodemailer-sendgrid-transport.
Mail is handled using a mailService at ./server/services/mail.service.js

mail-object : {
  to: [user@email],
  from: ,
  text: ,
  html: ,

}


## Uncaught exceptions


## References
https://github.com/sendgrid/nodemailer-sendgrid-transport
http://nodemailer.com/
