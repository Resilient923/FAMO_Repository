const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const request = require('request');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');

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
                    userID: userInfoRows[0].userID,
                    method: userInfoRows[0].method
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
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

/* 카카오 로그인 동의 화면 출력 API */
exports.kakao = async function (req, res) {
    const clientID = secret_config.kakaoClientID;
    const url = 'http://localhost:3000/kakao/oauth'
    res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${url}&response_type=code`);
};

/* 카카오 access token 발급 API */

var accessToken;
var nickname;
var profileImage;
var email;

exports.kakaoOauth = async function (req, res){
    const code = req.query.code;
    const clientID = secret_config.kakaoClientID;
    const url = 'http://localhost:3000/kakao/oauth';
    var dataString = `grant_type=authorization_code&client_id=${clientID}&redirect_uri=${url}&code=${code}`;
    
    var options = {
        url: 'https://kauth.kakao.com/oauth/token',
        method: 'POST',
        headers: {
            'Host': 'kauth.kakao.com',
            'Content-type': 'application/x-www-form-urlencoded; charset=utf-8;'
        },
        body: dataString,
    };

    async function callback(err, res, body) {
        if(!err){
            const json = JSON.parse(body);
            accessToken = json.access_token;
        }else{
            logger.error(`App - Kakao Callback error\n: ${JSON.stringify(err)}`);
        }
    };
    
    request(options, callback);

    var headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    var dataString = 'property_keys=["properties.thumbnail_image"]';

    var options = {
        url: 'https://kapi.kakao.com/v2/user/me',
        method: 'POST',
        headers: headers,
        body: dataString
    };

    async function callbackUserInfo(err, res, body) {
        const json = JSON.parse(body);
        console.log(json);
    };

    request(options, callbackUserInfo);

    res.json({
        isSuccess: true,
        code: 100,
        message: "카카오톡 로그인 성공"
    })
};

/* JWT 토큰 검증 API */
exports.check = async function (req, res) {
    res.json({
        userID: req.verifiedToken.userID,
        loginMethod: req.verifiedToken.method,
        isSuccess: true,
        code: 100,
        message: "jwt 토큰 검증 성공"
    })
};

/* 프로필 사진 업로드 API */
exports.uploadProfileImage = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;
    res.json({
        userID: userIDInToken,
        isSuccess: true,
        code: 100,
        message: "프로필 사진 업로드 성공"
    })
};
