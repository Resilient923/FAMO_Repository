module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
    app.get('/', function (req, res) {
        res.send('Hello Node!');
    });
    app.get('/app', jwtMiddleware, index.default);
};
