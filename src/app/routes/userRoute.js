module.exports = function(app){
    const user = require('../controllers/userController');
    const twilio = require('../controllers/twilioSDK');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/users/sign-up').post(user.signUp);
    app.route('/users/sign-in').post(user.signIn);

    app.route('/users/phone').post(twilio.sendAuthCode);
    
    app.route('/users/kakao').get(user.kakao);
    app.route('/kakao/oauth').get(user.kakaoOauth);

    app.get('/users/check', jwtMiddleware, user.check);
    app.patch('/users/account', jwtMiddleware, user.deleteUserAccount);
};
