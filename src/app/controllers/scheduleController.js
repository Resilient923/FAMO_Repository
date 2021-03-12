const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const scheduleDao = require('../dao/scheduleDao');
//오늘일정생성
exports.inserttodayschedule = async function (req, res) {
   const {
        scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo
    } = req.body;

    if (!scheduleName) {
        return res.json({
            isSuccess: false,
            code: 206,
            message: "일정제목을 입력해주세요."
        });
    }
    if (scheduleName.length >=50) {
        return res.json({
            isSuccess: false,
            code: 310,
            message: "일정제목길이는 최대 50자입니다."
        });
    } 
    if(scheduleMemo){
        if (scheduleMemo.length >= 100){
            return res.json({
                isSuccess: false,
                code: 309,
                message: "메모최대길이는 100자입니다"
            });
        }
    }  

    try {
        // 오늘일정생성
        const userID = req.verifiedToken.userID;
        const inserttodayscheduleParams = [userID, scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo];
        const inserttodayscheduleInfoRows = await scheduleDao.inserttodayscheduleInfo(inserttodayscheduleParams);

        return res.json({
            isSuccess: true,
            code: 100,
            message: "오늘 일정 생성 성공"

        });
        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            // connection.release();
            logger.error(`오늘일정생성 에러\n: ${err.message}`);
            return res.status(401).send(`Error: ${err.message}`);
        }
};
//일정생성(월캘린더에서 생성)
exports.insertschedule = async function (req, res) {
    const {
         scheduleName,scheduleTime,scheduleDate,scheduleCategoryID,scheduleMemo
     } = req.body;
     
     if (!scheduleName) {
         return res.json({
             isSuccess: false,
             code: 206,
             message: "일정제목을 입력해주세요."
         });
     }
     if (scheduleName.length >=50) {
         return res.json({
             isSuccess: false,
             code: 310,
             message: "일정제목길이는 최대 50자입니다."
         });
     } 
     if(scheduleMemo){
         if (scheduleMemo.length >= 100){
             return res.json({
                 isSuccess: false,
                 code: 309,
                 message: "메모최대길이는 100자입니다"
             });
         }
     }  
     if (!scheduleDate) {
        const userID = req.verifiedToken.userID;
        const inserttodayscheduleParams = [userID, scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo];
        const inserttodayscheduleInfoRows = await scheduleDao.inserttodayscheduleInfo(inserttodayscheduleParams);

        return res.json({
            isSuccess: true,
            code: 100,
            message: "오늘 일정 생성 성공"

        });
    }
 
     try {
         // 오늘일정생성
         const userID = req.verifiedToken.userID;
         const insertscheduleParams = [userID, scheduleName,scheduleDate,scheduleTime,scheduleCategoryID,scheduleMemo];
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
    if (scheduleID <= 0) {
        return res.json({
            isSuccess: false,
            code: 209,
            message: "정확한일정 고유번호를 확인해주세요"
        });
    }
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const updateschedule = await scheduleDao.updatescheduleInfo(updatescheduleParams,scheduleID);
        if(req.body.scheduleMemo){
            if (req.body.scheduleMemo.length >= 100){
                return res.json({
                    isSuccess: false,
                    code: 309,
                    message: "메모최대길이는 100자입니다"
                });
            }
        }
        
        if (req.body.scheduleName.length >= 50) {
            return res.json({
                isSuccess: false,
                code: 310,
                message: "일정제목길이는 최대 50자입니다."
            });
        }
        
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
//카테고리별일정조회
exports.getschedulebycategory = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const schedulecategoryID = req.query.scheduleCategoryID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getschedulebycategoryrows = await scheduleDao.getschedulebycategoryInfo(userID,schedulecategoryID);

        if (getschedulebycategoryrows) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 일정 조회 성공",
                data : getschedulebycategoryrows[0]
                

            });

        }else{
            return res.json({
                isSuccess: false,
                code: 311,
                message: "카테고리별 일정 조회 실패"
            });
        }
    } catch (err) {

        logger.error(`카테고리별 일정 조회\n ${err.message}`);
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
//일정 즐겨찾기/즐겨찾기 취소
exports.patchschedulepick = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const scheduleID = req.body.scheduleID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const patchschedulepickrows = await scheduleDao.patchschedulepickInfo(scheduleID,userID);
        console.log(patchschedulepickrows);
        if (patchschedulepickrows) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 "+ scheduleID +"번 일정 즐겨찾기수정"
                
                

            });

        }else{
            return res.json({
                isSuccess: false,
                code: 318,
                message: "일정 즐겨찾기수정 실패"
            });
        }
    } catch (err) {

        logger.error(`일정 즐겨찾기수정 조회\n ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};
//일정 완료 버튼
exports.updateachievementschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const scheduleID = req.body.scheduleID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const updateachievementschedulerows = await scheduleDao.updateachievementscheduleInfo(scheduleID,userID);
        
        if (updateachievementschedulerows) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 "+ scheduleID +"번 일정 완료/미완료"
                
                

            });

        }else{
            return res.json({
                isSuccess: false,
                code: 319,
                message: "일정 완료수정 실패"
            });
        }
    } catch (err) {

        logger.error(`일정 완료수정 조회\n ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};
//유저별 총 해낸 일정수 조회
exports.getdoneschedulecount = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getdoneschedulecountrows = await scheduleDao.getdoneschedulecountInfo(userID);

        if (getdoneschedulecountrows) {

            return res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 해낸 일정 개수 조회 성공",
                data : getdoneschedulecountrows[0]
                

            });

        }else{
            return res.json({
                isSuccess: false,
                code: 307,
                message: "해낸 일정 개수 조회 실패"
            });
        }
    } catch (err) {

        logger.error(`해낸 일정 개수 조회\n ${err.message}`);
        return res.status(401).send(`Error: ${err.message}`);
    }
};