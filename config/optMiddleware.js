const jwt = require('jsonwebtoken');
const secret_config = require('./secret');

const otpMiddleware = (req, res, next) => {
    const token = req.headers['otp-auth-token'] || req.query.token;
    
    if(!token) {
        return res.status(403).json({
            isSuccess:false,
            code: 215,
            message: "header에 otp-auth-token을 넣어주세요."
        });
    }

    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret_config.jwtauth, (err, verifiedOtpToken) => {            
                if(err) reject(err);

                resolve(verifiedOtpToken)
            })
        }
    );

    const onError = (error) => {
        res.status(403).json({
            isSuccess:false,
            code: 315,
            message: "핸드폰 인증 토큰이 아니거나 유효기간이 만료되었습니다."
        });
    };

    p.then((verifiedOtpToken)=>{
        
        req.verifiedOtpToken = verifiedOtpToken;

        next();

    }).catch(onError);
};

module.exports = otpMiddleware;