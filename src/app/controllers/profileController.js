const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const profileDao = require('../dao/profileDao');

const { constants } = require('buffer');

/* 프로필 사진 업로드 API */
exports.uploadProfileImage = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const s3ProfileImage = `https://soibucket.s3.ap-northeast-2.amazonaws.com/FamoProfile/${userIDInToken}`;
            
            const checkUserProfileRow = await profileDao.checkUserProfile(userIDInToken);
    
            if(checkUserProfileRow[0].exist == 0){
                
                const insertProfileImageParams = [userIDInToken, s3ProfileImage];
                await profileDao.insertProfileImage(insertProfileImageParams);

                connection.release();

                return res.json({
                    userID: userIDInToken,
                    profileImageURL: s3ProfileImage,
                    isSuccess: true,
                    code: 100,
                    message: "프로필 사진 업로드 성공"
                });
            } 
            else{
                await profileDao.updateProfileImage(s3ProfileImage, userIDInToken);

                connection.release();

                return res.json({
                    userID: userIDInToken,
                    profileImageURL: s3ProfileImage,
                    isSuccess: true,
                    code: 100,
                    message: "프로필 사진 업데이트 성공"
                });    
            }
        } catch (err){
            connection.release();
            logger.error(`Upload Profile Image Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Upload Profile Image Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 프로필 사진 삭제 API */
exports.deleteProfileImage = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;
    try {
       const connection = await pool.getConnection(async conn => conn);

        try {
            await connection.beginTransaction();

            await profileDao.updateProfileImage(null, userIDInToken);

            const [getProfileInfo] = await profileDao.getProfileInfo(userIDInToken);

            await connection.commit();
           
            res.json({
                userID: userIDInToken,
                profileImageURL: getProfileInfo[0].profileImageURL,
                isSuccess: true,
                code: 100,
                message: "프로필 사진 삭제 성공"
            })
           
            connection.release();

        }catch (err) {
            await connection.rollback();
            connection.release();
            logger.error(`Delete profile image Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Delete profile image DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 상단 멘트 조회 API */
exports.getTitleComment = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const [profileInfoRow] = await profileDao.getProfileInfo(userIDInToken);
    
            if(profileInfoRow[0].goalStatus === -1){
                const [getTitleCommentRow] = await profileDao.getTitleComment(userIDInToken);

                connection.release();
    
                return res.json({
                    nickname: getTitleCommentRow[0].nickname,
                    titleComment: getTitleCommentRow[0].titleComment,
                    goalStatus: getTitleCommentRow[0].goalStatus,
                    isSuccess: true,
                    code: 100,
                    message: "상단 멘트 조회 성공"
                });
    
            }else{
                const [getTitleGoalRow] = await profileDao.getTitleGoal(userIDInToken);

                connection.release();
    
                return res.json({
                    goalTitle: getTitleGoalRow[0].goalTitle,
                    Dday: getTitleGoalRow[0].Dday,
                    goalDate: getTitleGoalRow[0].goalDate,
                    goalStatus: getTitleGoalRow[0].goalStatus,
                    isSuccess: true,
                    code: 100,
                    message: "상단 목표 조회 성공"
                });
            };
            
        }catch (err) {
            connection.release();
            logger.error(`Get Titile Comment Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Get Titile Comment DB error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 내정보 조회 API */
exports.getProfile = async function (req, res){
    const userIDInToken = req.verifiedToken.userID;

    try{
        const [getUserProfileRow] = await profileDao.getUserProfile(userIDInToken);

        res.json({
            loginID: getUserProfileRow[0].loginID,
            loginMethod: getUserProfileRow[0].method,
            nickname: getUserProfileRow[0].nickname,
            profileImageURL: getUserProfileRow[0].profileImageURL,
            titleComment: getUserProfileRow[0].titleComment,
            goalStatus: getUserProfileRow[0].goalStatus,
            goalTitle: getUserProfileRow[0].goalTitle,
            Dday: getUserProfileRow[0].Dday,
            goalDate: getUserProfileRow[0].goalDate,
            isSuccess: true,
            code: 100,
            message: "내정보 조회 성공"
        })
        
    }catch (err) {
        logger.error(`Get Profile Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 내정보 수정 API */
exports.updateProfile = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;

    const {
        nickname, titleComment, goalStatus, goalTitle, goalDate
    } = req.body;

    if(!nickname){
        return res.json({
            isSuccess: false, 
            code: 203, 
            message: "닉네임을 입력해주세요."
        });
    }
    if(nickname.length > 6){
        return res.json({
            isSuccess: false, 
            code: 302, 
            message: "닉네임은 최대 6자입니다."
        });
    }
    if(!titleComment){
        return res.json({
            isSuccess: false, 
            code: 218, 
            message: "상단멘트를 입력해주세요."
        });
    }
    if(titleComment > 10){
        return res.json({
            isSuccess: false, 
            code: 323, 
            message: "상단멘트는 최대 10자입니다."
        });
    }
    if(goalStatus != 1 && goalStatus != -1){
        return res.json({
            isSuccess: false, 
            code: 201, 
            message: "goalStatus는 -1 또는 1만 입력해주세요."
        });
    }
    if(goalTitle){
        if(goalTitle.length > 7){
            return res.json({
                isSuccess: false, 
                code: 324, 
                message: "디데이 제목은 최대 7자입니다."
            });
        }
    }
    if(goalDate){
        var date = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
        if(!date.test(goalDate)){
            return res.json({
                isSuccess: false, 
                code: 220, 
                message: "날짜 형식은 YYYY-MM-DD 입니다."
            });
        }
    }

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const updateProfileParams = [titleComment, goalStatus, goalTitle, goalDate];

            await connection.beginTransaction();
            await profileDao.updateNickname(userIDInToken, nickname);
            await profileDao.updateUserProfile(userIDInToken, updateProfileParams);

            await connection.commit();

            res.json({
                isSuccess: true,
                code: 100,
                message: "내 정보 수정 성공"
            })
            
            connection.release();

        }catch (err) {
            await connection.rollback();
            connection.release();
            logger.error(`Update Profile Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Update Profile DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};