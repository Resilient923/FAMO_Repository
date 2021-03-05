const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');

process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

/* 회원가입 API */
exports.signUp = async function (req, res) {
    const {
        loginID, password, nickname, phoneNumber
    } = req.body;

    if (!loginID) return res.json({
        isSuccess: false, 
        code: 201, 
        message: "아이디를 입력해주세요."
    });

    if (!password) return res.json({
        isSuccess: false, 
        code: 202, 
        message: "비밀번호를 입력해주세요."
    });

    if (!nickname) return res.json({
        isSuccess: false, 
        code: 203, 
        message: "닉네임을 입력해주세요."
    });

    if (!phoneNumber) return res.json({
        isSuccess: false,
        code: 204,
        message: "핸드폰 번호를 입력해주세요."
    })

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const loginIDRows = await userDao.checkUserLoginID(loginID);
            if (loginIDRows[0].exist == 1) {

                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "중복된 아이디입니다."
                });
            }

            const phoneNumberRows = await userDao.checkPhoneNumber(phoneNumber);
            if (phoneNumberRows[0].exist == 1) {

                return res.json({
                    isSuccess: false,
                    code: 302,
                    message: "중복된 휴대폰 번호입니다."
                });
            }

            // TRANSACTION : advanced
           // await connection.beginTransaction(); // START TRANSACTION
            const passwordSalt = crypto.randomBytes(64).toString('base64');
            const passwordHash = crypto.pbkdf2Sync(password, passwordSalt, 101024, 64, 'sha512').toString('base64');

            const insertUserInfoParams = [loginID, passwordHash, passwordSalt, nickname, phoneNumber, 'F'];
            const insertUserRowsId = await userDao.insertUserInfo(insertUserInfoParams);
            const [userInfoRows] = await userDao.selectUserInfo(loginID);
            
            let token = jwt.sign({
                userID: insertUserRowsId,
                method: 'F'
              }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
              {
                expiresIn: '365d',
                subject: 'userInfo'
              } // 유효 시간은 365일
            );
           //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
                userID: userInfoRows[0].userID,
                nickname: userInfoRows[0].nickname,
                jwt: token,
                isSuccess: true,
                code: 100,
                message: "회원가입 성공"
            });
        } catch (err) {
           // await connection.rollback(); // ROLLBACK           
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            connection.release();
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/* 로그인 API */
exports.signIn = async function (req, res) {
    const {
        loginID, password
    } = req.body;

    if (!loginID) return res.json({
        isSuccess: false, 
        code: 201, 
        message: "아이디를 입력해주세요."
    });

    if (!password) return res.json({
        isSuccess: false, 
        code: 202, 
        message: "비밀번호를 입력해주세요."
    });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [userInfoRows] = await userDao.selectUserInfo(loginID);

            if (userInfoRows.length == 0) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "아이디를 확인해주세요."
                });
            }

            const passwordHash = crypto.pbkdf2Sync(password, userInfoRows[0].passwordSalt, 101024, 64, 'sha512').toString('base64');
            
            if (userInfoRows[0].password !== passwordHash) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 304,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].status === 0) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 305,
                    message: "비활성화된 계정입니다. 고객센터에 문의해주세요."
                });
            };

            //토큰 생성
            let token = jwt.sign({
                    id: userInfoRows[0].userID,
                    method: userInfoRows[0].method
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 14일
            );

            res.json({
                userID: userInfoRows[0].userID,
                nickname: userInfoRows[0].nickname,
                jwt: token,
                isSuccess: true,
                code: 100,
                message: "로그인 성공"
            });

            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
     } catch (err) {
        logger.error(`non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
     }
};

exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};

// exports.addProfileImage = async function (req, res) {
//     const s3 = new AWS.S3({apiVersion: '2006-03-01'});
//     const uploadParams = {Bucket: 'soibucket/' , Key: '', Body: ''};

//     const {
//         profileImage
//     } = req.body;

//     const fileStream = fs.createReadStream(profileImage);
//     fileStream.on('error', function(err){
//         console.log('File Error', err);
//     })

//     uploadParams.Body = fileStream;
//     uploadParams.Key = path.basename(profileImage);

//     s3.upload (uploadParams, function (err, data) {
//       if (err) {
//           console.log("Upload Error", err);
//       }  if (data) {
//           console.log("Upload Success", data.Location);
//       }
//     });
//
//}
