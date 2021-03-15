const { pool } = require("../../../config/database");

/* 로그인ID 유무 확인 */
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
  return [loginIDRows];
};
/* 휴대폰 번호 유무 확인 */
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
  return [phoneNumberRows];
};
/* FAMO 회원가입 */
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
};
/* 카카오 로그인 회원가입 */
async function insertKakaoUserInfo(insertUserInfoParams){
  const connection = await pool.getConnection(async (conn) => conn);
  const insertKakaoUserInfoQuery = `
  INSERT INTO user (loginID, nickname, kakaoRefreshToken, method) VALUES (?, ?, ?, ?);
  `;
  
  await connection.query(
    insertKakaoUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
};
/* 로그인 ID로 유저 정보 조회 */
async function selectUserInfo(loginID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
  SELECT userID, loginID, password, passwordSalt, nickname, phoneNumber, kakaoRefreshToken, method, status FROM user
  WHERE loginID = '${loginID}';
  `;

  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
  );
  connection.release();
  return [userInfoRows];
};
/* 휴대폰 번호로 유저 정보 조회 */
async function selectUserInfoByPhone(phoneNumber){
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoByPhoneQuery = `
  SELECT userID, loginID, method, status
  FROM user
  WHERE phoneNumber = '${phoneNumber}';
  `;

  const [userInfoByPhoneRow] = await connection.query(
    selectUserInfoByPhoneQuery,
  );
  connection.release();
  return [userInfoByPhoneRow];
};
/* userID 유무 확인 */
async function checkUserID(userID){
  const connection = await pool.getConnection(async (conn) => conn);
  const checkUserIDQuery = `
  SELECT EXISTS (SELECT * FROM user WHERE userID = ${userID} AND status = 1) AS exist;
  `;

  const [checkUserIDRow] = await connection.query(
    checkUserIDQuery,
  );
  connection.release();
  return [checkUserIDRow];
};
/* 회원 탈퇴 */
async function deleteUserAccount(userID){
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteUserAccountQuery = `
  UPDATE user
  SET status = -1
  WHERE userID = ${userID};
  `;

  await connection.query(
    deleteUserAccountQuery,
  );

  connection.release();
};
/* 핸드폰 번호 업데이트 */
async function updatePhoneNumber(userID, phoneNumber){
  const connection = await pool.getConnection(async (conn) => conn);
  const updatePhoneNumberQuery = `
  UPDATE user
  SET phoneNumber = '${phoneNumber}'
  WHERE userID = ${userID};
  `;

  await connection.query(
    updatePhoneNumberQuery,
  );

  connection.release();
};

module.exports = {
  checkUserLoginID,
  checkPhoneNumber,
  insertUserInfo,
  insertKakaoUserInfo,
  selectUserInfo,
  selectUserInfoByPhone,
  checkUserID,
  deleteUserAccount,
  updatePhoneNumber,
};


