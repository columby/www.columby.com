'use strict';

var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic'),
    Schema = mongoose.Schema;

var DatasetSchema = new Schema({
  // Dataset properties
  createdAt       : { type: Date, default: Date.now },
  publishedAt     : { type: Date },
  updatedAt       : { type: Date },

  title           : { type : String, trim: true },
  description     : { type : String, trim: true },
  slug            : { type : String },
  headerImage     : { type : String },

  account         : { type: Schema.ObjectId, ref:  'Account' },

  visibilityStatus    : { type: String, default: 'public' },
  publicationStatus   : { type: String, default: 'draft' },

  draft : {
    title           : { type:String, trim:true },
    description     : { type: String, trim: true },
  },

  distributions    : [{
    // Columby stuff
    uploader          : {type: Schema.ObjectId, ref: 'User' },
    distributionType  : {type: String },      // external link, internal storage, internal api
    publicationStatus : {type: String },      // private, public

    // DCAT stuff
    title           : { type: String },
    description     : { type: String },
    issued          : { type: Date },
    modified        : { type: Date },
    license         : { type: String },
    rights          : { type: String },
    accessUrl       : { type: String },
    downloadUrl     : { type: String },
    mediaType       : { type: String },
    format          : { type: String },
    byteSize        : { type: Number }

  }],

  references      : [],

  history: [{
    date            : { type: Date, default: Date.now },
    acitvity        : { type: String }
  }]
});



/**
 * Validations
 */

DatasetSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title can\'t be blank');

function uniqueFieldInsensitive(modelName,field) {
  return function(val, cb){
    if (val && val.length) { // if string not empty/null
      var query = mongoose.models[modelName]
        // lookup the collection for somthing that looks like this field
        .where( field, new RegExp('^'+val+'$', 'i') );

      if (!this.isNew) { // if update, make sure we are not colliding with itself
        query = query.where('_id').ne(this._id);
      }
      query.count(function(err,n){
        // false when validation fails
        cb( n < 1 );
      });
    } else {
      // null is allowed.
      cb(true);
    }
  };
}
// validate unique slug
DatasetSchema.path('slug').validate( uniqueFieldInsensitive('Dataset', 'slug' ), 'The slug already exists.' );
// validate slug length
DatasetSchema.path('slug').validate( function(v){
  if (v.length>4 || v.length<30) {
    return true;
  } else {
    return false;
  }
}, 'The URL is too short or too long. ');
// Dataset blacklist custom url
DatasetSchema.path('slug').validate( function(v){
  var blacklist = [
    'new','nieuw','delete','create','update','edit'
  ];
  if (blacklist.indexOf(v) === -1) {
    return true;
  } else {
    return false;
  }
}, 'This custom URL can\'t be set' );

/**
 * Statics
 */
DatasetSchema.statics.load = function(id, cb) {
  console.log('loading dataset ', id);

  var Dataset = mongoose.model('Dataset');
  Dataset
    .findOne(
      { $or: [
        { _id: id },
        { slug: id }
        ]
      }, function(err,dataset){
      var opts = [{ path:'publisher', model:dataset.publisherType, select: 'name slug description avatar plan'}];
      Dataset.populate(dataset, opts, cb);
    });
};


DatasetSchema.plugin(mongoosastic,{
  bulk: {
    size: 10, // preferred number of docs to bulk index
    delay: 1000 //milliseconds to wait for enough docs to meet size constraint
  }
});

module.exports = mongoose.model('Dataset', DatasetSchema);
