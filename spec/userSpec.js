var request = require( 'request' ),
    config = require( '../config' ),
    jwt = require( 'jsonwebtoken' );
var base_url = 'http://localhost:3000';
var app_url = '/v1/authority';
var request_url = base_url+app_url;

describe( 'UserAuthority server', function(){

  describe( 'success calls to '+app_url, function(){

    var user_data = { user_name: 'alberto_test', password: 'secret_pass' };
    var user_id;

    it( 'POST should create a new user correctly', function( done ){
      request.post( request_url,
        { json: user_data, headers: { 'Content-Type' : 'application/json' }  },
    //  { form: user_data },
          function( error, response, body ){
            try{
              expect( body ).not.toBe( null );
              expect( response.statusCode ).toBe( 201 );
              expect( body.response_code ).toBe( 0 );
              expect( body.response_message ).toBe( "Created" );
              expect( body.request_url ).toBe( app_url );
              expect( body.entry ).not.toBe( null );
              expect( body.entry.created_date ).not.toBe( null );
              expect( body.entry.admin_role ).toBe( false );
              expect( body.entry.user_name ).toBe( user_data.user_name );
              expect( body.entry.password ).not.toBe( user_data.password ); //should be encrypted
              user_id = body.entry._id;
              expect( user_id ).not.toBe( null );
              done();
            }catch( exc ){
              console.log( exc );
              expect().fail();
            }
      });
    });

    it( 'GET list should be successful ', function( done ){
      request.get( request_url, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 200 );
          expect( body.response_code ).toBe( 0 );
          expect( body.response_message ).toBe( "OK" );
          expect( body.request_url ).toBe( app_url );
          expect( body.entry ).not.toBe( null );
          expect( body.entry.length ).toBeGreaterThan( 0 );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'GET user by id should be successful ', function( done ){
      request.get( request_url+'/'+user_id, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 200 );
          expect( body.response_code ).toBe( 0 );
          expect( body.response_message ).toBe( "OK" );
          expect( body.request_url ).toBe( app_url+'/'+user_id );
          expect( body.entry ).not.toBe( null );
          expect( body.entry.length ).toBeGreaterThan( 0 );
          expect( body.entry[0].created_date ).not.toBe( null );
          expect( body.entry[0].admin_role ).toBe( false );
          expect( body.entry[0].user_name ).toBe( user_data.user_name );
          expect( body.entry[0].password ).not.toBe( user_data.password ); //should be encrypted
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    //TEST authentication
    it( 'HEAD request to complete authentication', function( done ){
      var pw_token = user_data.user_name+":"+user_data.password;
      var hdrs = { 'Authorization': 'Basic '+ new Buffer( pw_token ).toString( 'base64' ) };
      request.head( request_url,{ headers: hdrs }, function( error, response, body ){
        try{
          expect( body ).toBe( '' );
          expect( response.statusCode ).toBe( 200 );
          expect( response.headers ).not.toBe( null );
          expect( response.headers[ 'www-authenticate' ] ).toBe( 'Basic' );
          expect( response.headers[ 'authority-message' ] ).toBe( 'Authenticated' );
          var token = response.headers[ 'authority' ];
          //console.log( token ); //view on https://jwt.io/
          expect( token ).not.toBe( null ); //token
          //Confirm token content...
          var decoded = jwt.verify( token, config.secret );
          expect( decoded.user ).toBe( user_data.user_name );
          expect( decoded.admin ).toBe( false );
          expect( decoded.iss ).toBe( 'www.ibcinc.com' );
          expect( decoded.exp ).not.toBe( null );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    //TEST bad pass authentication
    it( 'HEAD request with bad password', function( done ){
      var pw_token = user_data.user_name+":badpassword";
      var hdrs = { 'Authorization': 'Basic '+ new Buffer( pw_token ).toString( 'base64' ) };
      request.head( request_url,{ headers: hdrs }, function( error, response, body ){
        try{
          expect( body ).toBe( '' );
          expect( response.statusCode ).toBe( 401 );
          expect( response.headers ).not.toBe( null );
          expect( response.headers[ 'www-authenticate' ] ).toBe( 'Basic' );
          expect( response.headers[ 'authority' ] ).toBe( 'Not Authorized' );
          expect( response.headers[ 'authority-message' ] ).toBe( 'Not Authorized' );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });


    it( 'DELETE should remove a user correctly', function( done ){
      request.delete( request_url+'/'+user_id, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 200 );
          expect( body.response_code ).toBe( 0 );
          expect( body.response_message ).toBe( "Entry Removed" );
          expect( body.request_url ).toBe( app_url+'/'+user_id );
          expect( body.entry ).not.toBe( null );
          expect( body.entry.created_date ).not.toBe( null );
          expect( body.entry.admin_role ).toBe( false );
          expect( body.entry.user_name ).toBe( user_data.user_name );
          expect( body.entry.password ).not.toBe( user_data.password ); //should be encrypted
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });


  });

  describe( 'failure calls to '+app_url, function(){
    var user_id = "5a4f80b40f15eb1ab9f91637";

    it( 'GET should return error responses when requesting empty list', function( done ){
      request.get( request_url, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 404 );
          expect( body.response_code ).toBe( 1 );
          expect( body.response_message ).toBe( "No users exist" );
          expect( body.request_url ).toBe( app_url );
          expect( body.entry ).not.toBe( null );
          expect( body.entry.length ).toBe( 0 );
          expect( body.error ).toBe( "No users exist" );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'GET request should report correctly when user does not exist', function( done ){
      request.get( request_url+'/'+user_id, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 404 );
          expect( body.response_code ).toBe( 1 );
          expect( body.response_message ).toMatch( /does not exist/ );
          expect( body.request_url ).toBe( app_url+'/'+user_id );
          expect( body.entry ).not.toBe( null );
          expect( body.entry.length ).toBe( 0 );
          expect( body.error ).toMatch( /does not exist/ );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'DELETE request should report correctly when user does not exist', function( done ){
      request.delete( request_url+'/'+user_id, { json: true }, function( error, response, body ){
        try{
          expect( body ).not.toBe( null );
          expect( response.statusCode ).toBe( 400 );
          expect( body.response_code ).toBe( 1 );
          expect( body.response_message ).toMatch( /does not exist/ );
          expect( body.request_url ).toBe( app_url+'/'+user_id );
          expect( body.entry ).toBe( null );
          expect( body.error ).toMatch( /does not exist/ );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'HEAD request with incorrect header set should report correctly', function( done ){
      request.head( request_url, function( error, response, body ){
        try{
          expect( body ).toBe( '' );
          expect( response.statusCode ).toBe( 403 );
          expect( response.headers ).not.toBe( null );
          expect( response.headers[ 'www-authenticate' ] ).toBe( 'Basic' );
          expect( response.headers[ 'authority' ] ).toBe( 'Not Authorized' );
          expect( response.headers[ 'authority-message' ] ).toMatch( /Missing Authorization Header/ );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'HEAD request with incorrect format header', function( done ){
      var bad_format = "test:testpass:111111";  //Should only have 1 :
      var hdrs = { 'Authorization': 'Basic '+ new Buffer( bad_format ).toString( 'base64' ) };
      request.head( request_url,{ headers: hdrs }, function( error, response, body ){
        try{
          expect( body ).toBe( '' );
          expect( response.statusCode ).toBe( 403 );
          expect( response.headers ).not.toBe( null );
          expect( response.headers[ 'www-authenticate' ] ).toBe( 'Basic' );
          expect( response.headers[ 'authority' ] ).toBe( 'Authentication Issue Detected' );
          expect( response.headers[ 'authority-message' ] ).toMatch( /your token is incorrect/ );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

    it( 'HEAD request with unknwon user', function( done ){
      var bad_format = "test:testpass";  //Should only have 1 :
      var hdrs = { 'Authorization': 'Basic '+ new Buffer( bad_format ).toString( 'base64' ) };
      request.head( request_url,{ headers: hdrs }, function( error, response, body ){
        try{
          expect( body ).toBe( '' );
          expect( response.statusCode ).toBe( 404 );
          expect( response.headers ).not.toBe( null );
          expect( response.headers[ 'www-authenticate' ] ).toBe( 'Basic' );
          expect( response.headers[ 'authority' ] ).toBe( 'Not Authorized' );
          expect( response.headers[ 'authority-message' ] ).toMatch( /User not found/ );
          done();
        }catch( exc ){
          console.log( exc );
          expect().fail();
        }
      });
    });

  });


});
