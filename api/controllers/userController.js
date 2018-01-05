'use strict';

var bcrypt = require( 'bcrypt' ),
  mongoose = require( 'mongoose' ),
  config = require( '../../config' ),
  jwt = require( 'jsonwebtoken' ),
  Users = mongoose.model( 'UserModel' );

//HEAD '/v1/authority'
//expecting Basic Authorization header
//Authorization Basic XXX  where XXX is a base64 string for user:password
//example:  Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==  https://tools.ietf.org/html/rfc7617
//The service should return correct response code 401-unauthorized 200-authenticated
//return a JWT on the Authority header
//also return WWW-Authorization header, ie: WWW-Authenticate: Basic
exports.authenticate_user = function( req, res ){

  //Get the Authorization header
  var http_code;
  var msg;
  var authority_msg;
  var hdr = req.get( 'Authorization' );
  var external_answer = true;
  if( hdr ){
    try{
      var input = hdr.split( ' ' ).splice( 1, 1 )[ 0 ];
      var buf = Buffer.from( input, 'base64' ).toString( 'utf-8' );
      var arr = buf.split( ':' );
      if( arr.length != 2 ){
        throw new Error( "The format of your token is incorrect - Format expected https://tools.ietf.org/html/rfc7617" );
      }

      //Attempt authentication...
      external_answer = false;  //The answer will be made Async from the query response.
      Users.find( { user_name: arr[ 0 ] }, function( err, users ){
        var internal_response = true;
        if( err ){
          http_code = 500;
          msg = err;
          authority_msg = msg;
        }else{
          if( users.length == 0 ){
            http_code = 404;
            msg = 'User not found';
            authority_msg = 'Not Authorized';
          }else{
            internal_response = false;
            var user = users[ 0 ];
            bcrypt.compare( arr[ 1 ], user.password, function(err, result) {
              if( err ){
                http_code = 500;
                msg = err;
                authority_msg = msg;
              }else{
                try{
                  if( result === true ){
                    http_code = 200;
                    authority_msg = generateToken( user.user_name, user.admin_role );
                    msg = "Authenticated";
                  }else{
                    http_code = 401;
                    authority_msg = "Not Authorized";
                    msg = authority_msg;
                  }
                }catch( exc ){
                  console.log( exc );
                  http_code = 500;
                  msg = exc;
                  authority_msg = "Not Authorized";
                }finally{
                  var hdrs = { 'WWW-Authenticate': 'Basic', 'Authority': authority_msg, 'Authority-Message': msg };
                  sendHeadResponse( res, http_code, hdrs );
                }
              }
            });
          }
        }
        if( internal_response ){
          var hdrs = { 'WWW-Authenticate': 'Basic', 'Authority': authority_msg, 'Authority-Message': msg };
          sendHeadResponse( res, http_code, hdrs );
        }

      });


    }catch( exc ){
      //console.log( exc );
      http_code = 403;
      msg = exc;
      authority_msg = 'Authentication Issue Detected'
    }

  }else{
    http_code = 403;
    msg = 'Missing Authorization Header - Format expected https://tools.ietf.org/html/rfc7617';
    authority_msg = 'Not Authorized'
  }
  if( external_answer ){
    var hdrs = { 'WWW-Authenticate': 'Basic', 'Authority': authority_msg, 'Authority-Message': msg };
    sendHeadResponse( res, http_code, hdrs );
  }
}

function generateToken( username, urole ){
  //https://github.com/auth0/node-jsonwebtoken
  var payload = {
     user: username,
     admin: urole,
     iss: "www.ibcinc.com"
   };
   var token = jwt.sign( payload, config.secret, {
          expiresIn: 2880 // expires in 48 hours
   });
   return token;
}

// GET '/v1/authority'
exports.list_users = function( req, res ){
  Users.find( {}, function( err, users ){
    handleAnswer( res, req.originalUrl, err, users, 200, 'OK', 'No users exist' );
  });
};

//POST '/v1/authority'
exports.create_user = function( req, res ){
  var new_user = new Users( req.body );
  new_user.save( function( err, entry ){
      handleAnswer( res, req.originalUrl, err, entry, 201, 'Created', 'User could not be crated' );
  });
};

//GET '/v1/authority/:user_id'
exports.display_user = function( req, res ){
  Users.find( { _id: req.params.user_id }, function( err, user ){
    handleAnswer( res, req.originalUrl, err, user, 200,'OK',"User: '"+ req.params.user_id + "' does not exist" );
  });
};

//DELETE '/v1/authority/:user_id'
exports.remove_user = function( req, res ){
  Users.findByIdAndRemove( { _id: req.params.user_id }, function( err, user ){
    handleAnswer( res, req.originalUrl, err, user, 200,'Entry Removed',"User: '"+ req.params.user_id + "' does not exist" );
  });
};


function handleAnswer( res, req_url, err, entry, http_code, positive_message, negative_message ){
  if( err ){
    http_code = err.errors ? 400 : 500;
    sendResponse( res, http_code, 2, 'Request could not be completed', req_url, entry, err );
  }else{
    if( entry == null ){
      sendResponse( res, 400, 1, negative_message, req_url, entry, err );
    }else{
      if( entry.length == 0 ){
        sendResponse( res, 404, 1, negative_message, req_url, entry, err );
      }else{
        sendResponse( res, http_code, 0, positive_message, req_url, entry, err );
      }
    }
  }
}

function sendResponse( res, http_code, response_code, response_message, url, entry, error ){
  try{
    if( http_code == 200 || http_code == 201 ){
      res.status( http_code ).json( { response_code: response_code, response_message: response_message, request_url: url, entry: entry } );
    }else{
      if( null === error )
        error = response_message;
      res.status( http_code ).send( { response_code: response_code, response_message: response_message, request_url: url, entry: entry, error: error } );
    }
  }catch( exception ){
    console.log( exception );
  }

}

function sendHeadResponse( res, http_code, headers ){
  res.status( http_code ).set( headers );
  res.end();
}
