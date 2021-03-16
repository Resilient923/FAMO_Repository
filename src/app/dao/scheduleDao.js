const { pool } = require("../../../config/database");

// 오늘일정생성
async function inserttodayscheduleInfo(inserttodayscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const inserttodayscheduleQuery = `
  insert into schedule(userID,scheduleName,scheduleDate,scheduleTime,
    scheduleCategoryID,scheduleMemo,scheduleStatus,scheduleDelete,scheduleCreatedAt,scheduleUpdatedAt,schedulePick)
  values (?,?,current_date(),?,?,?,default,default,default,default,default);
  `;

  await connection.query(
    inserttodayscheduleQuery,
    inserttodayscheduleParams
  );
  connection.release();
}
//일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertscheduleQuery = `
  insert into schedule(userID, scheduleName, scheduleDate, scheduleTime,
    scheduleCategoryID, scheduleMemo, scheduleStatus,
    scheduleDelete, scheduleCreatedAt, scheduleUpdatedAt, schedulePick)
  values (?, ?, ?, ?, ?, ?, default, default, default, default, default);
  `;

  await connection.query(
    insertscheduleQuery,
    insertscheduleParams
  );
  connection.release();
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
//유저별전체일정 조회
async function getscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduleQuery = `
        
  select scheduleID, date_format(scheduleDate, '%e %b') as 'scheduleDate', 
  scheduleName,
  scheduleMemo,
  schedulePick,
  scheduleStatus,
  colorInfo
  from schedule
  left join category on category.categoryID = schedule.scheduleCategoryID
  left join categoryColor ON categoryColor.colorID = category.categoryColor
  where scheduleDelete = 1 and schedule.userID = '${userID}';
  `;
  
  const getscheduleRow = await connection.query(
    getscheduleQuery,
    //updatescheduleParams 
  );
  connection.release();
  return getscheduleRow;
}
//유저별오늘일정 조회
async function getscheduletodayInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduletodayQuery = `
        
  select scheduleID,
       date_format(scheduleDate, '%e %b') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       scheduleStatus,
       categoryID,
       categoryName,
       colorInfo
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where scheduleDelete = 1
and schedule.userID = '${userID}' and scheduleDate = current_date;
  `;
  
  const getscheduletodayRow = await connection.query(
    getscheduletodayQuery,
    //updatescheduleParams 
  );
  connection.release();
  return getscheduletodayRow;
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
//남은일정수조회
async function getremaintotalscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getremainscheduleQuery = `
  select count(scheduleID) as 'remainScheduleCount'
from schedule
where userID ='${userID}' and scheduleStatus = -1 ;
`; 
  
  const  getremainscheduleRow = await connection.query(
    getremainscheduleQuery, 
    
  );
  connection.release();
  return getremainscheduleRow;
}
//오늘남은일정
async function getremaintodayscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getremaintodayscheduleQuery = `
  select count(scheduleID) as 'remainScheduleCount'
from schedule
where userID ='${userID}' and scheduleStatus = -1 and scheduleDate = current_date();
`; 
  
  const  getremaintodayscheduleRow = await connection.query(
    getremaintodayscheduleQuery, 
    
  );
  connection.release();
  return getremaintodayscheduleRow;
}
//날짜별일정조회
async function getschedulebydateInfo(userID,scheduleDate) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getschedulebydateQuery = `
  select scheduleID,
       date_format(scheduleDate, '%e %b') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       categoryID,
       categoryName,
       colorInfo,
       date_format(scheduleDate, '%Y-%m-%d') as 'scheduleFormDate'
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where scheduleDelete = 1
and schedule.userID = '${userID}' and scheduleDate = '${scheduleDate}';
`; 
  
  const getschedulebydateRow = await connection.query(
    getschedulebydateQuery, 
    
  );
  connection.release();
  return getschedulebydateRow;
}
//일정상세조회
async function getscheduledetailsInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduledetailsQuery = `
  select date_format(scheduleDate, '%c월 %e일 %a') as 'scheduleDate',
       categoryName,
        scheduleName,
       scheduleMemo,
       scheduleTime,
        colorInfo
