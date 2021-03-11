const { pool } = require("../../../config/database");

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
};

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
    checkProfileImage,
    getProfileImage,
    insertProfileImage,
    updateProfileImage,
};