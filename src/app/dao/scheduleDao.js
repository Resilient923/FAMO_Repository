const { pool } = require("../../../config/database");

// 오늘일정생성
async function inserttodayscheduleInfo(inserttodayscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const inserttodayscheduleQuery = `
    insert into schedule(userID,scheduleName,scheduleDate,scheduleTime,
    scheduleCategoryID,scheduleMemo,scheduleStatus,scheduleDelete,
    scheduleCreatedAt,scheduleUpdatedAt,schedulePick,scheduleOrder)
    values (?,?,?,?,?,?,default,default,default,default,default,?+1);
    `;

    await connection.query(
      inserttodayscheduleQuery,
      inserttodayscheduleParams
    );
    connection.release();
  }catch (err) {
    connection.release();
  }
};

//일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
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
  }catch (err) {
    connection.release();
  }
};

//일정 생성시 Order값 받기
async function getOrderInfo(getOrderParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  
  try{
    const getOrderQuery = `
    select max(scheduleOrder) as 'maxScheduleOrder'
    from schedule
    where userID=? and scheduleDate=?;
    `;

    const getOrderRow = await connection.query(
      getOrderQuery,
      getOrderParams
    );
    connection.release();
    return getOrderRow;

  }catch (err) {
    connection.release();
  }
};

//일정 수정
async function updatescheduleInfo(updatescheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
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
  }catch (err) {
    connection.release();
  }
};

//일정수정할때 스케쥴날짜 가져오는 Dao
async function getdate(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const getdateQuery = `
    select scheduleDate
    from schedule
    where scheduleID = ${scheduleID};
    `; 
  
    const getdateRow = await connection.query(
      getdateQuery,  
    );
    connection.release();
    return getdateRow; 
  }catch (err) {
    connection.release();
  }
};

//유저별전체일정 조회
async function getscheduleInfo(userID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getscheduleQuery = `        
    select scheduleID, 
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate', 
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
    `;
  
    const getscheduleRow = await connection.query(
      getscheduleQuery,
    );
    connection.release();
    return getscheduleRow;
  }catch (err){
    connection.release();
  }
};

