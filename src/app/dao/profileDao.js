const { pool } = require("../../../config/database");

/* 유저 프로필 유무 확인 */
async function checkUserProfile(userID){
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserProfileQuery = `
    SELECT EXISTS (SELECT * FROM profile WHERE userID = ${userID}) AS exist;
    `;
    const [checkUserProfileRow] = await connection.query(
      checkUserProfileQuery
    );
    connection.release();
    return checkUserProfileRow;
};
/* 유저 프로필 정보 조회 */
async function getProfileInfo(userID){
    const connection = await pool.getConnection(async (conn) => conn);
    const getProfileInfoQuery = `
    SELECT profileImageURL, titleComment, goalStatus, goalTitle, goalDate
    FROM profile
    WHERE userID = ${userID};
    `;
    const [profileInfoRow] = await connection.query(
      getProfileInfoQuery,
    );
    connection.release();
    return [profileInfoRow];
};
/* 프로필 이미지 삽입 */
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
/* 프로필 이미지 업데이트 */
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
/* 상단 멘트 조회 */
async function getTitleComment(userID){
  const connection = await pool.getConnection(async conn => conn);

  const getTitleCommentQuery = `
  SELECT nickname, titleComment, goalStatus FROM profile
  INNER JOIN user ON user.userID = profile.userID
  WHERE profile.userID = ${userID};
  `;

  const [getTitleCommentRow] = await connection.query(
    getTitleCommentQuery,
  );
  connection.release();
  return [getTitleCommentRow];
};
/* 상단 목표 조회 */
async function getTitleGoal(userID){
  const connection = await pool.getConnection(async conn => conn);

  const getTitleGoalQuery = `
  SELECT goalTitle, TIMESTAMPDIFF(DAY, goalDate, current_date()) AS Dday, goalDate, goalStatus 
  FROM profile WHERE userID = ${userID};
  `;

  const [getTitleGoalRow] = await connection.query(
    getTitleGoalQuery,
  );
  connection.release();
  return [getTitleGoalRow];
};
/* 내정보 조회 */
async function getUserProfile(userID){
  const connection = await pool.getConnection(async conn => conn);

  const getUserProfileQuery = `
  SELECT loginID, method, nickname, profileImageURL, titleComment, goalStatus, goalTitle,
  TIMESTAMPDIFF(DAY, goalDate, current_date()) AS Dday, goalDate
  FROM profile
  INNER JOIN user ON user.userID = profile.userID
  WHERE profile.userID = ${userID} AND user.status = 1;
  `;

  const [getUserProfileRow] = await connection.query(
    getUserProfileQuery,
  );
  connection.release();
  return [getUserProfileRow];
};
/* 내정보 수정 */
async function updateUserProfile(userID, updateProfileParams){
  const connection = await pool.getConnection(async conn => conn);

  const updateUserProfileQuery = `
  UPDATE profile
  SET titleComment = ?, 
  goalStatus = ?,
  goalTitle = ?,
  goalDate = ?
  WHERE userID = ${userID};
  `;

  await connection.query(
    updateUserProfileQuery,
    updateProfileParams
  );
  connection.release();
};
/* 닉네임 수정 */
async function updateNickname(userID, nickname){
  const connection = await pool.getConnection(async conn => conn);

  const updateNicknameQuery = `
  UPDATE user
  SET nickname = '${nickname}'
  WHERE userID = ${userID};
  `;

  await connection.query(
    updateNicknameQuery
  );
  connection.release();
};

module.exports = {
    checkUserProfile,
    getProfileInfo,
    insertProfileImage,
    updateProfileImage,
    getTitleComment,
    getTitleGoal,
    getUserProfile,
    updateUserProfile,
    updateNickname,
};