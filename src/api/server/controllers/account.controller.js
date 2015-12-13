'use strict';

/**
 *
 * Dependencies
 *
 */
var models = require('../models/index');

/**
 *
 * Get list of accounts
 *
 */
exports.index = function(req, res) {
  // Define WHERE clauses
  var filter = {

  };
  // Set (default) limit
  var limit = req.query.limit || 10;
  // Set (default) offset
  var offset = req.query.offset || 0;

  models.Account.findAll({
    where: filter,
    limit: limit,
    offset: offset,
    order: 'created_at DESC'
  }).then(function(accounts) {
    return res.json(accounts);
  }).catch(function(err){
    console.log(err);
    return handleError(res, err);
  });
};


/**
 * @api {get} v2/account/:slug Get account
 * @apiName GetAccount
 * @apiGroup Account
 * @apiVersion 2.0.0
 *
 * @apiDescription Get an account
 *
 * @apiParam {Number} slug Account unique slug.
 *
 * @apiSuccess {object} account Details from the account.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    [{
 *        "status": "success",
 *        "account": {}
 *    }]
 */
exports.show = function(req, res) {
  console.log('Show account with slug: ' + req.params.slug);

  // Find the account and related data
  models.Account.find({
    plain: true,
    where: { slug: req.params.slug },
    include: [
      { model: models.File, as: 'avatar' },
      { model: models.File, as: 'headerImg' },
      { model: models.File, as: 'files' }
    ]
  }).then(function(account) {
    // Get categories associated to this account
    account.getCategories().then(function(categories){
      // Restructure categories to handle parent and child
      var c=[];
      // Get all the parent categories
      for(var i=0;i<categories.length;i++){
        if (categories[i].dataValues.parent_id===null){
          var _c = categories[ i].dataValues;
          _c.children = [];
          c.push(_c);
        }
      }
      // Get all the child categories and add them to their parent
      for(var i=0;i<categories.length;i++){
        if (categories[i].dataValues.parent_id !== null){
          // Find the parent location in the parent array.
          var selected;
          for (var k=0; k<c.length; k++){
            if (c[ k].id===categories[i].dataValues.parent_id) {
              selected=k;
            }
          }
          // Add the child to the parent category.
          c[ selected].children.push(categories[ i].dataValues);
        }
      }
      // Add the categories to the account.
      account.categories = c;

      // Get registries connected to the account
      account.getRegistries().then(function(registries){

        var a = {
          id: account.dataValues.id,
          shortid: account.dataValues.shortId,
          displayName: account.dataValues.displayName,
          slug: account.dataValues.slug,
          email: account.dataValues.email,
          description: account.dataValues.description,
          primary: account.dataValues.primary,
          contact: account.dataValues.contact,
          url: account.dataValues.url,
          location: account.dataValues.location,
          avatar: account.avatar,
          headerImg: account.headerImg,
          files: account.files,
          people: [],
          categories: account.categories
        }

        a.registries = registries;

        // Get users connected to this publication account
        var sql=" SELECT " +
        "    ua1.role AS role, " +
        "    ua1.account_id AS account_id, " +
        "    a.id AS id, " +
        "    a.shortid AS shortid, " +
        "    a.\"displayName\" AS displayname, " +
        "    a.slug AS slug, " +
        "    a.description AS description, " +
        "    f.url AS avatar_url " +

        "FROM user_accounts AS ua1 " +

        "LEFT JOIN user_accounts AS ua2 ON " +
        "    ua1.user_email=ua2.user_email " +

        "LEFT JOIN \"Accounts\" AS a ON " +
        "    ua2.account_id=a.id " +

        "LEFT JOIN \"Files\" AS f ON " +
        "    a.avatar_id = f.id " +

        "WHERE  " +
        "    ua1.account_id=" + a.id + " AND " +
        "    ua2.role=1;";

        models.sequelize.query(sql).then(function(people){
          a.people =people[0];
          return res.json(a);
        }).catch(function(err){
          return handleError(res,err);
        });
      });
    });
  }).catch(function(err){
    return handleError(res,err);
  });
};


