const { pool } = require("../../../config/database");

// 오늘일정생성
async function inserttodayscheduleInfo(inserttodayscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const inserttodayscheduleQuery = `
  insert into schedule(userID,scheduleName,scheduleDate,scheduleTime,
    scheduleCategoryID,scheduleMemo,scheduleStatus,scheduleDelete,
    scheduleCreatedAt,scheduleUpdatedAt,schedulePick,scheduleOrder)
  values (?,?,current_date(),?,?,?,default,default,default,default,default,?+1);
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
    scheduleDelete, scheduleCreatedAt, scheduleUpdatedAt, schedulePick,scheduleOrder)
  values (?, ?, ?, ?, ?, ?, default, default, default, default, default,?+1);
  `;

  await connection.query(
    insertscheduleQuery,
    insertscheduleParams
  );
  connection.release();
}
//일정 생성시 Order값 받기
async function getOrderInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getOrderQuery = `
  select max(scheduleOrder) as 'maxScheduleOrder'
from schedule
where userID='${userID}';
  `;

  const getOrderRow = await connection.query(
    getOrderQuery,
    
  );
  connection.release();
  return getOrderRow;
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
//일정수정할때 스케쥴날짜 가져오는 Dao

async function getdate(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getdateQuery = `
  select scheduleDate
       
from schedule

where scheduleID = '${scheduleID}';
`; 
  
  const getdateRow = await connection.query(
    getdateQuery, 
    
  );
  connection.release();
  return getdateRow;
}
//유저별전체일정 조회
async function getscheduleInfo(userID,offset,limit) {
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
  where scheduleDelete = 1 and schedule.userID = '${userID}'
  limit ${offset},${limit};
  ;
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
       colorInfo,
       scheduleOrder
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where scheduleDelete = 1
and schedule.userID = '${userID}' and scheduleDate = current_date 
order by scheduleOrder desc;
  `;
  
  const getscheduletodayRow = await connection.query(
    getscheduletodayQuery,
    //updatescheduleParams 
  );
  connection.release();
  return getscheduletodayRow;
}
//카테고리별 일정 조회
async function getschedulebycategoryInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getschedulebycategoryQuery = `
        
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
limit ${offset},${limit}
;
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
       date_format(scheduleDate, '%Y-%m-%d') as 'scheduleFormDate',
       scheduleOrder
from schedule
         left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
where scheduleDelete = 1
and schedule.userID = '${userID}' and scheduleDate = '${scheduleDate}'
order by scheduleOrder desc;
`; 
  
  const getschedulebydateRow = await connection.query(
    getschedulebydateQuery, 
    
  );
  connection.release();
  return getschedulebydateRow;
}
//월별일정조회
async function getschedulemonthInfo(userID,month,year) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getschedulemonthQuery = `
  SELECT
    date_format(scheduleDate, ' %e %b') as 'scheduleDate',
       scheduleDate as 'scheduleForm',
       scheduleID,
       scheduleName,
       scheduleMemo,
       colorInfo,
       scheduleOrder
FROM schedule
left join category  on schedule.scheduleCategoryID = category.categoryID
left join categoryColor on categoryColor = colorID
where schedule.userID = '${userID}' and MONTH(scheduleDate) = '${month}' 
and Year(scheduleDate) = '${year}'
order by scheduleOrder desc;
`; 
  
  const getschedulemonthRow = await connection.query(
    getschedulemonthQuery, 
    
  );
  connection.release();
  return getschedulemonthRow;
}
//월별일정조회시 월별날짜조회
async function getscheduledayInfo(userID,month,year) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduledayQuery = `
  select distinct date_format(scheduleDate,'%e일') as 'date'
from schedule
where schedule.userID = '${userID}' and MONTH(scheduleDate) = '${month}' 
and Year(scheduleDate) = '${year}'
order by scheduleDate;
`; 
  
  const getscheduledayRow = await connection.query(
    getscheduledayQuery, 
    
  );
  connection.release();
  return getscheduledayRow;
}
//일정상세조회
async function getscheduledetailsInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduledetailsQuery = `
  select date_format(scheduleDate, '%c월 %e일 %a') as 'scheduleDate',
  scheduleDate as 'scheduleForm',
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
async function getpickscheduleInfo(userID,offset,limit) {
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
order by schedulePick desc 
limit ${offset},${limit}
;
`; 
  
  const  getpickscheduleRow = await connection.query(
    getpickscheduleQuery, 
    
  );
  connection.release();
  return getpickscheduleRow;
}
//최근 생성일정조회
async function getrecentscheduleInfo(userID,offset,limit) {
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
order by scheduleDate desc 
limit ${offset},${limit};
`; 
  
  const  getrecentscheduleRow = await connection.query(
    getrecentscheduleQuery, 
    
  );
  connection.release();
  return getrecentscheduleRow;
}
//카테고리별 최신순 정렬 일정 조회
async function getscategoryrecentInfo(userID,schedulecategoryID,offset,limit) {
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
order by scheduleDate desc 
limit ${offset},${limit}
;
`; 
  
  const  getscategoryrecentRow = await connection.query(
    getscategoryrecentQuery, 
    
  );
  connection.release();
  return getscategoryrecentRow;
}
//카테고리별 남은순 정렬 일정 조회
async function getscategoryleftInfo(userID,schedulecategoryID,offset,limit) {
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
order by scheduleStatus
limit ${offset},${limit} 
;
`; 
  
  const  getscategoryleftRow = await connection.query(
    getscategoryleftQuery, 
    
  );
  connection.release();
  return getscategoryleftRow;
}
//카테고리별 완료순 정렬 일정 조회
async function getscategorydoneInfo(userID,schedulecategoryID,offset,limit) {
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
order by scheduleStatus desc
limit ${offset},${limit}
;
`; 
  
  const  getscategorydoneRow = await connection.query(
    getscategorydoneQuery, 
    
  );
  connection.release();
  return getscategorydoneRow;
}
//카테고리별 즐겨찾기 정렬 일정 조회
async function getscategorypickInfo(userID,schedulecategoryID,offset,limit) {
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
order by scheduleDate desc
limit ${offset},${limit};

`; 
  
  const  getscategorypickRow = await connection.query(
    getscategorypickQuery, 
    
  );
  connection.release();
  return getscategorypickRow;
}
//월별 해낸일정수조회
async function getdoneschedulemonthInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getdoneschedulemonthQuery = `
  SELECT
  MONTH(scheduleDate) as 'month',
  concat((extract(year from scheduleDate)), '-', date_format(scheduleDate,'%m')) as 'yearmonth',
       COUNT(*) as 'scheduleCount'
FROM schedule
WHERE scheduleDate

  and userID = '${userID}' and scheduleStatus = 1
GROUP by extract(year_month from scheduleDate)
order by extract(year_month from scheduleDate) desc
limit 6;
`; 
  
  const  getdoneschedulemonthRow = await connection.query(
    getdoneschedulemonthQuery, 
  );
  connection.release();
  return getdoneschedulemonthRow;
}
//월별 전체일정수조회
async function getdonescheduletotalInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getdonescheduletotalQuery = `
  SELECT
  MONTH(scheduleDate) as 'month',
  concat((extract(year from scheduleDate)), '-', date_format(scheduleDate,'%m')) as 'yearmonth',
       COUNT(*) as 'scheduleCount'
FROM schedule
WHERE scheduleDate

  and userID = '${userID}'
GROUP by extract(year_month from scheduleDate)
order by extract(year_month from scheduleDate) desc
limit 6;
`; 
  
  const getdonescheduletotalRow = await connection.query(
    getdonescheduletotalQuery, 
  );
  connection.release();
  return getdonescheduletotalRow;
}
//전체일정수 조회 6개씩
async function gettotalscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const gettotalscheduleQuery = `
  select count(scheduleID) as 'totalScheduleCount'
  from schedule
  where userID='${userID}';
`; 
  
  const gettotalscheduleRow = await connection.query(
    gettotalscheduleQuery, 
    
  );
  connection.release();
  return gettotalscheduleRow;
}
//검색 (scheduleID받아오기) 제목으로
async function getIdFromScheduleNameInfo(searchWord,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getIdFromScheduleNameQuery = `
  select scheduleID
from schedule
where scheduleName like concat('%','${searchWord}','%') and userID = '${userID}';
`; 
  
  const [getIdFromScheduleNameRow] = await connection.query(
    getIdFromScheduleNameQuery, 
    
  );
  connection.release();
  return getIdFromScheduleNameRow;
}

