module.exports = function(app){
    const schedule = require('../controllers/scheduleController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
    app.post('/schedules',jwtMiddleware,schedule.insertschedule); // 일정생성
    app.patch('/schedules/:scheduleID',jwtMiddleware,schedule.updateschedule); //일정수정
    app.get('/schedules',jwtMiddleware,schedule.getschedule); //일정조회
    app.put('/schedules/:scheduleID',jwtMiddleware,schedule.deleteschedule); //일정삭제
    //카테고리별일정조회
    app.get('/schedules?scheduleCategoryID=?',jwtMiddleware,schedule.getschedulebycategory);
};
