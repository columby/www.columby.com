'use strict';

var express = require('express'),
    controller = require('./../controllers/dataset.controller'),
    router = express.Router(),
    auth = require('../controllers/auth.controller')
;

/**
 *
 * Middleware to check if user can edit the required dataset.
 *
 * @param req
 * @param res
 * @param next
 */
function canEdit(req,res,next){

}

/**
 *
 * Extract a link
 *
 * Roles: authenticated
 *
 **/
router.get('/extractlink',
  auth.ensureAuthenticated,
    controller.extractlink);


/**
 *
 * List datasets
 *
 * Public access
 *
 **/
router.get('/',

    controller.index);

/**
 *
 * Get a dataset
 *
 * Public access
 *
 **/
router.get('/:id',

    controller.show);

/**
 *
 * Create a new dataset
 *
 * Roles: authenticated
 *
 **/
router.post('/',
  auth.ensureAuthenticated,
    controller.create);

/**
 *
 * Update a dataset
 *
 * Roles: authenticated
 *
 **/
router.put('/:id',
  auth.ensureAuthenticated,
    controller.update);

/**
 *
 * Delete a dataset
 *
 * Roles: authenticated
 *
 **/
router.delete('/:id',
  auth.ensureAuthenticated,
    controller.destroy);

/**
 * Distribution Routes
 *
 **/
router.get('/:id/distribution',
    controller.listDistributions);

router.post('/:id/distribution',
  //auth.checkJWT,
    controller.createDistribution);

router.get('/:id/distribution/:did',
    controller.getDistribution);

router.put('/:id/distribution/:did',
  auth.ensureAuthenticated,
    controller.updateDistribution);

router.delete('/:id/distribution/:did',
  auth.ensureAuthenticated,
    controller.destroyDistribution);

/**
 * Reference Routes
 *
 **/
router.get('/:id/reference',
    controller.listReferences);

router.post('/:id/reference',
  auth.ensureAuthenticated,
    controller.createReference);

router.get('/:id/reference/:rid',
    controller.getReference);

router.put('/:id/reference/:rid',
  auth.ensureAuthenticated,
    controller.updateReference);

router.delete('/:id/reference/:rid',
  auth.ensureAuthenticated,
    controller.destroyReference);


module.exports = router;
