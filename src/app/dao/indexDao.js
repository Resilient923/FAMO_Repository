const { pool } = require("../../../config/database");

// index
async function defaultDao(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `SELECT userID, loginID, nickname FROM user WHERE userID = ?;`;

  let selectUserInfoParams = [userID];
  const [rows] = await connection.query(
    selectEmailQuery,
    selectUserInfoParams
  );
  connection.release();

  return rows;
}

module.exports = {
  defaultDao
};
