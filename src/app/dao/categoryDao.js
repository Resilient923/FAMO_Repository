const { pool } = require("../../../config/database");

// 오늘일정생성
async function insertcategoryInfo(insertcategoryParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertcategoryQuery = `
  insert into category(userID, categoryName, categoryColor)
  values (?, ?, ?);
  `;

  const [insertcategoryrows] = await connection.query(
    insertcategoryQuery,
    insertcategoryParams
  );
  connection.release();

  return insertcategoryrows;
}

module.exports = {
  insertcategoryInfo,
  
};
