const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const scheduleDao = require('../dao/scheduleDao');
//오늘일정생성

/* exports.inserttodayschedule = async function (req, res) {
   const {


        scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo
     } = req.body;

     if (!scheduleName) {
        res.json({
            isSuccess: false,
            code: 206,
            message: "일정제목을 입력해주세요."
        });
     }

    if (scheduleName.length >=50) {
     res.json({
            isSuccess: false,
            code: 310,
            message: "일정제목길이는 최대 50자입니다."
        });
    } 
    if(scheduleMemo){
        if (scheduleMemo.length >= 100){
         res.json({
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

     res.json({
            isSuccess: true,
            code: 100,
            message: "오늘 일정 생성 성공"

        });
        connection.release();
     } catch (err) {
        // await connection.rollback(); // ROLLBACK
        connection.release();
        logger.error(`오늘일정생성 에러\n: ${err.message}`);
         res.status(401).send(`Error: ${err.message}`);

        }
}; */
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
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        try{
            if (!scheduleDate) {
                const userID = req.verifiedToken.userID;
                const inserttodayscheduleParams = [userID, scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo];
                const inserttodayscheduleInfoRows = await scheduleDao.inserttodayscheduleInfo(inserttodayscheduleParams);

            res.json({
                    isSuccess: true,
                    code: 100,
                    message: "오늘 일정 생성 성공"
        
            });
            connection.release();
    
            }else{
                // 오늘일정생성
             const userID = req.verifiedToken.userID;
             const insertscheduleParams = [userID, scheduleName,scheduleDate,scheduleTime,scheduleCategoryID,scheduleMemo];
             const insertscheduleInfoRows = await scheduleDao.insertscheduleInfo(insertscheduleParams);
    
             res.json({
                isSuccess: true,
                code: 100,
                message: "일정 생성 성공"
    
             });
             connection.release();
            }
        }catch (err) {
            connection.release();
            logger.error(`일정생성 에러\n: ${err.message}`);
            res.status(401).send(`Error: ${err.message}`);
        }
     }catch (err) {
            logger.error(`일정생성 에러\n: ${err.message}`);
            res.status(401).send(`Error: ${err.message}`);
     }
};
//일정수정
exports.updateschedule = async function (req, res) {
    const scheduleID = req.params.scheduleID;
    var scheduleName = req.body.scheduleName;
    var scheduleDate = req.body.scheduleDate;
    var scheduleCategoryID = req.body.scheduleCategoryID;
    var scheduleMemo = req.body.scheduleMemo;
    
    const getdaterows = await scheduleDao.getdate(scheduleID);
            if(scheduleDate==null){
                scheduleDate = getdaterows[0][0].scheduleDate
                
            }
            
    if (!scheduleID) {
        return res.json({ 
            isSuccess: false, 
            code: 208, 
            message: "일정 고유번호를 입력해주세요" 
        });
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
        try {
            var updatescheduleParams = [
                scheduleName,
                scheduleDate,
                scheduleCategoryID,
                scheduleMemo,
                scheduleID
            ];
            
            const updateschedule = await scheduleDao.updatescheduleInfo(updatescheduleParams,scheduleID);
            if(req.body.scheduleMemo){
                if (req.body.scheduleMemo.length >= 100){
                    connection.release();

                    return res.json({
                        isSuccess: false,
                        code: 309,
                        message: "메모최대길이는 100자입니다"
                    });
                }
            }
            
            if (req.body.scheduleName.length >= 50) {
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "일정제목길이는 최대 50자입니다."
                });
            }
            
            if (updateschedule[0].affectedRows == 1) {
                res.json({
                    isSuccess: true,
                    code: 100,
                    message: "일정 수정 성공",
                });
            }else{
             res.json({
                    isSuccess: false,
                    code: 306,
                    message: "일정 수정 실패"
                });
            }
            connection.release();
        }catch (err) {
            connection.release();   
            logger.error(`일정수정에러\n ${err.message}`);
            res.status(401).send(`Error: ${err.message}`);
        }
    }catch (err) {   
        logger.error(`일정수정에러\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//유저별일정전체 조회
exports.getschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getschedulerows = await scheduleDao.getscheduleInfo(userID);

        if (getschedulerows) {
            res.json({
                   isSuccess: true,
                   code: 100,
                   message: userID + "번 유저 전체 일정 조회 성공",
                   data : getschedulerows[0]
               });
        }else{
            res.json({
                   isSuccess: false,
                   code: 307,
                   message: "전체 일정 조회 실패"
            });
        }
        connection.release();
    }catch (err) {
                connection.release();
                logger.error(`전체일정 조회\n ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
    }
};
//유저별오늘일정조회
exports.getscheduletoday = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getscheduletodayrows = await scheduleDao.getscheduletodayInfo(userID);

        if (getscheduletodayrows) {
            res.json({
                   isSuccess: true,
                   code: 100,
                   message: userID + "번 유저 오늘 일정 조회 성공",
                   data : getscheduletodayrows[0]
               });
        }else{
            res.json({
                   isSuccess: false,
                   code: 328,
                   message: "오늘일정 조회 실패"
            });
        }
        connection.release();
    }catch (err) {
                connection.release();
                logger.error(`오늘일정 조회\n ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
    }
};
//카테고리별일정조회
/* exports.getschedulebycategory = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const schedulecategoryID = req.query.scheduleCategoryID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getschedulebycategoryrows = await scheduleDao.getschedulebycategoryInfo(userID,schedulecategoryID);

        if (getschedulebycategoryrows) {

         res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 일정 조회 성공",
                data : getschedulebycategoryrows[0]
                

            });

        }else{
         res.json({
                isSuccess: false,
                code: 311,
                message: "카테고리별 일정 조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`카테고리별 일정 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
}; */
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
    if (scheduleID <= 0) {
        return res.json({
            isSuccess: false,
            code: 209,
            message: "정확한 일정 고유번호를 입력해주세요"
        });
    }
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const deleteschedulerows = await scheduleDao.deletescheduleInfo(scheduleID);

         if (deleteschedulerows[0].affectedRows == 1) {
            res.json({
                isSuccess: true,
                code: 100,
                message: "일정 삭제 성공",
             });
        }else{
            res.json({
                isSuccess: false,
                code: 308,
                message: "일정 삭제 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`일정 삭제 error: ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//일정 즐겨찾기/즐겨찾기 취소
exports.patchschedulepick = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const scheduleID = req.body.scheduleID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const patchschedulepickrows = await scheduleDao.patchschedulepickInfo(scheduleID,userID);
        
        if (patchschedulepickrows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 "+ scheduleID +"번 일정 즐겨찾기수정"
            });

        }else{
            res.json({
                isSuccess: false,
                code: 318,
                message: "일정 즐겨찾기수정 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`일정 즐겨찾기수정 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
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
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 "+ scheduleID +"번 일정 완료/미완료"
            });
        }else{
            res.json({
                isSuccess: false,
                code: 319,
                message: "일정 완료수정 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`일정 완료수정 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//유저별 총 해낸 일정수 조회
exports.getdoneschedulecount = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getdoneschedulecountrows = await scheduleDao.getdoneschedulecountInfo(userID);

        if (getdoneschedulecountrows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 해낸 일정 개수 조회 성공",
                data : getdoneschedulecountrows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 307,
                message: "해낸 일정 개수 조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`해낸 일정 개수 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//남은일정수조회
exports.getremainschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const filter = req.query.filter;
    try {

        const connection = await pool.getConnection(async (conn) => conn);
        if(filter == 'total'){
        const getremainschedulerows = await scheduleDao.getremaintotalscheduleInfo(userID);

        if (getremainschedulerows) {

         res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 전체 남은 일정 개수 조회 성공",
                data :getremainschedulerows[0]
            });

        }else{
         res.json({
                isSuccess: false,
                code: 325,
                message: "전체 남은 일정 개수 조회 실패"
            });
        }
    }else if(filter == 'today'){
        const getremainstodaychedulerows = await scheduleDao.getremaintodayscheduleInfo(userID);

        if (getremainstodaychedulerows) {

         res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 오늘 남은 일정 개수 조회 성공",
                data :getremainstodaychedulerows[0]
            });

        }else{
         res.json({
                isSuccess: false,
                code: 326,
                message: "오늘 남은 일정 개수 조회 실패"
            });
        }
    }
        connection.release();
    } catch (err) {
        //connection.release();
        logger.error(` 남은 일정 개수 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//날짜별일정조회
exports.getschedulebydate = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const scheduleDate = req.query.scheduleDate;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getschedulebydaterows = await scheduleDao.getschedulebydateInfo(userID,scheduleDate);

            if (getschedulebydaterows) {
                res.json({
                       isSuccess: true,
                       code: 100,
                       message: userID + "번 유저 일정 "+scheduleDate+"일정 조회 성공",
                       data : getschedulebydaterows[0]
                   });
               }else{
                res.json({
                       isSuccess: false,
                       code: 321,
                       message: "날짜별일정 조회 실패"
                   });
               }
               connection.release();
            }catch (err) {
               // connection.release();
                logger.error(`일정 조회\n ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
            }
        

};
//월별일정조회
exports.getschedulemonth = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const month = req.query.month;
    const year = req.query.year;
   
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getschedulemonthrows = await scheduleDao.getschedulemonthInfo(userID,month,year);
            
            if (getschedulemonthrows) {
                res.json({
                       isSuccess: true,
                       code: 100,
                       message: userID+"번 유저"+year+"년"+month+"월 일정조회 성공",
                       data : getschedulemonthrows[0]
                   });
               }else{
                res.json({
                       isSuccess: false,
                       code: 337,
                       message: "월별일정조회 실패"
                   });
               }
               connection.release();
            }catch (err) {
               // connection.release();
                logger.error(`월별일정조회 조회\n ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
            }
        

}; 
//일정상세조회
exports.getscheduledetails = async function (req, res) {
    const scheduleID = req.params.scheduleID;
   
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getscheduledetailsrows = await scheduleDao.getscheduledetailsInfo(scheduleID);
            
            if (getscheduledetailsrows) {
                res.json({
                       isSuccess: true,
                       code: 100,
                       message: scheduleID+"번 일정상세조회 성공",
                       data : getscheduledetailsrows[0]
                   });
               }else{
                res.json({
                       isSuccess: false,
                       code: 327,
                       message: "일정상세조회 실패"
                   });
               }
               connection.release();
            }catch (err) {
               // connection.release();
                logger.error(`일정상세 조회\n ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);
            }
        

}; 
//월별해낸일정수조회
exports.getdonemonthcount = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getdonemonthcountrows = await scheduleDao.getdonemonthcountInfo(userID);

        if (getdonemonthcountrows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 월별 해낸 일정 개수 조회 성공",
                data :getdonemonthcountrows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 307,
                message: "월별 해낸 일정 개수 조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`월별 해낸 일정 개수 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//즐겨찾기한 일정조회
exports.getpickschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getpickschedulerows = await scheduleDao.getpickscheduleInfo(userID);

        if (getpickschedulerows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 즐겨찾기한일정 조회 성공",
                data :getpickschedulerows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 331,
                message: "즐겨찾기한일정 조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`즐겨찾기한일정 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//최근 생성 일정조회
exports.getrecentschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getrecentschedulerows = await scheduleDao.getrecentscheduleInfo(userID);

        if (getrecentschedulerows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 최근생성일정 조회 성공",
                data :getrecentschedulerows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 332,
                message: " 최근생성일정 조회  실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(` 최근생성일정 조회 \n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//카테고리별 일정 정렬 조회
exports.getschedulebycategorysort = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const schedulecategoryID = req.query.scheduleCategoryID;
    const sort = req.query.sort;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        if(sort == null){
            const getschedulebycategoryrows = await scheduleDao.getschedulebycategoryInfo(userID,schedulecategoryID);

        if (getschedulebycategoryrows) {

         res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 일정 조회 성공",
                data : getschedulebycategoryrows[0]
                

            });

        }else{
         res.json({
                isSuccess: false,
                code: 311,
                message: "카테고리별 일정 조회 실패"
            });
        }
        }
        else if(sort =='recent'/* 최신순 */){
            const getscategoryrecentrows = await scheduleDao.getscategoryrecentInfo(userID,schedulecategoryID,sort);

            if (getscategoryrecentrows) {

            res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 최근정렬 일정 조회 성공",
                    data : getscategoryrecentrows[0]
                    

                });

            }else{ 
            res.json({
                    isSuccess: false,
                    code: 333,
                    message: "카테고리별 최신 순 정렬 일정 조회 실패"
                });
            }
        }else if(sort == 'left'/* 남은순 */){
            const getscategoryleftrows = await scheduleDao.getscategoryleftInfo(userID,schedulecategoryID,sort);

            if (getscategoryleftrows) {

            res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 남은정렬 일정 조회 성공",
                    data : getscategoryleftrows[0]
                    

                });

            }else{
            res.json({
                    isSuccess: false,
                    code: 334,
                    message: "카테고리별 남은 순 정렬 일정 조회 실패"
                });
            }
        }else if(sort == 'done'/* 완료순 */){
            const getscategorydonerows = await scheduleDao.getscategorydoneInfo(userID,schedulecategoryID,sort);

            if (getscategorydonerows) {

            res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 완료정렬 일정 조회 성공",
                    data : getscategorydonerows[0]
                    

                });

            }else{
            res.json({
                    isSuccess: false,
                    code: 335,
                    message: "카테고리별 완료 순 정렬 일정 조회 실패"
                });
            }
        }else if(sort == 'pick'/* 즐겨찾기순 */){
            const getscategorypickrows = await scheduleDao.getscategorypickInfo(userID,schedulecategoryID,sort);

            if (getscategorypickrows) {

            res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번 유저"+ schedulecategoryID+"번 카테고리 즐겨찾기정렬 일정 조회 성공",
                    data : getscategorypickrows[0]
                    

                });

            }else{
            res.json({
                    isSuccess: false,
                    code: 336,
                    message: "카테고리별 즐겨찾기 순 정렬 일정 조회 실패"
                });
            }
        }
        connection.release();
    } catch (err) {
       // connection.release();
        logger.error(`카테고리별 정렬 일정 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};