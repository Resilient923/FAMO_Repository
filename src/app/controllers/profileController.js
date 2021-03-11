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
            
            const checkProfileImageRow = await profileDao.checkProfileImage(userIDInToken);

            if(checkProfileImageRow[0].exist == 0){
                
                const insertProfileImageParams = [userIDInToken, s3ProfileImage];
                profileDao.insertProfileImage(insertProfileImageParams);

                res.json({
                    userID: userIDInToken,
                    profileImageURL: s3ProfileImage,
                    isSuccess: true,
                    code: 100,
                    message: "프로필 사진 업로드 성공"
                });
    
            } 
            else{
                profileDao.updateProfileImage(s3ProfileImage, userIDInToken);

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