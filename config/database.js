const mysql = require('mysql2/promise');
const databaseInfo = require('./databasepwd');
const {logger} = require('./winston');

/*rds prod DB*/
const pool = mysql.createPool({
    host: 'rp.c4wybh857q9a.ap-northeast-2.rds.amazonaws.com',
    user: 'steady',
    port: 3306,
    password: databaseInfo.rdspwd,
    database: 'Real_famo',
    dateStrings: 'date'
});

/*rds dev DB*/
// const pool = mysql.createPool({
//     host: 'rp.c4wybh857q9a.ap-northeast-2.rds.amazonaws.com',
//     user: 'steady',
//     port: 3306,
//     password: databaseInfo.rdspwd,
//     database: 'famodb',
//     dateStrings: 'date'
// });

/*soi local test DB*/
// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'soi',
//     port: 3306,
//     password: databaseInfo.soipwd,
//     database: 'famodb',
//     dateStrings: 'date'
// });

/* steady test DB */
 /* const pool = mysql.createPool({
     host: 'rp.c4wybh857q9a.ap-northeast-2.rds.amazonaws.com',
      user: 'steady',
      port: 3306,
      password: databaseInfo.rdspwd,
      database: 'famo_steady',
      dateStrings: 'date'
  }); */

module.exports = {
    pool: pool
};
