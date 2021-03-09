const { pool } = require("../../../config/database");

/* 회원가입 */
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

async function insertKakaoUserInfo(insertUserInfoParams){
  const connection = await pool.getConnection(async (conn) => conn);
  const insertKakaoUserInfoQuery = `
  INSERT INTO user (loginID, nickname, kakaoRefreshToken, method) VALUES (?, ?, ?, ?);
  `;
  
  const insertKakaoUserInfoRow = await connection.query(
    insertKakaoUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertKakaoUserInfoRow[0].insertId;
}

/* 로그인 */
async function selectUserInfo(loginID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT * FROM user
                WHERE loginID = ?;
                `;

  let selectUserInfoParams = [loginID];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}

/* 프로필 사진 */
async function insertProfileImage(insertProfileImageParams){
  const connection = await pool.getConnection(async (conn) => conn);
  const insertProfileImageQuery = `
  INSERT INTO profile (userID, profileImageURL) VALUES (?, ?);
  `;
  await connection.query(
    insertProfileImageQuery,
    insertProfileImageParams
  );
  connection.release();
}

module.exports = {
  checkUserLoginID,
  checkPhoneNumber,
  insertUserInfo,
  insertKakaoUserInfo,
  selectUserInfo,
  insertProfileImage,
};

