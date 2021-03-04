const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
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
            const passwordHash = crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [loginID, passwordHash, nickname, phoneNumber, 'F'];
            
            const insertUserRowsId = await userDao.insertUserInfo(insertUserInfoParams);
            

            let token = jwt.sign({
                userID: insertUserRowsId,
                method: 'F'
              }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
              {
                expiresIn: '14d',
                subject: 'userInfo'
              } // 유효 시간은 14일
            );
           //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
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

exports.signIn = async function (req, res) {
    const {
        loginID, password
    } = req.body;

    if (!loginID) return res.json({isSuccess: false, code: 301, message: "이메일을 입력해주세요."});
    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요."});

    if (!password) return res.json({isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요."});
        try {
            const [userInfoRows] = await userDao.selectUserInfo(email)

            if (userInfoRows.length < 1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "아이디를 확인해주세요."
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            if (userInfoRows[0].pswd !== hashedPassword) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 311,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].status === "INACTIVE") {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 312,
                    message: "비활성화 된 계정입니다. 고객센터에 문의해주세요."
                });
            } else if (userInfoRows[0].status === "DELETED") {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 313,
                    message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
                });
            }
            //토큰 생성
            let token = await jwt.sign({
                    id: userInfoRows[0].userID,
                    method: userInfoRows[0].method
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );

            res.json({
                userInfo: userInfoRows[0],
                jwt: token,
                isSuccess: true,
                code: 200,
                message: "로그인 성공"
            });

            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
};

/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};
