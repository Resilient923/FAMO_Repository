module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const aws = require('../controllers/awsS3');
    //const { upload } = require('../controllers/awsS3'); 

    app.route('/users/sign-up').post(user.signUp);
    app.route('/users/sign-in').post(user.signIn);
    
    app.post('/users/profile-image', [jwtMiddleware, aws.jwt, aws.upload.single('profileImage')], user.uploadProfileImage);
    app.get('/check', jwtMiddleware, user.check);
};
