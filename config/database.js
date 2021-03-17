const mysql = require('mysql2/promise');
const databaseInfo = require('./databasepwd');
const {logger} = require('./winston');

/*rds dev DB*/
const pool = mysql.createPool({
    host: 'rp.c4wybh857q9a.ap-northeast-2.rds.amazonaws.com',
    user: 'steady',
    port: 3306,
    password: databaseInfo.rdspwd,
    database: 'famodb',
    dateStrings: 'date'
});

/*soi local test DB*/
// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'soi',
//     port: 3306,
//     password: databaseInfo.soipwd,
//     database: 'famodb'
// });

/* steady test DB */
 /* const pool = mysql.createPool({
     host: 'rp.c4wybh857q9a.ap-northeast-2.rds.amazonaws.com',
      user: 'steady',
      port: 3306,
      password: databaseInfo.rdspwd,
      database: 'famo_steady'
  }); */

module.exports = {
    pool: pool
};

const exampleNonTransaction = async (sql, params) => {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(sql, params);
            connection.release();
            return rows;
        } catch(err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch(err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

const exampleTransaction = async (sql, params) => {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            await connection.beginTransaction(); // START TRANSACTION
            const [rows] = await connection.query(sql, params);
            await connection.commit(); // COMMIT
            connection.release();
            return rows;
        } catch(err) {
            await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`example transaction Query error\n: ${JSON.stringify(err)}`);
            return false;
        }
    } catch(err) {
        logger.error(`example transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
