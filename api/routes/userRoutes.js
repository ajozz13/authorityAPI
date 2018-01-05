'use strict';

module.exports = function( app ){
    var manager = require( '../controllers/userController' );

    app.route( '/v1/authority' )
      .head( manager.authenticate_user )
      .get( manager.list_users )
      .post( manager.create_user );

    app.route( '/v1/authority/:user_id' )
      .get( manager.display_user )
      .delete( manager.remove_user );

}