//검색 (scheduleID받아오기) 내용으로
async function getIdFromScheduleMemoInfo(searchWord,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getIdFromScheduleMemoQuery = `
  select scheduleID
from schedule
where scheduleMemo like concat('%','${searchWord}','%') and userID = '${userID}';
`; 
  
  const [getIdFromScheduleMemoRow] = await connection.query(
    getIdFromScheduleMemoQuery, 
    
  );
  connection.release();
  return getIdFromScheduleMemoRow;
}
//검색(schedule정보 받아오기) 
async function getscheduleFromMemoInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getscheduleFromNameQuery = `
  select scheduleID,
       scheduleName,
       scheduleMemo,
       scheduleDate,
       schedulePick,
    colorInfo
FROM schedule
         left join category on schedule.scheduleCategoryID = category.categoryID
         left join categoryColor on categoryColor = colorID
where scheduleID='${scheduleID}'

`; 
  
  const [getscheduleFromNameRow] = await connection.query(
    getscheduleFromNameQuery, 
    
  );
  connection.release();
  return getscheduleFromNameRow;
}
//검색히스토리생성
async function insertSearchHistoryInfo(userID,searchWord) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertSearchHistoryQuery = `
  insert into searchHistory(userID, searchHistory, historyCreatedAt, historyUpdatedAt)
values ('${userID}','${searchWord}',default,default);
`; 
  
  const insertSearchHistoryRow = await connection.query(
    insertSearchHistoryQuery, 
    
  );
  connection.release();
  return insertSearchHistoryRow;
}
//유저별검색기록조회
async function gethistoryInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const gethistoryQuery = `
  select distinct searchHistory
from searchHistory
where userID = '${userID}'
order by historyCreatedAt desc
limit 10;
`; 
  
  const gethistoryRow = await connection.query(
    gethistoryQuery, 
    
  );
  connection.release();
  return gethistoryRow;
}
//일정순서변경 자리생성
/* async function updateOrderInfo(userID,scheduleID,scheduleOrder) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateOrderQuery = `
  update schedule
set scheduleOrder = scheduleOrder+1
where userID='${userID}' and scheduleID!='${scheduleID}' and '${scheduleID}'>scheduleOrder>'${scheduleOrder}';
`; 
  
  const updateOrderRow = await connection.query(
    updateOrderQuery, 
    
  );
  connection.release();
  return updateOrderRow;
}
async function updateOrder2Info(userID,scheduleID,scheduleOrder) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateOrder2Query = `
  update schedule
  set scheduleOrder = '${scheduleOrder}' where userID ='${userID}' and scheduleID ='${scheduleID}'
`; 
  
  const updateOrder2Row = await connection.query(
    updateOrder2Query, 
    
  );
  connection.release();
  return updateOrder2Row;
}
//test
async function getOrder2Info(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getOrder2Query = `
  select scheduleName,
  scheduleOrder
  from schedule
  where userID = '${userID}';
`; 
  
  const getOrder2Row = await connection.query(
    getOrder2Query, 
    
  );
  connection.release();
  return getOrder2Row;
} */


module.exports = {
  inserttodayscheduleInfo,
  insertscheduleInfo,
  updatescheduleInfo,
  getdate,
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
  getschedulemonthInfo,
  getscheduledayInfo,
  getscheduledetailsInfo,
  getdonemonthcountInfo,
  getpickscheduleInfo,
  getrecentscheduleInfo,
  getscategoryrecentInfo,
  getscategoryleftInfo,
  getscategorydoneInfo,
  getscategorypickInfo,
  getdoneschedulemonthInfo,
  gettotalscheduleInfo,
  getdonescheduletotalInfo,
  //검색
  getIdFromScheduleNameInfo,
  getIdFromScheduleMemoInfo,
  insertSearchHistoryInfo,
  getscheduleFromMemoInfo,

  gethistoryInfo,

  //일정순서관려
  getOrderInfo/* ,
  updateOrderInfo,
  updateOrder2Info,
  getOrder2Info */
  
};
