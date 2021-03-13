const jwt = require('jsonwebtoken');
const secret_config = require('./secret');
const userDao = require('../src/app/dao/userDao');

const jwtMiddleware = (req, res, next) => {
    // read the token from header or url
    const token = req.headers['x-access-token'] || req.query.token;
    // token does not exist
    if(!token) {
        return res.status(403).json({
            isSuccess:false,
            code: 210,
            message: '로그인이 되어 있지 않습니다.'
        });
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret_config.jwtsecret , (err, verifiedToken) => {            
                if(err) reject(err);

                resolve(verifiedToken)
            })
        }
    );

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            isSuccess:false,
            code: 211,
            message:"jwt 토큰 검증 실패"
        });
    };

    const checkUserID = async function(userID) {
        const [checkUserIDRow] = await userDao.checkUserID(userID);

        if(checkUserIDRow[0].exist == 0){
            return res.status(401).json({
                isSuccess:false,
                code: 217,
                message:"존재하지 않는 회원입니다."
            });

        }else{
            return next();
        }
    };

    p.then((verifiedToken)=>{

        req.verifiedToken = verifiedToken;

        checkUserID(verifiedToken.userID);

    }).catch(onError);
};

module.exports = jwtMiddleware;
