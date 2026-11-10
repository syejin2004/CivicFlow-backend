const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'complaint_db',
  port: 3306,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(''),
  }
});

module.exports = db.promise();