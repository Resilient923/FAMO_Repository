const { pool } = require("../../../config/database");

// Signup
async function checkUserLoginID(loginID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const existLoginIDQuery = `
                SELECT EXISTS ( 
                SELECT * FROM user WHERE loginID = ?) 
                AS exist;
                `;
  let loginIDParams = [loginID];
  const [loginIDRows] = await connection.query(
    existLoginIDQuery,
    loginIDParams
  );
  connection.release();

  return loginIDRows;
}

async function checkPhoneNumber(phoneNumber) {
  const connection = await pool.getConnection(async (conn) => conn);
  const existPhoneNumberQuery = `
                SELECT EXISTS ( 
                SELECT * FROM user WHERE phoneNumber = ?) 
                AS exist;
                `;
  let phoneNumberParams = [phoneNumber];
  const [phoneNumberRows] = await connection.query(
    existPhoneNumberQuery,
    phoneNumberParams
  );
  connection.release();
  return phoneNumberRows;
}

async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
    INSERT INTO user (loginID, password, passwordSalt, nickname, phoneNumber, method) 
    VALUES (?, ?, ?, ?, ?, ?);
    `;
  
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow[0].insertId;
}

//SignIn
async function selectUserInfo(loginID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT userID, password, passwordSalt, nickname, phoneNumber, 
                method, kakaoAccessToken, status
                FROM user
                WHERE loginID = ?;
                `;

  let selectUserInfoParams = [loginID];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  return [userInfoRows];
}

module.exports = {
  checkUserLoginID,
  checkPhoneNumber,
  insertUserInfo,
  selectUserInfo,
};

