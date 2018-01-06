
var express = require( 'express' ),
    app = express(),
    bodyParser = require( 'body-parser' ),
    mongoose = require( 'mongoose' ),
    config = require( './config' ),
    User = require( './api/models/userModel' );

//dbSetup
mongoose.Promise = global.Promise;
mongoose.connect( config.database_url );

//secret
app.set( 'SuperSecret', config.secret );

//Accept cross-origin browser requests
app.use( function( req, res, next ){
  res.setHeader( "Access-Control-Allow-Methods", "HEAD, OPTIONS, DELETE, POST, GET" );
  res.header( "Access-Control-Allow-Origin", "https://www.ibcinc.com" );
  res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
  res.header( "Access-Control-Allow-Credentials", true );
  next();
});

//body-parser dbSetup
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

//routes
var routes = require( './api/routes/userRoutes' );
routes( app );

//handle bad requests
app.use( function( req, res ){
  res.status( 400 ).send({ response_code: 3, request_url: req.originalUrl, response_message: 'URL is not defined / does not exist.' })
});

//Start server
app.listen( config.application_port );
console.log( 'Users Authority API started on port: '+ config.application_port );
