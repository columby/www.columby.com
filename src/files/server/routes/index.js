'use strict'

var fileCtrl = require('./../controllers/file.controller')
var auth = require('./../controllers/auth.controller')

module.exports = function (app) {
  // Route to a file
  app.get('/:type/:filename',
    fileCtrl.serve
  )

  // Route to a derived file
  app.get('/:type/:style/:filename',
    fileCtrl.serve
  )

  // convert a file or table
  app.post('/convert',
    auth.validateRemoteHost,
    fileCtrl.convert)

  // Fallback for all other routes
  app.get('/', function (req, res) {
    return res.json({ status: 200, msg: 'Columby file server.' })
  })

  app.get('/*', function (req, res) {
    return res.sendStatus(404)
  })
}
