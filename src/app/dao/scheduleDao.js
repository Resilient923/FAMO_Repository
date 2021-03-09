const { pool } = require("../../../config/database");

// 오늘일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertscheduleQuery = `
  insert into schedule(userID, scheduleName, scheduleDate,scheduleTime,
    scheduleCategoryID, scheduleMemo, scheduleStatus,
    scheduleDelete, scheduleCreatedAt, scheduleUpdatedAt, schedulePick)
values ( ?, ?, current_date(),?, ?, ?, default, default, default, default
, default);
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
async function getscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduleQuery = `
        
  select scheduleID,
       date_format(scheduleDate, '%e %b') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
         inner join category on schedule.userID = category.userID
         inner join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = '${userID}';
    
    `;
  
  const getscheduleRow = await connection.query(
    getscheduleQuery, 
    //updatescheduleParams 
  );
  connection.release();
  return getscheduleRow;
}
//카테고리별 일정 조회
async function getschedulebycategoryInfo(userID,schedulecategoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getschedulebycategoryQuery = `
        
  select scheduleID,
  date_format(scheduleDate, '%Y %m %d') as 'scheduleDate',
  scheduleName,
  scheduleMemo,
  schedulePick,
  colorInfo
from schedule
    inner join category on schedule.userID = category.userID
    inner join categoryColor on categoryColor = colorID
where scheduleDelete = 1
and schedule.userID = '${userID}'
and scheduleCategoryID = '${schedulecategoryID}';

    
    `;
  
  const getschedulebycategoryRow = await connection.query(
    getschedulebycategoryQuery, 
    //updatescheduleParams 
  );
  connection.release();
  return getschedulebycategoryRow;
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
  getschedulebycategoryInfo,
  deletescheduleInfo
};
