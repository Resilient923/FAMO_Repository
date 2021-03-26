module.exports = function(app){
    const schedule = require('../controllers/scheduleController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
  //  app.post('/schedules',jwtMiddleware,schedule.inserttodayschedule); // 오늘일정생성
    app.patch('/schedules/:scheduleID',jwtMiddleware,schedule.updateschedule); //일정수정
    app.get('/schedules',jwtMiddleware,schedule.getschedule); //유저별전체일정조회
    app.get('/schedules/today',jwtMiddleware,schedule.getscheduletoday);//유저별오늘일정조회
    app.put('/schedules/:scheduleID',jwtMiddleware,schedule.deleteschedule); //일정삭제
    //카테고리별일정조회
    app.get('/category-schedules',jwtMiddleware,schedule.getschedulebycategorysort);
    app.post('/schedules',jwtMiddleware,schedule.insertschedule); //일정생성(월별)
    
    app.post('/schedules/picks',jwtMiddleware,schedule.patchschedulepick);//즐겨찾기
    app.post('/schedules/achievements/today',jwtMiddleware,schedule.updateachievementschedule);//일정완료버튼
  //  app.get('/schedules/achievements',jwtMiddleware,schedule.getdoneschedulecount);//총해낸일정수조회
    app.get('/schedules/dates',jwtMiddleware,schedule.getschedulebydate);//날짜별일정조회
    app.get('/schedules/left-over',jwtMiddleware,schedule.getremainschedule);//남은일정수조회
    app.get('/schedules/:scheduleID/details',jwtMiddleware,schedule.getscheduledetails);//일정상세조회
  
  
    //월별해낸일정수조회
    //app.get('/schedules/months/achievements',jwtMiddleware,schedule.getdonemonthcount);
//즐겨찾기일정조회
    app.get('/schedules/picks',jwtMiddleware,schedule.getpickschedule);
    //최근생성일정조회
    app.get('/schedules/recents',jwtMiddleware,schedule.getrecentschedule);
   
    //카테고리별 정렬 일정 조회
    //app.get('/category-schedules',jwtMiddleware,schedule.getschedulebycategory);
    app.get('/schedules/months',jwtMiddleware,schedule.getschedulemonth);//월별일정조회
    app.get('/schedules/months/achievements',jwtMiddleware,schedule.getdoneschedulemonth);//월별달성률조회
    app.get('/schedules/counts',jwtMiddleware,schedule.gettotalschedule);
    //전체일정수,총해낸일정수조회
  
    app.get('/schedules/search',jwtMiddleware,schedule.searchSchedule);//일정검색
    app.post('/schedules/orderchanges',jwtMiddleware,schedule.updateOrder);//일정순서변경
    
    app.get('/schedules/search/histories',jwtMiddleware,schedule.gethistory);//검색기록조회
    app.delete('/schedules/search/histories',jwtMiddleware,schedule.deletehistory);//검색기록삭제
  };