//유저별오늘일정 조회
async function getscheduletodayInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
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
      scheduleOrder,
      concat(date_format(scheduleDate, '%Y년 %m월 %d일'), ' ', SUBSTR( _UTF8'일월화수목금토', DAYOFWEEK( scheduleDate ), 1 ),'요일') as 'scheduleFormDate'
    from schedule
        left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
    where scheduleDelete = 1
    and schedule.userID = ${userID} and scheduleDate = current_date 
    order by scheduleOrder;
    `;
    
    const getscheduletodayRow = await connection.query(
      getscheduletodayQuery, 
    );
    connection.release();
    return getscheduletodayRow;
  }catch (err) {
    connection.release();
  }
};

//카테고리별 일정 조회
async function getschedulebycategoryInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const getschedulebycategoryQuery = `
    select scheduleID,
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
    scheduleName,
    scheduleMemo,
    schedulePick,
    colorInfo
    from schedule
    left join category on categoryID = scheduleCategoryID
    left join categoryColor on categoryColor = colorID
    where scheduleDelete = 1
    and schedule.userID = ${userID}
    and scheduleCategoryID = ${schedulecategoryID}
    limit ${offset},${limit};
    `; 
    
    const getschedulebycategoryRow = await connection.query(
      getschedulebycategoryQuery,  
    );
    connection.release();
    return getschedulebycategoryRow;
  }catch (err) {
    connection.release();
  }
};

//일정삭제
async function deletescheduleInfo(userID,scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const deletescheduleQuery = `        
    update schedule
    set scheduleDelete = -1
    where scheduleID='${scheduleID}' and userID = ${userID};
    `;
  
    const deletescheduleRow = await connection.query(
      deletescheduleQuery, 
    );
    connection.release();
    return deletescheduleRow;
  }catch (err) {
    connection.release();
  }
};

//일정삭제 순서초기화
async function orderrefresh1() {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const orderrefresh1Query = `
    select @scheduleOrder:=-1;
    `;
    const orderrefresh1Row = await connection.query(
      orderrefresh1Query,
    );
    connection.release();
    return orderrefresh1Row;
  }catch (err) {
    connection.release();
  }
};

async function orderrefresh2(userID,Date) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const orderrefresh2Query = `
    update schedule
    set scheduleOrder=@scheduleOrder := @scheduleOrder + 1
    where userID = '${userID}' and scheduleDelete =1 and scheduleDate = '${Date}' order by scheduleOrder;
    `;
    const orderrefresh2Row = await connection.query(
      orderrefresh2Query, 
    );
    connection.release();
    return orderrefresh2Row;
  }catch (err) {
    connection.release();
  }
};

//삭제할때 일정날짜받아오기
async function orderrefresh3(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const orderrefresh3Query = `
    select scheduleDate, scheduleOrder from schedule where scheduleID = '${scheduleID}';
    `;

    const orderrefresh3Row = await connection.query(
      orderrefresh3Query,   
    );
    connection.release();
    return orderrefresh3Row;
  }catch (err) {
    connection.release();
  }
};

async function orderrefresh(userID, scheduleDate, scheduleOrder){
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const orderrefreshQuery = `
    UPDATE schedule
    SET scheduleOrder = scheduleOrder - 1
    WHERE userID = ${userID} AND scheduleDelete = 1 AND scheduleDate = '${scheduleDate}' AND scheduleOrder > ${scheduleOrder}
    ORDER BY scheduleOrder;
    `;
  
    await connection.query(
      orderrefreshQuery,
    );
    connection.release();
  }catch (err) {
    connection.release();
  }
};

//일정 즐겨찾기,즐겨찾기 취소
async function patchschedulepickInfo(scheduleID,userID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
    const patchschedulepickQuery = `        
    update schedule
    set schedulePick = if(schedulePick = 1, -1, 1)
    where scheduleID = '${scheduleID}' and userID = ${userID};
    `;
  
    const patchschedulepickRow = await connection.query(
      patchschedulepickQuery, 
    );
    connection.release();
    return patchschedulepickRow;
  }catch (err) {
    connection.release();
  }
};

//일정완료 , 완료취소
async function updateachievementscheduleInfo(scheduleID,userID) {
  const connection = await pool.getConnection(async (conn) => conn);

  try{
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
  }catch (err) {
    connection.release();
  }
};

//유저별 해낸 일정 개수 조회
async function getdoneschedulecountInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getdoneschedulecountQuery = `
    select count(scheduleID) as 'doneScheduleCount'
    from schedule
    where userID ='${userID}' and scheduleStatus = 1 and scheduleDelete = 1
    `; 
  
    const getdoneschedulecountRow = await connection.query(
      getdoneschedulecountQuery,   
    );
    connection.release();
    return getdoneschedulecountRow;
  }catch(err){
    connection.release();
  }
};

//남은일정수조회
async function getremaintotalscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getremainscheduleQuery = `
    select count(scheduleID) as 'remainScheduleCount'
    from schedule
    where userID ='${userID}' and scheduleStatus = -1 and scheduleDelete = 1;
    `; 
  
    const getremainscheduleRow = await connection.query(
      getremainscheduleQuery, 
    );
    connection.release();
    return getremainscheduleRow;
  }catch(err){
    connection.release();
  }
};

//오늘남은일정
async function getremaintodayscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getremaintodayscheduleQuery = `
    select count(scheduleID) as 'remainScheduleCount'
    from schedule
    where userID = ${userID} and scheduleStatus = -1 and scheduleDate = current_date() and scheduleDelete = 1;
    `;
  
    const getremaintodayscheduleRow = await connection.query(
      getremaintodayscheduleQuery,   
    );
    connection.release();
    return getremaintodayscheduleRow;
  }catch(err){
    connection.release();
  }
};

//날짜별일정조회
async function getschedulebydateInfo(userID,scheduleDate) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getschedulebydateQuery = `
    select scheduleID,
      date_format(scheduleDate, '%e %b') as 'scheduleDate',
      scheduleName,
      scheduleMemo,
      categoryID,
      categoryName,
      colorInfo,
      concat(date_format(scheduleDate, '%Y년 %m월 %d일'), ' ', SUBSTR( _UTF8'일월화수목금토', DAYOFWEEK( scheduleDate ), 1 ),'요일') as 'scheduleFormDate',
      scheduleOrder
    from schedule
        left join category on category.categoryID = schedule.scheduleCategoryID
        left join categoryColor ON categoryColor.colorID = category.categoryColor
    where scheduleDelete = 1
    and schedule.userID = ${userID} and scheduleDate = '${scheduleDate}'
    order by scheduleOrder;
    `;
    
    const getschedulebydateRow = await connection.query(
      getschedulebydateQuery, 
    );
    connection.release();
    return getschedulebydateRow;
  }catch(err){
    connection.release();
  }
};

//월별일정조회
async function getschedulemonthInfo(userID,month,year) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getschedulemonthQuery = `
    SELECT
    date_format(scheduleDate, '%e %b') as 'scheduleDate',
      scheduleDate as 'scheduleForm',
      scheduleID,
      scheduleName,
      scheduleMemo,
      colorInfo,
      scheduleOrder
    FROM schedule
    left join category  on schedule.scheduleCategoryID = category.categoryID
    left join categoryColor on categoryColor = colorID
    where schedule.userID = ${userID} and MONTH(scheduleDate) = '${month}' 
    and Year(scheduleDate) = '${year}' and scheduleDelete = 1
    order by scheduleOrder;
    `; 
  
    const getschedulemonthRow = await connection.query(
      getschedulemonthQuery,
    );
    connection.release();
    return getschedulemonthRow;
  }catch(err){
    connection.release();
  }
};

//월별일정조회시 월별날짜조회
async function getscheduledayInfo(userID,month,year) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getscheduledayQuery = `
    select distinct date_format(scheduleDate,'%Y-%m-%d') as 'date'
    from schedule
    where schedule.userID = '${userID}' and MONTH(scheduleDate) = '${month}' 
    and Year(scheduleDate) = '${year}' and scheduleDelete = 1
    order by scheduleDate;
    `; 
  
    const getscheduledayRow = await connection.query(
      getscheduledayQuery,   
    );
    connection.release();
    return getscheduledayRow;
  }catch(err){
    connection.release();
  }
};

//일정상세조회
async function getscheduledetailsInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getscheduledetailsQuery = `
    select 
    concat(date_format(scheduleDate, '%c월 %e일' ), ' ', concat('(',SUBSTR( _UTF8'일월화수목금토', DAYOFWEEK( scheduleDate ), 1 ),')')) as 'scheduleDate',
    scheduleDate as 'scheduleForm',
      categoryName,
      scheduleName,
      scheduleMemo,
      scheduleTime,
      colorInfo
    from schedule
    left join category  on schedule.scheduleCategoryID = category.categoryID
    left join categoryColor on categoryColor = colorID
    where scheduleID = ${scheduleID};
    `;
  
    const getscheduledetailsRow = await connection.query(
      getscheduledetailsQuery
    );
    connection.release();
    return getscheduledetailsRow;
  }catch(err){
    connection.release();
  }
};

//월별해낸일정수조회
async function getdonemonthcountInfo(userID,scheduleDate) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getdoneschedulecountQuery = `
    select count(scheduleID) as 'doneScheduleCount'
    from schedule
    where userID = ${userID} and scheduleDelete = 1 and scheduleStatus = -1 and scheduleDate = '${scheduleDate}';
    `; 
  
    const getdoneschedulecountRow = await connection.query(
      getdoneschedulecountQuery,   
    );
    connection.release();
    return getdoneschedulecountRow;
  }catch(err){
    connection.release();
  }
};

//즐겨찾기한일정조회
async function getpickscheduleInfo(userID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
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
    where schedule.userID = '${userID}' and schedulePick = 1 and scheduleDelete = 1
    order by schedulePick desc 
    limit ${offset},${limit};
    `; 
  
    const getpickscheduleRow = await connection.query(
      getpickscheduleQuery, 
    );
    connection.release();
    return getpickscheduleRow;
  }catch(err){
    connection.release();
  }
};

