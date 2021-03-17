module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const otpMiddleware = require('../../../config/otpMiddleware');

    app.route('/users/sign-up').post(user.signUp);
    app.route('/users/sign-in').post(user.signIn);

    app.route('/users/phone').post(user.sendAuthCode);
    app.route('/users/phone/auth').post(user.checkAuthCode);
    
    app.route('/users/kakao').post(user.kakaoOauth);
    app.patch('/users/phone', jwtMiddleware, user.updatePhoneNumber);
    app.get('/users/login-id', otpMiddleware, user.findLoginID);
    app.get('/users/phone', otpMiddleware, user.checkLoginID);
    app.post('/users/password', otpMiddleware, user.updatePassword);

    app.get('/users/check', jwtMiddleware, user.check);
    app.patch('/users/account', jwtMiddleware, user.deleteUserAccount);
};
