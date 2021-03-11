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

                res.json({
                    userID: userIDInToken,
                    profileImageURL: s3ProfileImage,
                    isSuccess: true,
                    code: 100,
                    message: "프로필 사진 업로드 성공"
                });
    
            } 
            else{
                await profileDao.updateProfileImage(s3ProfileImage, userIDInToken);

                res.json({
                    userID: userIDInToken,
                    profileImageURL: s3ProfileImage,
                    isSuccess: true,
                    code: 100,
                    message: "프로필 사진 업데이트 성공"
                });    
            }

            connection.release();

        } catch (err){
            connection.release();
            logger.error(`Upload Profile Image Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Upload Profile Image DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getTitleComment = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const [profileInfoRow] = await profileDao.getProfileInfo(userIDInToken);

            if(profileInfoRow[0].goalStatus === -1){
                const [getTitleCommentRow] = await profileDao.getTitleComment(userIDInToken);
                
                res.json({
                    nickname: getTitleCommentRow[0].nickname,
                    titleComment: getTitleCommentRow[0].titleComment,
                    goalStatus: getTitleCommentRow[0].goalStatus,
                    isSuccess: true,
                    code: 100,
                    message: "상단 멘트 조회 성공"
                })
            }else{
                const [getTitleGoalRow] = await profileDao.getTitleGoal(userIDInToken);

                res.json({
                    goalTitle: getTitleGoalRow[0].goalTitle,
                    Dday: getTitleGoalRow[0].Dday,
                    goalDate: getTitleGoalRow[0].goalDate,
                    goalStatus: getTitleGoalRow[0].goalStatus,
                    isSuccess: true,
                    code: 100,
                    message: "상단 목표 조회 성공"
                })
            };
            connection.release();

        }catch (err) {
            connection.release();
            logger.error(`Get Titile Comment Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Get Title Comment DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}