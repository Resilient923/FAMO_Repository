module.exports = function(app){
    const profile = require('../controllers/profileController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const aws = require('../controllers/awsS3');

    app.post('/profiles/image', [jwtMiddleware, aws.jwt, aws.upload.single('profileImage')], profile.uploadProfileImage);
    app.get('/profiles/comments', jwtMiddleware, profile.getTitleComment);
    app.get('/profiles', jwtMiddleware, profile.getProfile);
    app.put('/profiles', jwtMiddleware, profile.updateProfile);
};