/**
 *
 * Creates a new account in the DB.
 *
 * @param req
 * @param res
 *
 */
exports.create = function(req, res) {
  models.Account.create(req.body).then(function(account) {
    return res.json(201, account);
  }).catch(function(err){
    handleError(res,err);
    console.log(err);
  });
};


/**
 * @api {put} v2/account/:slug Update account
 * @apiName UpdateAccount
 * @apiGroup Account
 * @apiVersion 2.0.0
 *
 * @apiDescription Update an account
 *
 * @apiParam {Number} id Account unique id.
 *
 * @apiSuccess {object} result Update status.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    [{
 *        "status": "success",
 *        "account": {}
 *    }]
 */
exports.update = function(req, res) {
  console.log('Updating account: ', req.body);
  models.Account.update(req.body, { where: { id: req.params.id } } ).then(function(result){
    console.log(result);
    return res.json({status: 'success', statusCode: 200, msg: result});
  }).catch(function(err) {
    console.log(err);
    return handleError(res,err);
  });
};


/**
 *
 * Deletes a account from the DB.
 * Access control is done in previous middleware!
 *
 * @param req
 * @param res
 *
 */
exports.destroy = function(req, res) {
  models.Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.send(404); }
    account.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


exports.search = function(req,res) {
  console.log(req.query);
  if (!req.query.username) { return res.json({users: []})}

  models.Account.findAll({
    where: {
      'primary': true,
      displayName: {
        ilike: '%'+req.query.username+'%'
      }
    },
    include: [
      {model: models.File, as: 'avatar'}
    ],
    limit: 10
  }).then(function(users){
    return res.json({users: users});
  }).catch(function(err) {
    return handleError(res,err);
  });
}

// Add a file to a user account.
exports.addFile = function(req,res){
  console.log(req.body);
  models.Account.find(req.body.account_id).then(function(account){
    console.log('account: ', account.dataValues);
    account.addFile(req.body.id).then(function(model){
      console.log('model: ', model);
      return res.json({status: 'success'});
    }).catch(function(err){
      return handleError(res,err);
    });
  }).catch(function(err){
    return handleError(res,err);
  });
};

/**
 * params: account_id, primary_id, role
 **/
exports.addUser = function(req,res){
  var account_id = parseInt(req.params.id);
  var primary_id = parseInt(req.body.primary_id);

  if (!account_id) {
    return handleError(res, 'Missing required parameter account id');
  }
  if (!primary_id) {
    return handleError(res, 'Missing required parameter primary_id');
  }

  // find the primary account email based on primary id
  models.user_accounts.find({
    where: {
      account_id: primary_id
    }
  }).then(function(result){
    if (!result) { return res.json(result); }
    var email = result.user_email;
    console.log(email);
    // Check for existing relation
    models.user_accounts.findOne({
      where: {
        user_email: email,
        account_id: account_id
      }
    }).then(function(result){
      if (result && result.id){
        console.log('Relation already exists.');
        return res.json({status: 'error', msg: 'Relation already exists'});
      } else {
        var relation = {
          account_id: account_id,
          user_email: email,
          role: 3
        };
        console.log('creating relation ', relation);
        models.user_accounts.create(relation).then(function(result){
          console.log(result);
          return res.json(result);
        }).catch(function(err){
          return handleError(res,err);
        });
      }
    }).catch(function(err){
      return handleError(res,err);
    })
  });
}


/**
 * params: account_id, primary_id, role
 **/
