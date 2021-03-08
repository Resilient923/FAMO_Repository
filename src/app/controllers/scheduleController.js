const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const scheduleDao = require('../dao/scheduleDao');
//일정생성
exports.insertschedule = async function (req, res) {
   const {
        scheduleName, scheduleDate,scheduleCategoryID,scheduleMemo
    } = req.body

    if (!scheduleName) {
        return res.json({
            isSuccess: false,
            code: 206,
            message: "일정제목을 입력해주세요."
        });
    }
    if (length(scheduleName)>=50) {
        return res.json({
            isSuccess: false,
            code: 310,
            message: "일정제목길이는 최대 50자입니다."
        });
    } 
    if (!scheduleDate) {
        return res.json({
            isSuccess: false,
            code: 207,
            message: "일정 날짜를 입력해주세요"
        });
    }  
    if (length(scheduleMemo) >= 100){
        return res.json({
            isSuccess: false,
            code: 309,
            message: "메모최대길이는 100자입니다"
        });
    }
    try {
        // 일정생성
        const userID = req.verifiedToken.userID;
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
//일정수정
exports.updateschedule = async function (req, res) {

    const scheduleID = req.params.scheduleID;
   
    const updatescheduleParams = [
        req.body.scheduleName,
        req.body.scheduleDate,
        req.body.scheduleCategoryID,
        req.body.scheduleMemo,
        scheduleID
    ];
    if (!scheduleID) {
        return res.json({ 
            isSuccess: false, 
            code: 208, 
            message: "일정 고유번호를 입력해주세요" });
    }
    if (length(req.body.scheduleMemo) >= 100){
        return res.json({
            isSuccess: false,
            code: 309,
            message: "메모최대길이는 100자입니다"
        });
    }
    if (length(req.body.scheduleName)>=50) {
        return res.json({
            isSuccess: false,
            code: 310,
            message: "일정제목길이는 최대 50자입니다."
        });
    }
    try {
        if (scheduleID <= 0) {
            return res.json({
                isSuccess: false,
                code: 209,
                message: "정확한일정 고유번호를 확인해주세요"
            });
        }
        const updateschedule = await scheduleDao.updatescheduleInfo(updatescheduleParams,scheduleID);
        if (updateschedule[0].affectedRows == 1) {
            return res.json({
                isSuccess: true,
                code: 100,
                message: "일정 수정 성공",
            });
        }else{
            return res.json({
                isSuccess: false,
                code: 306,
                message: "일정 수정 실패"
            });
        }
        
    } catch (err) {

        logger.error(`일정수정에러\n ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};
//일정 조회
exports.getschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getschedulerows = await scheduleDao.getscheduleInfo(userID);

        if (getschedulerows) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 일정 조회 성공",
                data : getschedulerows[0]
                

            });

        }else{
            return res.json({
                isSuccess: false,
                code: 307,
                message: "일정 조회 실패"
            });
        }
    } catch (err) {

        logger.error(`일정 조회\n ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};
//일정 삭제
exports.deleteschedule = async function (req, res) {
    const scheduleID = req.params.scheduleID;

    if (!scheduleID) {
        return res.json({ 
            isSuccess: false, 
            code: 208,
            message: "일정 고유번호를 입력해주세요" 
        });
    }

    try {
        if (scheduleID <= 0) {
            return res.json({
                isSuccess: false,
                code: 209,
                message: "정확한 일정 고유번호를 입력해주세요"
            });
        }

       // const connection = await pool.getConnection(async (conn) => conn);
        const deleteschedulerows = await scheduleDao.deletescheduleInfo(scheduleID);

         if (deleteschedulerows[0].affectedRows == 1) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: "일정 삭제 성공",
             });
        }else{
            return res.json({
                isSuccess: false,
                code: 308,
                message: "일정 삭제 실패"
            });
        }
    } catch (err) {

        logger.error(`일정 삭제 error: ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};
