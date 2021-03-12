const { pool } = require("../../../config/database");

// 오늘일정생성
async function inserttodayscheduleInfo(inserttodayscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const inserttodayscheduleQuery = `
  insert into schedule(userID,scheduleName,scheduleDate,scheduleTime,
    scheduleCategoryID,scheduleMemo,scheduleStatus,scheduleDelete,scheduleCreatedAt,scheduleUpdatedAt,schedulePick)
values (?,?,current_date(),?,?,?,default,default,default,default,default);
  `;

  const [inserttodayschedulerows] = await connection.query(
    inserttodayscheduleQuery,
    inserttodayscheduleParams
  );
  connection.release();

  return  inserttodayschedulerows;
}
//일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertscheduleQuery = `
  insert into schedule(userID, scheduleName, scheduleDate, scheduleTime,
    scheduleCategoryID, scheduleMemo, scheduleStatus,
    scheduleDelete, scheduleCreatedAt, scheduleUpdatedAt, schedulePick)
values ( ?, ?, ?, ?, ?, ?, default, default, default, default
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
    left join category on category.categoryID = schedule.scheduleCategoryID
   left join categoryColor ON categoryColor.colorID = category.categoryColor
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
    inner join category on categoryID = scheduleCategoryID
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
//일정 즐겨찾기,즐겨찾기 취소
async function patchschedulepickInfo(scheduleID,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchschedulepickQuery = `
        
  update schedule
  set schedulePick = if(schedulePick = 1, -1, 1)
  where scheduleID = '${scheduleID}' and userID = '${userID}';

    
    `;
  
  const patchschedulepickRow = await connection.query(
    patchschedulepickQuery, 
   
  );
  connection.release();
  return patchschedulepickRow;
}
//일정완료 , 완료취소
async function updateachievementscheduleInfo(scheduleID,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateachievementscheduleQuery = `
        
  update schedule
  set scheduleStatus = if(scheduleStatus = 1, -1, 1)
  where scheduleID = '${scheduleID}' and userID = '${userID}';

    
    `;
  
  const updateachievementscheduleRow = await connection.query(
    updateachievementscheduleQuery, 
   
  );
  connection.release();
  return updateachievementscheduleRow;
}
//유저별 해낸 일정 개수 조회
async function getdoneschedulecountInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getdoneschedulecountQuery = `
  select count(scheduleID) as 'doneScheduleCount'
  from schedule
  where userID ='${userID}' and scheduleStatus = 1
`; 
  
  const  getdoneschedulecountRow = await connection.query(
    getdoneschedulecountQuery, 
    
  );
  connection.release();
  return getdoneschedulecountRow;
}

module.exports = {
  inserttodayscheduleInfo,
  insertscheduleInfo,
  updatescheduleInfo,
  getscheduleInfo,
  getschedulebycategoryInfo,
  deletescheduleInfo,
  patchschedulepickInfo,
  updateachievementscheduleInfo,
  getdoneschedulecountInfo
};
