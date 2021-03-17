const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const request = require('request');
const secret_config = require('../../../config/secret');
const nodeCache = require('node-cache');
const twilio = require('twilio');

const userDao = require('../dao/userDao');
const profileDao = require('../dao/profileDao');

const codeCache = new nodeCache({stdTTL: 180, checkperiod: 200});
const client = new twilio(secret_config.twilioSid, secret_config.twilioToken);

/* 회원가입 API */
exports.signUp = async function (req, res) {
    const {
        loginID, password, nickname, phoneNumber
    } = req.body;

    if (!loginID) {
        return res.json({
            isSuccess: false, 
            code: 201, 
            message: "아이디를 입력해주세요."
        });
    };

    if (!password){
        return res.json({
            isSuccess: false, 
            code: 202, 
            message: "비밀번호를 입력해주세요."
        });
    }

    if (!nickname){
        return res.json({
            isSuccess: false, 
            code: 203, 
            message: "닉네임을 입력해주세요."
        });
    }

    if (!phoneNumber){
        return res.json({
            isSuccess: false,
            code: 204,
            message: "핸드폰 번호를 입력해주세요."
        });
    }

    if(loginID.length > 320){
        return res.json({
            isSuccess: false,
            code: 301,
            message: "아이디는 최대 320자입니다."
        });
    }

    if(password.length < 8){
        return res.json({
            isSuccess: false,
            code: 316,
            message: "비밀번호는 최소 8자입니다."
        });
    }

    var num = password.search(/[0-9]/g);
    var eng = password.search(/[a-z]/ig);
    var spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if(num < 0 || eng < 0 || spe < 0){
        return res.json({
            isSuccess: false,
            code: 317,
            message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 입력해주세요."
        });
    }

    if(nickname.length > 6){
        return res.json({
            isSuccess: false,
            code: 302,
            message: "닉네임은 최대 6자입니다."
        });
    }

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [loginIDRows] = await userDao.checkUserLoginID(loginID);
            if (loginIDRows[0].exist == 1) {
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 401,
                    message: "중복된 아이디입니다."
                })
            };

            const [phoneNumberRows] = await userDao.checkPhoneNumber(phoneNumber);
            if (phoneNumberRows[0].exist == 1) {

                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 402,
                    message: "중복된 휴대폰 번호입니다."
                });
            };
            
            await connection.beginTransaction(); // START TRANSACTION
            const passwordSalt = crypto.randomBytes(64).toString('base64');
            const passwordHash = crypto.pbkdf2Sync(password, passwordSalt, 101024, 64, 'sha512').toString('base64');

            const insertUserInfoParams = [loginID, passwordHash, passwordSalt, nickname, phoneNumber, 'F'];
            const insertUserRowsId = await userDao.insertUserInfo(insertUserInfoParams);
            const insertProfileImageParams = [insertUserRowsId, null];
            await profileDao.insertProfileImage(insertProfileImageParams);
            const [userInfoRows] = await userDao.selectUserInfo(loginID);
            
            await connection.commit();

            let token = jwt.sign({
                userID: insertUserRowsId,
                method: 'F'
            },
                secret_config.jwtsecret, // 비밀 키
              {
                expiresIn: '365d',
                subject: 'userInfo'
              } // 유효 시간은 365일
            );
           
            res.json({
                userID: userInfoRows[0].userID,
                nickname: userInfoRows[0].nickname,
                jwt: token,
                isSuccess: true,
                code: 100,
                message: "회원가입 성공"
            })
            connection.release();

        }catch (err) {
            await connection.rollback();
            connection.release();
            logger.error(`Sign up Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Sign up DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 로그인 API */
exports.signIn = async function (req, res) {
    const {
        loginID, password
    } = req.body;

    if (!loginID){
        return res.json({
            isSuccess: false, 
            code: 201, 
            message: "아이디를 입력해주세요."
        });
    }

    if (!password){
        return res.json({
            isSuccess: false, 
            code: 202, 
            message: "비밀번호를 입력해주세요."
        });
    }

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
            connection.release();
            logger.error(`SignIn Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
     } catch (err) {
        logger.error(`SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
     }
};

/* 카카오 로그인 API */
exports.kakaoOauth = async function (req, res){
    const {
        kakaoAccessToken, kakaoRefreshToken
    } = req.body;

    var nickname;
    var profileImage;
    var loginID;

    const insertKakaoUserInfo = async function (loginID, nickname, kakaoRefreshToken, profileImage){
        try{
            const connection = await pool.getConnection(async (conn) => conn);
            try{
                const [loginIDRows] = await userDao.checkUserLoginID(loginID);
        
                if (loginIDRows[0].exist == 1) {
                    const [userInfoRows] = await userDao.selectUserInfo(loginID);
                    
                    let token = jwt.sign({
                        userID: userInfoRows[0].userID,
                        method: userInfoRows[0].method
                    },
                    secret_config.jwtsecret,
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    });

                    res.json({
                        userID: userInfoRows[0].userID,
                        nickname: userInfoRows[0].nickname,
                        jwt: token,
                        isSuccess: true,
                        code: 100,
                        message: "카카오 계정으로 로그인 성공(홈화면으로 이동)"
                    })
                }else{
                    await connection.beginTransaction();

                    const insertUserInfoParams = [loginID, nickname, kakaoRefreshToken, 'K'];
                    await userDao.insertKakaoUserInfo(insertUserInfoParams);
                    const [userInfoRows] = await userDao.selectUserInfo(loginID);
                    const insertProfileImageParams = [userInfoRows[0].userID, profileImage];
                    await profileDao.insertProfileImage(insertProfileImageParams);
        
                    await connection.commit();

                    let token = jwt.sign({
                        userID: userInfoRows[0].userID,
                        method: 'K'
                      },
                        secret_config.jwtsecret,
                      {
                        expiresIn: '365d',
                        subject: 'userInfo'
                      });
                    
                    res.json({
                        userID: userInfoRows[0].userID,
                        nickname: userInfoRows[0].nickname,
                        jwt: token,
                        isSuccess: true,
                        code: 101,
                        message: "카카오 계정으로 첫 로그인 성공(핸드폰 번호 입력 화면으로 이동)"
                    });
                }

                connection.release();

            }catch (err) {
                await connection.rollback();
                connection.release();
                logger.error(`KAKAO Login Query error\n: ${JSON.stringify(err)}`);
                return false;
            }
        }catch (err) {
            logger.error(`KAKAO Login DB connection error\n: ${JSON.stringify(err)}`);
            return false;
        }
    };

    const option = {
        url: 'https://kapi.kakao.com/v2/user/me',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${kakaoAccessToken}`
        },
        body: 'property_keys=["properties.thumbnail_image"]'
    };

    const p = new Promise(
        (resolve, reject) => {
            request(option, (err, res, body) => {
                if(err){
                    reject(err);
                };
                
                const json = JSON.parse(body);

                nickname = json.properties.nickname;
                loginID = json.id;
                
                if(json.kakao_account.profile.thumbnail_image_url){
                    profileImage = json.kakao_account.profile.thumbnail_image_url;
                }else{
                    profileImage = null;
                }
                resolve()
            })
        }
    );

    const onError = (error) => {
        res.status(403).json({
            isSuccess:false,
            code: 216,
            message:"KaKao API UserInfo error"
        })
    };

    p.then(()=>{
        insertKakaoUserInfo(loginID, nickname, kakaoRefreshToken, profileImage);
    }).catch(onError)
};

