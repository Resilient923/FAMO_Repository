module.exports = function(app){
    const schedule = require('../controllers/scheduleController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
    app.post('/schedule',schedule.insertschedule);
};
