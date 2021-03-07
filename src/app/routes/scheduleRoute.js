module.exports = function(app){
    const schedule = require('../controllers/scheduleController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
    app.post('/schedules',schedule.insertschedule); // 일정생성
    app.patch('/schedules/:scheduleID',schedule.updateschedule); //일정수정
    app.get('/schedules',schedule.getschedule); //일정조회
    app.put('/schedules/:scheduleID',schedule.deleteschedule); //일정삭제
};
