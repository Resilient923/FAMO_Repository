const { pool } = require("../../../config/database");

// 카테고리생성
async function insertcategoryInfo(insertcategoryParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
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
  }catch(err){
    connection.release();
  }
};

//카테고리개수제한 체크
async function insertcategoryCountCheck(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const insertcategoryCountCheckQuery = `
  select count(categoryID) as 'categoryCount'
  from category
  where userID = ${userID};
  `;
 
  const [insertcategoryCountCheckRows] = await connection.query(
    insertcategoryCountCheckQuery,
  );
  connection.release();
  return insertcategoryCountCheckRows;
  }catch (err){
    connection.release();
  }
};

//카테고리중복체크
async function insertcategoryCheck(categoryName,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const insertcategoryCheckQuery = `
                SELECT categoryName
                FROM category
                WHERE categoryName = '${categoryName}'
                and userID = ${userID};
                `;
 
  const [insertcategoryCheckRows] = await connection.query(
    insertcategoryCheckQuery,
  );

  connection.release();
  return insertcategoryCheckRows;
  }catch (err){
    connection.release();
  }
};

//카테고리색상중복체크
async function insertcategoryColorCheck(categoryColor,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const insertcategoryColorCheckQuery = `
                SELECT categoryColor
                FROM category
                WHERE categoryColor = '${categoryColor}'
                and userID = ${userID};
                `;
 
  const [insertcategoryColorCheckRows] = await connection.query(
    insertcategoryColorCheckQuery,
  
  );
  connection.release();
  return insertcategoryColorCheckRows;
  }catch(err){
    connection.release();
  }
};

//카테고리수정
async function updatecategoryInfo(updatecategoryParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
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
  }catch(err){
    connection.release();
  }
};

//카테고리삭제
async function deletecategoryInfo(categoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const deletecategoryQuery = `
  delete
from category
where categoryID = ${categoryID};
                `;
 
  const [deletecategoryRows] = await connection.query(
    deletecategoryQuery
  );
  connection.release();
  return deletecategoryRows;
  }catch(err){
    connection.release();
  }
};

//카테고리조회
async function getcategoryInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getcategoryQuery = `
  select categoryID,
       categoryName,
       colorInfo
  from category
  inner join categoryColor on categoryColor = colorID
  where userID= ${userID};
  `;
  const getcategoryRow = await connection.query(
    getcategoryQuery, 
  );
  connection.release();
  return getcategoryRow;
  }catch(err){
    connection.release();
  }
};

module.exports = {
  insertcategoryInfo,
  insertcategoryCountCheck,
  insertcategoryCheck,
  insertcategoryColorCheck,
  updatecategoryInfo,
  deletecategoryInfo,
  getcategoryInfo,

};
