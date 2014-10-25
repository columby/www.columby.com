'use strict';

var express = require('express');
var controller = require('./dataset.controller');

var router = express.Router();

router.get('/extractlink', controller.extractlink);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

// Distributions
router.get('/:id/distribution', controller.listDistributions);
router.post('/:id/distribution', controller.createDistribution);
router.get('/:id/distribution/:did', controller.getDistribution);
router.put('/:id/distribution/:did', controller.updateDistribution);
router.delete('/:id/distribution/:did', controller.destroyDistribution);

// Refernces
router.get('/:id/reference', controller.listReferences);
router.post('/:id/reference', controller.createReference);
router.get('/:id/reference/:rid', controller.getReference);
router.put('/:id/reference/:rid', controller.updateReference)
router.delete('/:id/reference/:rid', controller.destroyReference);

module.exports = router;
