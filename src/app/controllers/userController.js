const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const request = require('request');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const profileDao = require('../dao/profileDao');
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
    });

    if(loginID.length > 320) return res.json({
        isSuccess: false,
        code: 301,
        message: "아이디는 최대 320자입니다."
    });

    if(password.length < 8) return res.json({
        isSuccess: false,
        code: 316,
        message: "비밀번호는 최소 8자입니다."
    });

    var num = password.search(/[0-9]/g);
    var eng = password.search(/[a-z]/ig);
    var spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if(num < 0 || eng < 0 || spe < 0) return res.json({
        isSuccess: false,
        code: 317,
        message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 입력해주세요."
    });

    if(nickname.length > 20) return res.json({
        isSuccess: false,
        code: 302,
        message: "닉네임은 최대 20자입니다."
    });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const loginIDRows = await userDao.checkUserLoginID(loginID);
            if (loginIDRows[0].exist == 1) {

                return res.json({
                    isSuccess: false,
                    code: 401,
                    message: "중복된 아이디입니다."
                });
            };

            const phoneNumberRows = await userDao.checkPhoneNumber(phoneNumber);
            if (phoneNumberRows[0].exist == 1) {

                return res.json({
                    isSuccess: false,
                    code: 402,
                    message: "중복된 휴대폰 번호입니다."
                });
            };

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
            logger.error(`SignUp Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`SignUp DB Connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
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
            
            if (userInfoRows[0].password != passwordHash) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 304,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].status === -1) {
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
            logger.error(`SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.status(500).send(`Error: ${err.message}`);
        }
     } catch (err) {
        logger.error(`SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
     }
};

/* 카카오 로그인 동의 화면 출력 API */
exports.kakao = async function (req, res) {
    const clientID = secret_config.kakaoClientID;
    const url = 'https://dev.risingsoi.site/kakao/oauth'
    res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${url}&response_type=code`);
};

/* 카카오 access token, refresh token 발급 및 로그인 API */
exports.kakaoOauth = async function (req, res){
    const code = req.query.code;
    const clientID = secret_config.kakaoClientID;
    const url = 'https://dev.risingsoi.site/kakao/oauth';
    
    const options = {
        url: 'https://kauth.kakao.com/oauth/token',
        method: 'POST',
        headers: {
            'Host': 'kauth.kakao.com',
            'Content-type': 'application/x-www-form-urlencoded; charset=utf-8;'
        },
        body: `grant_type=authorization_code&client_id=${clientID}&redirect_uri=${url}&code=${code}`
    };

    var nickname;
    var profileImage;
    var email;
    var refreshToken;

    const p = new Promise(
        (resolve, reject) => {
            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }
                const json = JSON.parse(body);
                const accessToken = json.access_token;
                refreshToken = json.refresh_token;

                resolve(accessToken)
            })
        }
    );

    const onError = (error) => {
        res.status(403).json({
            isSuccess:false,
            code: 215,
            message:"KaKao API Callback error"
        });
    };

    const insertKakaoUserInfo = async function (email, nickname, refreshToken, profileImage){
        try{
            const connection = await pool.getConnection(async (conn) => conn);
            try{
                const loginIDRows = await userDao.checkUserLoginID(email);
        
                if (loginIDRows[0].exist == 1) {
                    const [userInfoRows] = await userDao.selectUserInfo(email);
                    
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
                    message: "카카오 계정으로 로그인 성공"
                })
        
                }else{
                    const insertUserInfoParams = [email, nickname, refreshToken, 'K'];
                    const insertUserRowsId = await userDao.insertKakaoUserInfo(insertUserInfoParams);
                    const [userInfoRows] = await userDao.selectUserInfo(email);
                    const insertProfileImageParams = [insertUserRowsId, profileImage];
                    profileDao.insertProfileImage(insertProfileImageParams);
        
                    let token = jwt.sign({
                        userID: insertUserRowsId,
                        method: 'K'
                      }, // 토큰의 내용(payload)
                        secret_config.jwtsecret, // 비밀 키
                      {
                        expiresIn: '365d',
                        subject: 'userInfo'
                      } // 유효 시간은 365일
                    );
                    // await connection.commit(); // COMMIT
                    // connection.release();
                    return res.json({
                        userID: userInfoRows[0].userID,
                        nickname: userInfoRows[0].nickname,
                        jwt: token,
                        isSuccess: true,
                        code: 100,
                        message: "카카오 계정으로 첫 로그인 성공"
                    });
                }
            }catch (err) {
            connection.release();
            logger.error(`KAKAO Login Query error\n: ${JSON.stringify(err)}`);
            return false;
            }
        }catch (err) {
            logger.error(`KAKAO Login DB connection error\n: ${JSON.stringify(err)}`);
            return false;
        }
    };
    
    p.then((accessToken)=>{

        const optionTwo = {
            url: 'https://kapi.kakao.com/v2/user/me',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: 'property_keys=["properties.thumbnail_image"]'
        };
    
        const k = new Promise(
            (resolve, reject) => {
                request(optionTwo, (err, res, body) => {

                    if(err){
                        reject(err);
                    }
                    
                    const json = JSON.parse(body);
                    nickname = json.properties.nickname;
                    
                    if(json.kakao_account.profile.thumbnail_image_url){
                        profileImage = json.kakao_account.profile.thumbnail_image_url;
                    }else{
                        profileImage = null;
                    }
                    
                    if(json.kakao_account.has_email === true){
                        email = json.kakao_account.email;
                    }else{
                        res.status(403).json({
                            isSuccess:false,
                            code: 315,
                            message:"카카오 계정에 이메일 설정이 되어있지 않습니다."
                        })
                    }
                    resolve()
                })
            }
        );

        const upError = (error) => {
            res.status(403).json({
                isSuccess:false,
                code: 216,
                message:"KaKao API Call UserInfo error"
            });
        };

        k.then(()=>{
            insertKakaoUserInfo(email, nickname, refreshToken, profileImage);
        }).catch(upError)
    }).catch(onError)
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
