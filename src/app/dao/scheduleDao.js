const { pool } = require("../../../config/database");

// 일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertscheduleQuery = `
  insert into schedule(userID, scheduleName, scheduleDate,
    scheduleCategoryID, scheduleMemo, scheduleStatus,
    scheduleDelete,scheduleCreatedAt,scheduleUpdatedAt,schedulePick)
    values(?,?,?,?,?,default,default,default,default
           ,default)
  `;

  const [insertschedulerows] = await connection.query(
    insertscheduleQuery,
    insertscheduleParams
  );
  connection.release();

  return  insertschedulerows;
}

//일정 수정
async function updatescheduleInfo(updatescheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatescheduleQuery = `
        
  update schedule
  set scheduleName=?,
  scheduleDate=?,
  scheduleCategoryID=?,
  scheduleMemo=?,
  scheduleUpdatedAt=current_timestamp
  where scheduleID = ?;
    `;
  
  const updatescheduleRow = await connection.query(
    updatescheduleQuery, 
    updatescheduleParams 
  );
  connection.release();
  return updatescheduleRow;
}
//일정 조회
async function getscheduleInfo(updatescheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatescheduleQuery = `
        
  select 
  userID,
  date_format(scheduleDate,'%e %b') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick
    from schedule
    
    `;
  
  const updatescheduleRow = await connection.query(
    updatescheduleQuery, 
    updatescheduleParams 
  );
  connection.release();
  return updatescheduleRow;
}
//일정삭제
async function deletescheduleInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deletescheduleQuery = `
        
  update schedule
  set scheduleDelete = -1
  where scheduleID='${scheduleID}';

    
    `;
  
  const deletescheduleRow = await connection.query(
    deletescheduleQuery, 
   
  );
  connection.release();
  return deletescheduleRow;
}
module.exports = {
  insertscheduleInfo,
  updatescheduleInfo,
  getscheduleInfo,
  deletescheduleInfo
};
