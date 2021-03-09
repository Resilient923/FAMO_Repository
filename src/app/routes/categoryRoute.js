module.exports = function(app){
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
   
    app.post('/categories',jwtMiddleware,category.insertcategory);

};
