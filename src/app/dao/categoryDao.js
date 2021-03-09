const { pool } = require("../../../config/database");

// 카테고리생성
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
//카테고리중복체크
async function insertcategoryCheck(categoryName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertcategoryCheckQuery = `
                SELECT categoryName
                FROM category
                WHERE categoryName = '${categoryName}';
                `;
 
  const [insertcategoryCheckRows] = await connection.query(
    insertcategoryCheckQuery,
  
  );
  connection.release();
  return insertcategoryCheckRows;
}
//카테고리수정
async function updatecategoryInfo(updatecategoryParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatecategoryQuery = `
  update category
  set categoryName=?,
  categoryColor=?
  where categoryID =?;
                `;
 
  const [updatecategoryRows] = await connection.query(
    updatecategoryQuery,
    updatecategoryParams
  
  );
  connection.release();
  return updatecategoryRows;
}
//카테고리삭제
async function deletecategoryInfo(categoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deletecategoryQuery = `
  delete
from category
where categoryID = '${categoryID}';
                `;
 
  const [deletecategoryRows] = await connection.query(
    deletecategoryQuery
  );
  connection.release();
  return deletecategoryRows;
}
//카테고리조회
async function getcategoryInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getcategoryQuery = `
  select categoryID,
       categoryName,
       colorInfo
from category
inner join categoryColor on categoryColor = colorID
  where userID ='${userID}';
  `;
  const getcategoryRow = await connection.query(
    getcategoryQuery, 
    
  );
  connection.release();
  return getcategoryRow;
}
module.exports = {
  insertcategoryInfo,
  insertcategoryCheck,
  updatecategoryInfo,
  deletecategoryInfo,
  getcategoryInfo
  
};
