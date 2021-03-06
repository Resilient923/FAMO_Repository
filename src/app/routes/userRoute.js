module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const { upload } = require('../controllers/awsS3'); 

    app.route('/users/sign-up').post(user.signUp);
    app.route('/users/sign-in').post(user.signIn);
    
    app.post('/users/profile-image', upload.single('profileImage'), jwtMiddleware, user.uploadProfileImage);
    app.get('/check', jwtMiddleware, user.check);
};
