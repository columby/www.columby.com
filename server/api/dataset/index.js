'use strict';

var express = require('express'),
    controller = require('./dataset.controller'),
    router = express.Router(),
    auth = require('../../components/auth/index')
;

/**
 * Static Routes
 *
 **/
router.get('/seed', controller.seed); 
router.get('/extractlink', controller.extractlink);


/**
 * Main Routes
 *
 **/
router.get('/',
    controller.index);

router.get('/:id',
    controller.show);

router.post('/',
  auth.checkJWT,
    controller.create);

router.put('/:id',
  auth.checkJWT,
    controller.update);

router.delete('/:id',
  auth.checkJWT,
    controller.destroy);

/**
 * Distribution Routes
 *
 **/
router.get('/:id/distribution',
    controller.listDistributions);

router.post('/:id/distribution',
  auth.checkJWT,
    controller.createDistribution);

router.get('/:id/distribution/:did',
    controller.getDistribution);

router.put('/:id/distribution/:did',
  auth.checkJWT,
    controller.updateDistribution);

router.delete('/:id/distribution/:did',
  auth.checkJWT,
    controller.destroyDistribution);

/**
 * Reference Routes
 *
 **/
router.get('/:id/reference',
    controller.listReferences);

router.post('/:id/reference',
  auth.checkJWT,
    controller.createReference);

router.get('/:id/reference/:rid',
    controller.getReference);

router.put('/:id/reference/:rid',
  auth.checkJWT,
    controller.updateReference);

router.delete('/:id/reference/:rid',
  auth.checkJWT,
    controller.destroyReference);


module.exports = router;
