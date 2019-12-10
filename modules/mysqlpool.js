const mysql = require('mysql');

let pool = mysql.createPool({
    host: 'localhost',
    user: 'liiusion',
    password: 'liipass',
    database: 'mydb'
});

exports.getConnection = function(callback) {
    pool.getConnection(function(err, conn) {
      if(err) {
        return callback(err);
      }
      callback(err, conn);
    });
  };