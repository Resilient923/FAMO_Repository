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
//일정생성
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
                const getOrderRows = await scheduleDao.getOrderInfo(userID);
                if(!getOrderRows){
                    var scheduleOrder = -1;
                }else if(getOrderRows){
                    var scheduleOrder = getOrderRows[0][0].maxScheduleOrder;
                }
                const inserttodayscheduleParams = [userID, scheduleName,scheduleTime,scheduleCategoryID,scheduleMemo,scheduleOrder];
                const inserttodayscheduleInfoRows = await scheduleDao.inserttodayscheduleInfo(inserttodayscheduleParams);
                
                //유저가 가지고있는 Orer중 가장 큰값
            res.json({
                    isSuccess: true,
                    code: 100,
                    message: "오늘 일정 생성 성공"
        
            });
            connection.release();
    
            }else{
                // 오늘일정생성
             const userID = req.verifiedToken.userID;
             const getOrderRows = await scheduleDao.getOrderInfo(userID);
             if(!getOrderRows){
                var scheduleOrder = -1;
            }else if(getOrderRows){
                var scheduleOrder = getOrderRows[0][0].maxScheduleOrder;
            } 
             const insertscheduleParams = [userID, scheduleName,scheduleDate,scheduleTime,scheduleCategoryID,scheduleMemo,scheduleOrder];
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
            res.status(444).send(`Error: ${err.message}`);
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
    const offset = req.query.offset;
    const limit = req.query.limit;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getschedulerows = await scheduleDao.getscheduleInfo(userID,offset,limit);

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
               // connection.release();
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
                message: userID + "번 유저"+ scheduleID +"번 일정 완료/미완료"
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
        const getscheduledayrows = await scheduleDao.getscheduledayInfo(userID,month,year);
            if (getschedulemonthrows) {
                res.json({
                       isSuccess: true,
                       code: 100,
                       message: userID+"번 유저"+year+"년"+month+"월 일정조회 성공",
                       data : getschedulemonthrows[0],
                       result : getscheduledayrows[0]
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
/* exports.getdonemonthcount = async function (req, res) {
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
       // connection.release();
        logger.error(`월별 해낸 일정 개수 조회\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
}; */
//즐겨찾기한 일정조회
exports.getpickschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const offset = req.query.offset;
    const limit = req.query.limit;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getpickschedulerows = await scheduleDao.getpickscheduleInfo(userID,offset,limit);

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
    const offset = req.query.offset;
    const limit = req.query.limit;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const getrecentschedulerows = await scheduleDao.getrecentscheduleInfo(userID,offset,limit);

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
    const offset = req.query.offset;
    const limit = req.query.limit;
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        if(sort == null){
            const getschedulebycategoryrows = await scheduleDao.getschedulebycategoryInfo(userID,schedulecategoryID,offset,limit);

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
            const getscategoryrecentrows = await scheduleDao.getscategoryrecentInfo(userID,schedulecategoryID,sort,offset,limit);

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
            const getscategoryleftrows = await scheduleDao.getscategoryleftInfo(userID,schedulecategoryID,sort,offset,limit);

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
            const getscategorydonerows = await scheduleDao.getscategorydoneInfo(userID,schedulecategoryID,sort,offset,limit);

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
            const getscategorypickrows = await scheduleDao.getscategorypickInfo(userID,schedulecategoryID,sort,offset,limit);
        
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
//월별 달성률조회
exports.getdoneschedulemonth = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        var getdoneschedulemonthrows = await scheduleDao.getdoneschedulemonthInfo(userID);//해낸일정 수
        var getdonescheduletotalrows = await scheduleDao.getdonescheduletotalInfo(userID);//전체 수
       
        var doneRate = {};
        

        for(let i = 0; i< Object.keys(getdonescheduletotalrows[0]).length;i++){
            var doneData = 0;

           for(let j = 0;j < Object.keys(getdoneschedulemonthrows[0]).length;j++){
               // console.log(getdoneschedulemonthrows[0][i].yearmonth);
                //console.log(getdonescheduletotalrows[0][i].scheduleCount);
                if(getdonescheduletotalrows[0][i].yearmonth == getdoneschedulemonthrows[0][j].yearmonth){
                    var doneData = Math.round(getdoneschedulemonthrows[0][j].scheduleCount/getdonescheduletotalrows[0][i].scheduleCount*100);
                    //console.log(getdonescheduletotalrows[0][i].yearmonth);
                    doneRate[getdonescheduletotalrows[0][i].yearmonth] = doneData;
                    
                }
            }
            if(doneData == 0){
                doneRate[getdonescheduletotalrows[0][i].yearmonth] = doneData;
            }

        };

        
        if (getdoneschedulemonthrows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 월별 달성률조회 성공",
                data :doneRate
            });

        }else{
            res.json({
                isSuccess: false,
                code: 338,
                message: "월별 달성률조회 실패"
            });
        }
        connection.release();
    } catch (err) {
       // connection.release();
        logger.error(`월별 달성률조회 \n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//전체 일정수조회
exports.gettotalschedule = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const gettotalschedulerows = await scheduleDao.gettotalscheduleInfo(userID);
        const getdoneschedulecountrows = await scheduleDao.getdoneschedulecountInfo(userID);

        if (gettotalschedulerows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번 유저 전체 일정수,총 해낸 일정수조회 성공",
                totaldata : gettotalschedulerows[0],
                totaldonedata : getdoneschedulecountrows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 339,
                message: "전체 일정수, 총 해낸 일정수 조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`전체 일정수조회 \n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//일정검색
exports.searchSchedule = async function (req, res) {
    //const { page,limit } = req.query;
    const { searchWord } = req.body;
    //유저 인덱스
    const userID = req.verifiedToken.userID;
    let searchscheduleID = [];
  
    if(!searchWord)
    return res.json({
      isSuccess: false,
      code: 223,
      message: "검색어를 입력해 주세요.",
    });
    const insertSearchHistoryRows = await scheduleDao.insertSearchHistoryInfo(userID,searchWord);
     //검색어로 일정제목에서 인덱스받아오기
    const getIdFromScheduleNameRows = await scheduleDao.getIdFromScheduleNameInfo(searchWord,userID);
    
    for(let i=0; i<getIdFromScheduleNameRows.length; i++){
        searchscheduleID.push(getIdFromScheduleNameRows[i].scheduleID)
    }
    
  
    //검색어로 일정내용에서 인덱스받아오기
    const getIdFromScheduleMemoRows = await scheduleDao.getIdFromScheduleMemoInfo(searchWord,userID);
    
    for(let i=0; i<getIdFromScheduleMemoRows.length; i++){
    searchscheduleID.push(getIdFromScheduleMemoRows[i].scheduleID)
    }
    try{
        
        const connection = await pool.getConnection(async (conn) => conn);
        let x = new Set(searchscheduleID);
        let scheduleData = [...x];
        data = [];
        for(let i=0;i<scheduleData.length;i++){
            const getscheduleFromMemoRows = await scheduleDao.getscheduleFromMemoInfo(searchscheduleID[i]);
            data.push(getscheduleFromMemoRows);
        }
        if (data) {
            res.json({
                isSuccess: true,
                code: 100,
                message: searchWord + " 검색어 관련 일정 조회성공",
                data : data
            }); 
        }else{
            res.json({
                isSuccess: false,
                code: 341,
                message: "검색어 일정 조회 실패"
            });
        }
        connection.release();
    }catch(err){
        connection.release();
        logger.error(`검색어 관련 일정 조회 \n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
}
//유저별검색기록조회
exports.gethistory = async function (req, res) {
    const userID = req.verifiedToken.userID;
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        const gethistoryrows = await scheduleDao.gethistoryInfo(userID);

        if (gethistoryrows) {
            res.json({
                isSuccess: true,
                code: 100,
                message: userID + "번유저 검색기록조회 성공",
                data :gethistoryrows[0]
            });

        }else{
            res.json({
                isSuccess: false,
                code: 342,
                message: "유저별 검색기록조회 실패"
            });
        }
        connection.release();
    } catch (err) {
        connection.release();
        logger.error(`검색기록조회 \n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};
//일정순서변경
exports.updateOrder = async function (req, res) {
    const userID = req.verifiedToken.userID;
    const {scheduleID,scheduleOrder} = req.body;
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);

      //  const updateOrderrows = await scheduleDao.updateOrderInfo(userID,scheduleID,scheduleOrder);
       // var getOrderrows = await scheduleDao.getOrder2Info(userID);
        
        let a = await scheduleDao.getscheduleIDInfo(scheduleID);
        let x = a[0][0].scheduleOrder;
        
        const y = req.body.scheduleOrder;
        if (x>y){
            
            const change1 = await scheduleDao.updateOrder0Info(userID,scheduleID,y);
            
            const change2 = await scheduleDao.updateOrder1Info(userID,scheduleID,x,y);
            
            if (change2) {
                res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번유저가"+scheduleID+"번일정위치를"+y+"번으로이동",
                    
                });
    
            }else{
               return res.json({
                    isSuccess: false,
                    code: 343,
                    message: "(x>y)일정순서변경 실패"
                });
            }
            
        }else if(x<y){
            const change1 = await scheduleDao.updateOrder0Info(userID,scheduleID,y);
            const updateOrderParams = [userID,scheduleID,x,y];
            const change4 = await scheduleDao.updateOrder2Info(updateOrderParams);
            if (change4) {
                res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID +"번유저가"+scheduleID+"번일정위치를"+y+"번으로이동",
                    
                });
    
            }else{
                return res.json({
                    isSuccess: false,
                    code: 344,
                    message: "(x<y)일정순서변경 실패"
                });
            }
        }else if(x==y){
            return res.json({
                isSuccess: true,
                code: 345,
                message: "같은번호로는 이동할수없습니다"
            });
        }
        connection.release();
    } catch (err) {
       // connection.release();
        logger.error(`일정순서변경\n ${err.message}`);
        res.status(401).send(`Error: ${err.message}`);
    }
};