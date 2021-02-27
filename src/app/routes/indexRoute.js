module.exports = function(app){
    const index = require('../controllers/indexController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/', function (req, res) {
        res.send('Hello Node!');
    });
    app.get('/app', jwtMiddleware, index.default);
};
