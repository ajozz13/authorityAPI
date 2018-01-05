'use strict';

var bcrypt = require( 'bcrypt' );
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_name:{
    type: String,
    required: 'Ensure a username is specified.',
    index: { unique: true, sparse: true }
  },
  password:{
    type: String,
    required: 'Ensure a password is given.'
  },
  created_date:{
    type: Date,
    default: Date.now
  },
  admin_role:{
    type: Boolean,
    default: false
  }
});
//http://tphangout.com/how-to-encrypt-passwords-or-other-data-before-saving-it-in-mongodb/
UserSchema.pre( 'save', function(next){
  var user = this;
  if( !user.isModified( 'password' ) ) return next();

  bcrypt.genSalt( 10, function( err, salt ){
    if( err ) return next( err );
    bcrypt.hash( user.password, salt, function( err, hash){
      if( err ) return next( err );
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model( 'UserModel', UserSchema );
