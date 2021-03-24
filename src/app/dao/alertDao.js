const { pool } = require("../../../config/database");

// index
async function getDeviceTokenInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getDeviceTokenQuery = `
  SELECT userID, nickname, deviceToken FROM user WHERE userID = '${userID}';
  `;
  const getDeviceTokenrows = await connection.query(
    getDeviceTokenQuery,
  );
  connection.release();
  return getDeviceToken;
}

module.exports = {
  getDeviceTokenInfo
};
