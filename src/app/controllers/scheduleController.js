const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const scheduleDao = require('../dao/scheduleDao');
//일정생성
exports.insertschedule = async function (req, res) {
   const {
        userID, scheduleName, scheduleDate,scheduleCategoryID,scheduleMemo
    } = req.body

    if (!userID) {
        return res.json({
            isSuccess: false,
            code: 205,
            message: "유저고유번호를 입력해주세요."
        });
    }
    if (!scheduleName) {
        return res.json({
            isSuccess: false,
            code: 206,
            message: "일정제목을 입력해주세요."
        });
    }  
    if (!scheduleDate) {
        return res.json({
            isSuccess: false,
            code: 207,
            message: "일정 날짜를 입력해주세요"
        });
    }  
    try {
        // 일정생성
        const insertscheduleParams = [userID, scheduleName, scheduleDate, scheduleCategoryID,scheduleMemo];
        const insertscheduleInfoRows = await scheduleDao.insertscheduleInfo(insertscheduleParams);

        return res.json({
            isSuccess: true,
            code: 100,
            message: "일정 생성 성공"

        });
        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            // connection.release();
            logger.error(`일정생성 에러\n: ${err.message}`);
            return res.status(401).send(`Error: ${err.message}`);
        }
};