from schedule
left join category  on schedule.scheduleCategoryID = category.categoryID
left join categoryColor on categoryColor = colorID
where scheduleID = '${scheduleID}';
`; 
  
  const getscheduledetailsRow = await connection.query(
    getscheduledetailsQuery, 
    
  );
  connection.release();
  return getscheduledetailsRow;
}
//월별해낸일정수조회
async function getdonemonthcountInfo(userID,scheduleDate) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getdoneschedulecountQuery = `
  select count(scheduleID) as 'doneScheduleCount'
from schedule
where userID ='${userID}' and scheduleStatus = -1 and scheduleDate = '${scheduleDate}';
`; 
  
  const  getdoneschedulecountRow = await connection.query(
    getdoneschedulecountQuery, 
    
  );
  connection.release();
  return getdoneschedulecountRow;
}
//즐겨찾기한일정조회
async function getpickscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getpickscheduleQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       categoryID,
       colorInfo
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where schedule.userID = '${userID}' and schedulePick = 1 
order by scheduleDate desc ;
`; 
  
  const  getpickscheduleRow = await connection.query(
    getpickscheduleQuery, 
    
  );
  connection.release();
  return getpickscheduleRow;
}
//최근 생성일정조회
async function getrecentscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getrecentscheduleQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       categoryID,
       colorInfo
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where schedule.userID = '${userID}'
order by scheduleDate desc ;
`; 
  
  const  getrecentscheduleRow = await connection.query(
    getrecentscheduleQuery, 
    
  );
  connection.release();
  return getrecentscheduleRow;
}
//카테고리별 최신순 정렬 일정 조회
async function getscategoryrecentInfo(userID,schedulecategoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscategoryrecentQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y %m %d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
left join category on categoryID = scheduleCategoryID
left join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = '${userID}'
  and scheduleCategoryID = '${schedulecategoryID}'
order by scheduleDate desc ;
`; 
  
  const  getscategoryrecentRow = await connection.query(
    getscategoryrecentQuery, 
    
  );
  connection.release();
  return getscategoryrecentRow;
}
//카테고리별 남은순 정렬 일정 조회
async function getscategoryleftInfo(userID,schedulecategoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscategoryleftQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y %m %d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
         left join category on categoryID = scheduleCategoryID
         left join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = '${userID}'
  and scheduleCategoryID = '${schedulecategoryID}'
order by scheduleStatus  ;
`; 
  
  const  getscategoryleftRow = await connection.query(
    getscategoryleftQuery, 
    
  );
  connection.release();
  return getscategoryleftRow;
}
//카테고리별 완료순 정렬 일정 조회
async function getscategorydoneInfo(userID,schedulecategoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscategorydoneQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y %m %d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
left join category on categoryID = scheduleCategoryID
left join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = '${userID}'
  and scheduleCategoryID = '${schedulecategoryID}'
order by scheduleStatus desc ;
`; 
  
  const  getscategorydoneRow = await connection.query(
    getscategorydoneQuery, 
    
  );
  connection.release();
  return getscategorydoneRow;
}
//카테고리별 즐겨찾기 정렬 일정 조회
async function getscategorypickInfo(userID,schedulecategoryID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscategorypickQuery = `
  select scheduleID,
       date_format(scheduleDate, '%Y %m %d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
left join category on categoryID = scheduleCategoryID
left join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = '${userID}'
  and scheduleCategoryID = '${schedulecategoryID}'
order by scheduleDate desc ;
`; 
  
  const  getscategorypickRow = await connection.query(
    getscategorypickQuery, 
    
  );
  connection.release();
  return getscategorypickRow;
}

module.exports = {
  inserttodayscheduleInfo,
  insertscheduleInfo,
  updatescheduleInfo,
  getscheduleInfo,
  getscheduletodayInfo,
  getschedulebycategoryInfo,
  deletescheduleInfo,
  patchschedulepickInfo,
  updateachievementscheduleInfo,
  getdoneschedulecountInfo,
  getremaintotalscheduleInfo,
  getschedulebydateInfo,
  getremaintodayscheduleInfo,
  getscheduledetailsInfo,
  getdonemonthcountInfo,
  getpickscheduleInfo,
  getrecentscheduleInfo,
  getscategoryrecentInfo,
  getscategoryleftInfo,
  getscategorydoneInfo,
  getscategorypickInfo
};
