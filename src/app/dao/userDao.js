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
  SELECT userID, loginID, password, passwordSalt, nickname, phoneNumber, kakaoRefreshToken, method, status FROM user
  WHERE loginID = '${loginID}';
                `;

  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
  );
  connection.release();
  return [userInfoRows];
};

/* 프로필 사진 */
async function checkProfileImage(userID){
  const connection = await pool.getConnection(async (conn) => conn);
  const checkProfileImageQuery = `
  SELECT EXISTS (SELECT * FROM profile WHERE userID = ${userID}) AS exist;
  `;
  const [checkProfileImageRow] = await connection.query(
    checkProfileImageQuery
  );
  connection.release();
  return checkProfileImageRow;
}
async function getProfileImage(userID){
  const connection = await pool.getConnection(async (conn) => conn);
  const getProfileImageQuery = `
  SELECT profileImageURL, titleComment, goalStatus, goalTitle, goalDate
  FROM profile
  WHERE userID = ${userID};
  `;
  const [profileImageRow] = await connection.query(
    getProfileImageQuery,
    userIDParams,
  );
  connection.release();
  return profileImageRow;
};

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
};

async function updateProfileImage(s3ProfileImage, userIDInToken){
  const connection = await pool.getConnection(async (conn) => conn);

  const updateProfileImageQuery = `
  UPDATE profile
  SET profileImageURL= '${s3ProfileImage}'
  WHERE userID= ${userIDInToken};
  `;
  await connection.query(
    updateProfileImageQuery
  );
  connection.release();
};

module.exports = {
  checkUserLoginID,
  checkPhoneNumber,
  insertUserInfo,
  insertKakaoUserInfo,
  selectUserInfo,
  checkProfileImage,
  getProfileImage,
  insertProfileImage,
  updateProfileImage,
};