exports.removeUser = function(req,res){
  var account_id = parseInt(req.params.id);
  var primary_id = parseInt(req.body.primary_id);

  if (!account_id) {
    return handleError(res, 'Missing required parameter account id');
  }
  if (!primary_id) {
    return handleError(res, 'Missing required parameter primary_id');
  }

  // find the primary account email based on primary id
  models.user_accounts.find({
    where: {
      account_id: primary_id
    }
  }).then(function(result){
    if (!result) { return res.json(result); }
    var email = result.user_email;
    console.log(email);
    // Check for existing relation
    models.user_accounts.findOne({
      where: {
        user_email: email,
        account_id: account_id
      }
    }).then(function(result){
      if (result && result.id){
        console.log('Relation exists.');
        result.destroy().then(function(result){
          return res.json({status: 'ok', msg: result});
        });
      } else {
        return res.json({status: 'error', msg: 'relation not found.'})
      }
    }).catch(function(err){
      return handleError(res,err);
    })
  });
}
/**
 * @api {post} v2/account/:id/registry/:rid Update account registry
 * @apiName UpdateAccountRegistry
 * @apiGroup Account
 * @apiVersion 2.0.0
 *
 * @apiDescription Update an existing registry connected to a publication account
 *
 * @apiParam {Number} id Account unique ID.
 * @apiParam {Number} rid Registry unique ID.
 *
 * @apiSuccess {object} registry Details from the account registry with updated result.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    [{
 *        "id": "1"
 *    }]
 */
exports.updateRegistry = function(req,res){
  var fields = req.body;
  models.account_registries.findById(req.params.rid).then(function(registry){

    if (fields.active===false) {
      fields.autoadd=false;
    }
    registry.updateAttributes(fields).then(function(result) {
      return res.json(result);
    }).catch(function(err){
      return handleError(res,err);
    })
  }).catch(function(err){
    return handleError(res,err);
  });
}


var accountId;          // account_id for new category
var categories;         // Object with all categories and subcategory array
var categoryCounter=0;  // Counter for current category to be added
var category;           // Object with current category
var parentId;         // id for saved parent category (used as parent_id for subcategory)
exports.addDefaultCategories = function(req,res){
  var data = req.body;
  if (!req.body.standard) {
    return res.json({status:'error', message: 'Missing required parameter {standard}'});
  } else if (req.body.standard !== 'overheid-nl') {
    return res.json({status:'error', message: 'Standard not known'});
  } else if (req.body.standard === 'overheid-nl') {
    categories = require('../standards/overheid-nl-themas');
    accountId = req.params.id;
    categoryCounter=0;
    addCategories(function(result){
      console.log('done');
      res.json({status:'success'});
    });
  }
}

function addCategories(cb){
  var listLength = Object.keys(categories).length;
  console.log('Number of categories: ' + listLength);
  console.log('CategoryCounter: ' + categoryCounter);
  category = Object.keys(categories)[ categoryCounter];
  console.log('Sending category: ', category);

  addCategory(function(){
    console.log('Finished adding category ' + categoryCounter);
    categoryCounter++;
    if(categoryCounter<listLength){
      console.log('There are more categories to process ' + categoryCounter + ' of ' + listLength);
      addCategories(cb)
    } else {
      console.log('Done adding Categories');
      cb('done');
    }
  });
}

var subCategoryCounter = 0;
var subCategory;
function addCategory(cb){
  console.log('adding category: ', category);
  models.Category.create({
    account_id: accountId,
    name: category
  }).then(function(result){
    console.log('Category created: ' + result.dataValues.id);
    parentId = result.dataValues.id;
    console.log('Subcategories: ', categories[category]);
    if (categories[category].length>0){
      subCategory=categories[ category];
      console.log('adding sub-category: ', subCategory);
      addSubCategory(function(){
        console.log('Finished adding subcategories for category');
        cb();
      });
    } else {
      console.log('No subcategories');
      cb();
    }
  });
}

function addSubCategory(cb) {
  console.log('subCategoryCounter' + subCategoryCounter);
  console.log('subCategory length: ' + subCategory.length);
  if (subCategoryCounter<subCategory.length){
    console.log('adding subcategory ', subCategory[ subCategoryCounter]);
    models.Category.create({
      account_id: accountId,
      name: subCategory[ subCategoryCounter],
      parent_id: parentId
    }).then(function(result){
      console.log('Subcategory created: ' + result.dataValues.id);
      subCategoryCounter++
      addSubCategory(cb);
    });
  } else {
    subCategoryCounter=0;
    cb();
  }
}


// Error handler
function handleError(res, err) {
  console.log('Account controller error: ', err);
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.json({
      status: 'error',
      msg: err.errors
    })
  } else {
    return res.status(500).json({status: 'error', msg:err});
  }
}
