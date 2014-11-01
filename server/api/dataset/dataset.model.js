'use strict';

var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic'),
    Schema = mongoose.Schema;

var DatasetSchema = new Schema({
  // Dataset properties
  createdAt       : { type: Date, default: Date.now, es_indexed:true },
  publishedAt     : { type: Date },
  updatedAt       : { type: Date, es_indexed:true },

  title           : { type : String, trim: true, es_indexed:true },
  description     : { type : String, trim: true, es_indexed:true },
  slug            : { type : String, es_indexed:true },
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
    uploader          : {type: Schema.ObjectId, ref: 'User', es_indexed:true },
    distributionType  : {type: String, es_indexed:true },      // external link, internal storage, internal api
    publicationStatus : {type: String, es_indexed:true },      // private, public

    // DCAT stuff
    title           : { type: String, es_indexed:true },
    description     : { type: String, es_indexed:true },
    issued          : { type: Date },
    modified        : { type: Date },
    license         : { type: String, es_indexed:true },
    rights          : { type: String },
    accessUrl       : { type: String, es_indexed:true },
    downloadUrl     : { type: String, es_indexed:true },
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


DatasetSchema.plugin(mongoosastic);

module.exports = mongoose.model('Dataset', DatasetSchema);