//최근 생성일정조회
async function getrecentscheduleInfo(userID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
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
    where schedule.userID = '${userID}' and scheduleDelete = 1
    order by scheduleDate desc 
    limit ${offset},${limit};
    `; 
  
    const getrecentscheduleRow = await connection.query(
      getrecentscheduleQuery,  
    );
    connection.release();
    return getrecentscheduleRow;
  }catch(err){
    connection.release();
  }
};

//카테고리가 미선택된 일정 조회
async function getnocategory(userID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getnocategoryQuery = `
    select scheduleID,
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
      scheduleName,
      scheduleMemo,
      schedulePick
    from schedule
    where scheduleDelete = 1 
    and schedule.userID = ${userID}
    and scheduleCategoryID is NULL
    order by scheduleDate desc
    limit ${offset},${limit};
    `; 
    const getnocategoryRow = await connection.query(
      getnocategoryQuery, 
    );
    connection.release();
    return getnocategoryRow;
  }catch(err){
    connection.release();
  }
};

//카테고리별 최신순 정렬 일정 조회
async function getscategoryrecentInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getscategoryrecentQuery = `
    select scheduleID,
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
      scheduleName,
      scheduleMemo,
      schedulePick,
      colorInfo
    from schedule
    left join category on categoryID = scheduleCategoryID
    left join categoryColor on categoryColor = colorID
    where scheduleDelete = 1
    and schedule.userID = ${userID}
    and scheduleCategoryID = ${schedulecategoryID}
    order by scheduleDate desc 
    limit ${offset},${limit};
    `; 
  
    const getscategoryrecentRow = await connection.query(
      getscategoryrecentQuery, 
    );
    connection.release();
    return getscategoryrecentRow;
  }catch(err){
    connection.release();
  }
};

//카테고리별 남은순 정렬 일정 조회
async function getscategoryleftInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getscategoryleftQuery = `
    select scheduleID,
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
      scheduleName,
      scheduleMemo,
      schedulePick,
      colorInfo
    from schedule
        left join category on categoryID = scheduleCategoryID
        left join categoryColor on categoryColor = colorID
    where scheduleDelete = 1
    and schedule.userID = ${userID}
    and scheduleCategoryID = ${schedulecategoryID}
    order by scheduleStatus
    limit ${offset},${limit};
    `; 
  
    const getscategoryleftRow = await connection.query(
      getscategoryleftQuery,     
    );
    connection.release();
    return getscategoryleftRow;
  }catch(err){
    connection.release();
  }
};

//카테고리별 완료순 정렬 일정 조회
async function getscategorydoneInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const getscategorydoneQuery = `
    select scheduleID,
    date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
      scheduleName,
      scheduleMemo,
      schedulePick,
      colorInfo
    from schedule
    left join category on categoryID = scheduleCategoryID
    left join categoryColor on categoryColor = colorID
    where scheduleDelete = 1
    and schedule.userID = ${userID}
    and scheduleCategoryID = ${schedulecategoryID}
    order by scheduleStatus desc
    limit ${offset},${limit};
    `; 
    
    const getscategorydoneRow = await connection.query(
      getscategorydoneQuery,
    );
    connection.release();
    return getscategorydoneRow;
  }catch(err){
    connection.release();
  }
};

//카테고리별 즐겨찾기 정렬 일정 조회
async function getscategorypickInfo(userID,schedulecategoryID,offset,limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getscategorypickQuery = `
  select scheduleID,
  date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
       scheduleName,
       scheduleMemo,
       schedulePick,
       colorInfo
from schedule
left join category on categoryID = scheduleCategoryID
left join categoryColor on categoryColor = colorID
where scheduleDelete = 1
  and schedule.userID = ${userID}
  and scheduleCategoryID = ${schedulecategoryID}
order by scheduleDate desc
limit ${offset},${limit};
`; 
  
  const  getscategorypickRow = await connection.query(
    getscategorypickQuery, 
  );
  connection.release();
  return getscategorypickRow;
  }catch(err){
    connection.release();
  }
};

//월별 해낸일정수조회
async function getdoneschedulemonthInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getdoneschedulemonthQuery = `
  SELECT
  MONTH(scheduleDate) as 'month',
  concat((extract(year from scheduleDate)), '-', date_format(scheduleDate,'%m')) as 'yearmonth',
       COUNT(*) as 'scheduleCount'
FROM schedule
WHERE scheduleDate AND userID = ${userID} AND scheduleStatus = 1 AND scheduleDelete = 1
GROUP by extract(year_month from scheduleDate)
order by extract(year_month from scheduleDate) desc
limit 6;
`; 
  
  const  getdoneschedulemonthRow = await connection.query(
    getdoneschedulemonthQuery, 
  );
  connection.release();
  return getdoneschedulemonthRow;
  }catch(err){
    connection.release();
  }
};

//월별 전체일정수조회
async function getdonescheduletotalInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getdonescheduletotalQuery = `
  SELECT
  MONTH(scheduleDate) as 'month',
  concat((extract(year from scheduleDate)), '-', date_format(scheduleDate,'%m')) as 'yearmonth',
       COUNT(*) as 'scheduleCount'
FROM schedule
WHERE scheduleDate and userID = ${userID} and scheduleDelete = 1
GROUP by extract(year_month from scheduleDate)
order by extract(year_month from scheduleDate) desc
limit 6;
`; 
  
  const getdonescheduletotalRow = await connection.query(
    getdonescheduletotalQuery, 
  );
  connection.release();
  return getdonescheduletotalRow;
  }catch(err){
    connection.release();
  }
};

//전체일정수 조회 6개씩
async function gettotalscheduleInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const gettotalscheduleQuery = `
  select count(scheduleID) as 'totalScheduleCount'
  from schedule
  where userID= ${userID} and scheduleDelete = 1;
`; 
  
  const gettotalscheduleRow = await connection.query(
    gettotalscheduleQuery, 
    
  );
  connection.release();
  return gettotalscheduleRow;
  }catch(err){
    connection.release();
  }
};

//검색 (scheduleID받아오기) 제목으로
async function getIdFromScheduleNameInfo(searchWord,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getIdFromScheduleNameQuery = `
  select scheduleID
  from schedule
  where scheduleName like concat('%','${searchWord}','%') and userID = ${userID}
  and scheduleDelete = 1;
`; 
  
  const [getIdFromScheduleNameRow] = await connection.query(
    getIdFromScheduleNameQuery,
    
  );
  connection.release();
  return getIdFromScheduleNameRow;
  }catch(err){
    connection.release();
  }
};

//검색 (scheduleID받아오기) 내용으로
async function getIdFromScheduleMemoInfo(searchWord,userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getIdFromScheduleMemoQuery = `
  select scheduleID
from schedule
where scheduleMemo like concat('%', '${searchWord}' ,'%') and userID = ${userID}
and scheduleDelete = 1;
`; 
  
  const [getIdFromScheduleMemoRow] = await connection.query(
    getIdFromScheduleMemoQuery, 
    
  );
  connection.release();
  return getIdFromScheduleMemoRow;
  }catch(err){
    connection.release();
  }
};

//검색(schedule정보 받아오기) 
async function getscheduleFromMemoInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getscheduleFromNameQuery = `
  select scheduleID,
       scheduleName,
       scheduleMemo,
       date_format(scheduleDate, '%Y.%m.%d') as 'scheduleDate',
       schedulePick,
    colorInfo
FROM schedule
         left join category on schedule.scheduleCategoryID = category.categoryID
         left join categoryColor on categoryColor = colorID
where scheduleID= ${scheduleID} and scheduleDelete = 1
`; 
  
  const [getscheduleFromNameRow] = await connection.query(
    getscheduleFromNameQuery, 
  );
  connection.release();
  return getscheduleFromNameRow;
  }catch(err){
    connection.release();
  }
};

//검색히스토리생성
async function insertSearchHistoryInfo(userID,searchWord) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const insertSearchHistoryQuery = `
  insert into searchHistory(userID, searchHistory, historyCreatedAt, historyUpdatedAt)
values (${userID}, '${searchWord}' ,default,default);
`; 
  
  const insertSearchHistoryRow = await connection.query(
    insertSearchHistoryQuery,     
  );
  connection.release();
  return insertSearchHistoryRow;
  }catch(err){
    connection.release();
  }
};

//유저별검색기록조회
async function gethistoryInfo(userID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const gethistoryQuery = `
  select distinct searchHistory
from searchHistory
where userID = ${userID}
order by historyCreatedAt desc
limit 10;
`; 
  
  const gethistoryRow = await connection.query(
    gethistoryQuery,
  );
  connection.release();
  return gethistoryRow;
  }catch(err){
    connection.release();
  }
};

//검색기록삭제
async function deletehistoryInfo(userID,searchHistory) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const deletehistoryQuery = `
  delete from searchHistory where userID= ${userID} and searchHistory = '${searchHistory}'; 
`;
  
  const deletehistoryRow = await connection.query(
    deletehistoryQuery  
  );
  connection.release();
  return deletehistoryRow;
  }catch(err){
    connection.release();
  }
};

//일정순서변경 자리생성(x<y)
async function updateOrder2Info(userID,scheduleID,x,y) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const updateOrder2Query = `
  update schedule
set scheduleOrder = scheduleOrder-1
where userID= ${userID} and scheduleID != ${scheduleID} and scheduleOrder > ${x} and ${y} >= scheduleOrder;
`;
  
  const updateOrder2Row = await connection.query(
    updateOrder2Query,  
  );
  connection.release();
  return updateOrder2Row;
  }catch(err){
    connection.release();
  }
};

//일정순서변경 자리생성(x>y)
async function updateOrder1Info(userID,scheduleID,x,scheduleOrder) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const updateOrderQuery = `
  update schedule
set scheduleOrder = scheduleOrder+1
where userID= ${userID} and scheduleID != ${scheduleID} and scheduleOrder >= ${scheduleOrder} and ${x} > scheduleOrder;
`; 
  
  const updateOrderRow = await connection.query(
    updateOrderQuery, 
  );
  connection.release();
  return updateOrderRow;
  }catch(err){
    connection.release();
  }
};

async function updateOrder0Info(userID,scheduleID,scheduleOrder) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const updateOrder2Query = `
  update schedule
  set scheduleOrder = ${scheduleOrder} where userID = ${userID} and scheduleID = ${scheduleID};
`; 
  
  const updateOrder2Row = await connection.query(
    updateOrder2Query, 
  );
  connection.release();
  return updateOrder2Row;
  }catch(err){
    connection.release();
  }
};

async function updateOrder3Info(getOrderParams){
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    const updateOrder3Query = `
    UPDATE schedule
    SET scheduleOrder = scheduleOrder + 1
    WHERE userID = ? AND scheduleDate = ?;
    `;

    await connection.query(
      updateOrder3Query,
      getOrderParams,
    );
    connection.release();
  }catch (err) {
    connection.release();
  }
}

//순서변경하고자 하는 일정ID 가져오기
async function getscheduleIDInfo(scheduleID) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
  const getscheduleIDQuery = `
 select scheduleOrder,scheduleDelete from schedule where scheduleID = ${scheduleID};
`; 
  
  const getscheduleIDRow = await connection.query(
    getscheduleIDQuery, 
  );
  connection.release();
  return getscheduleIDRow;
  }catch(err){
    connection.release();
  }
};

module.exports = {
  getscheduleIDInfo,
  inserttodayscheduleInfo,
  insertscheduleInfo,
  updatescheduleInfo,
  orderrefresh,
  orderrefresh1,
  orderrefresh2,
  orderrefresh3,
  getdate,
  getscheduleInfo,
  getscheduletodayInfo,
  getnocategory,
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
  getOrderInfo,
  updateOrder0Info,
  updateOrder1Info,
  updateOrder2Info,
  updateOrder3Info,

  //검색기록삭제
  deletehistoryInfo  
};
