var db_server = process.env.DBSERVER || '192.168.17.238';
var port = process.env.PORT || 3000;

module.exports = {
  'secret' : 'Filium Dei unigenitum, et ex Patre natum ante omnia saecula',
  'database_url' : 'mongodb://'+ db_server +'/authority_db',
  'application_port' : port
}