/* 핸드폰 번호 업데이트 API */
exports.updatePhoneNumber = async function (req, res) {
    const { phoneNumber } = req.body;
    const userIDInToken = req.verifiedToken.userID;

    if (!phoneNumber){
        return res.json({
            isSuccess: false,
            code: 204,
            message: "핸드폰 번호를 입력해주세요."
        });
    }

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{

            const [phoneNumberRows] = await userDao.checkPhoneNumber(phoneNumber);
            
            if (phoneNumberRows[0].exist == 1) {

                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 402,
                    message: "중복된 휴대폰 번호입니다."
                });
            };

            await userDao.updatePhoneNumber(userIDInToken, phoneNumber);

            res.json({
                isSuccess: true,
                code: 100,
                message: "핸드폰 번호 업데이트 성공"
            });

            connection.release();
        }catch (err) {
            connection.release();
            logger.error(`Update phone number Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Update phone number Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
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

/* 회원 탈퇴 API */
exports.deleteUserAccount = async function (req, res) {
    const userIDInToken = req.verifiedToken.userID;

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            await userDao.deleteUserAccount(userIDInToken);

            res.json({
                userID: userIDInToken,
                isSuccess: true,
                code: 100,
                message: "회원 탈퇴 성공"
            })
            
            connection.release();
 
        }catch (err) {
            connection.release();
            logger.error(`Delete user account Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Delete user account DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 문자 발송 API */
exports.sendAuthCode = async function(req, res){
    const {
        phoneNumber
    } = req.body;

    if (!phoneNumber){
        return res.json({
            isSuccess: false,
            code: 204,
            message: "핸드폰 번호를 입력해주세요."
        });
    }

    try{
        const randomCode = Math.floor(Math.random() * 900000) + 100000;
        const success = codeCache.set(phoneNumber, {"randomCode": `${randomCode}`});

        if(success === true){
            client.messages.create({
                body: `FAMO 인증번호 [${randomCode}]`,
                to: `+82${phoneNumber}`,
                from: '+15108227026' // From a valid Twilio number
            })
            .catch(error => res.status(500).send(`Error: ${error}`));
            //.then((message) => console.log(message.sid));

            return res.status(200).json({
                isSuccess: true,
                code: 100,
                message: "문자 발송 성공"
            });

        }else{
            return res.json({
                isSuccess: false,
                code: 300,
                message: "서버 오류로 문자메세지를 보내는데 실패했습니다. 고객센터에 문의해주세요."
            })
        }
    }catch (err) {
        logger.error(`Send Auth Code Message Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 문자 인증 번호 확인 API */
exports.checkAuthCode = async function(req, res){
    const {
        phoneNumber, authCode
    } = req.body;

    const value = codeCache.get(phoneNumber);

    if (!phoneNumber){
        return res.json({
            isSuccess: false,
            code: 204,
            message: "핸드폰 번호를 입력해주세요."
        });
    }
    if (!authCode){
        return res.json({
            isSuccess: false,
            code: 221,
            message: "인증번호를 입력해주세요."
        });
    }
    if(value == undefined){
        return res.json({
            isSuccess: false,
            code: 222,
            message: "인증번호가 발급되지 않았습니다."
        });   
    }

    try{
        if(authCode == value.randomCode){
            codeCache.del(phoneNumber);

            let token = jwt.sign({
                phoneNumber: phoneNumber
            },
            secret_config.jwtauth,
            {
                expiresIn: '1d',
                subject: 'phoneNumberInfo'
            });

            return res.json({
                jwt: token,
                isSuccess: true,
                code: 100,
                message: "인증번호 확인 성공"
            });
        }else{
            return res.json({
                isSuccess: false,
                code: 329,
                message: "인증번호가 일치하지 않습니다."
            });
        }
    }catch (err) {
        logger.error(`Check Auth Code Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 아이디 찾기 API */
exports.findLoginID = async function (req, res) {
    const phoneNumber = req.verifiedOtpToken.phoneNumber;

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const [checkPhoneNumberRow] = await userDao.checkPhoneNumber(phoneNumber);
            
            if(checkPhoneNumberRow[0].exist == 0){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 406,
                    message: `${phoneNumber}로 가입된 계정이 없습니다.`
                });
            };

            const [getUserAccountInfoRow] = await userDao.selectUserInfoByPhone(phoneNumber);

            if(getUserAccountInfoRow[0].status == -1){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 305,
                    message: "비활성화된 계정입니다. 고객센터에 문의해주세요."
                });
            };

            if(getUserAccountInfoRow[0].method == 'K'){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 407,
                    message: "카카오로 로그인해주세요."
                });
            };

            res.json({
                userID: getUserAccountInfoRow[0].userID,
                loginID: getUserAccountInfoRow[0].loginID, 
                isSuccess: true,
                code: 100,
                message: "아이디 조회 성공"
            });

            connection.release();

        }catch (err) {
            connection.release();
            logger.error(`Find LoginID Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Finde LoginID connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 계정 아이디, 핸드폰 번호 일치 확인 API */
exports.checkLoginID = async function (req, res) {
    const phoneNumber = req.verifiedOtpToken.phoneNumber;
    const loginID = req.query.loginid;

    if(!loginID){
        return res.json({
            isSuccess: false,
            code: 201,
            message: "아이디를 입력해주세요."
        })
    };

    try{
        const connection = await pool.getConnection(async conn => conn);
        try{
            const [checkLoginIDRow] = await userDao.checkUserLoginID(loginID);

            if(checkLoginIDRow[0].exist == 0){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "아이디를 확인해주세요."
                })
            };

            const [selectUserInfoRow] = await userDao.selectUserInfo(loginID);

            if(selectUserInfoRow[0].phoneNumber !== phoneNumber){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 408,
                    message: "계정에 등록된 휴대폰 번호가 아닙니다. 휴대폰 번호가 변경되었을 시, 고객센터에 문의해주세요."
                })
            };

            const [getUserAccountInfoRow] = await userDao.selectUserInfoByPhone(phoneNumber);

            if(getUserAccountInfoRow[0].status == -1){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 305,
                    message: "비활성화된 계정입니다. 고객센터에 문의해주세요."
                });
            };

            if(getUserAccountInfoRow[0].method == 'K'){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 407,
                    message: "카카오로 로그인해주세요."
                });
            };
            
            res.json({
                isSuccess: true,
                code: 100,
                message: "비밀번호를 재설정할 수 있습니다."
            });

            connection.release();

        }catch (err) {
            connection.release();
            logger.error(`Check LoginID Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Check LoginID DB connection error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/* 비밀번호 재설정 */
exports.updatePassword = async function (req, res) {
    const phoneNumber = req.verifiedOtpToken.phoneNumber;
    const loginID = req.query.loginid;
    const { password } = req.body;

    if(!loginID){
        return res.json({
            isSuccess: false,
            code: 201,
            message: "아이디를 입력해주세요."
        })
    };

    if(!password){
        return res.json({
            isSuccess: false,
            code: 201,
            message: "아이디를 입력해주세요."
        })
    }

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [checkLoginIDRow] = await userDao.checkUserLoginID(loginID);

            if(checkLoginIDRow[0].exist == 0){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "아이디를 확인해주세요."
                })
            };

            const [selectUserInfoRow] = await userDao.selectUserInfo(loginID);

            if(selectUserInfoRow[0].phoneNumber !== phoneNumber){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 408,
                    message: "계정에 등록된 휴대폰 번호가 아닙니다. 휴대폰 번호가 변경되었을 시, 고객센터에 문의해주세요."
                })
            };

            const [getUserAccountInfoRow] = await userDao.selectUserInfoByPhone(phoneNumber);

            if(getUserAccountInfoRow[0].status == -1){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 305,
                    message: "비활성화된 계정입니다. 고객센터에 문의해주세요."
                });
            };

            if(getUserAccountInfoRow[0].method == 'K'){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 407,
                    message: "카카오로 로그인해주세요."
                });
            };

            if(password.length < 8){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 316,
                    message: "비밀번호는 최소 8자입니다."
                });
            };
        
            var num = password.search(/[0-9]/g);
            var eng = password.search(/[a-z]/ig);
            var spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
        
            if(num < 0 || eng < 0 || spe < 0){
                connection.release();

                return res.json({
                    isSuccess: false,
                    code: 317,
                    message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함하여 입력해주세요."
                });
            };

            const passwordSalt = crypto.randomBytes(64).toString('base64');
            const passwordHash = crypto.pbkdf2Sync(password, passwordSalt, 101024, 64, 'sha512').toString('base64');
            const passwordParams = [passwordHash, passwordSalt];

            await userDao.updatePassword(phoneNumber, passwordParams);

            res.json({
                isSuccess: true,
                code: 100,
                message: "비밀번호가 변경되었습니다."
            });

            connection.release();

        }catch (err) {
            connection.release();
            logger.error(`Update Password Query error\n: ${JSON.stringify(err)}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    }catch (err) {
        logger.error(`Update Password Query error\n: ${JSON.stringify(err)}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

