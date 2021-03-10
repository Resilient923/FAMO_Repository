module.exports = function(app){
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    /* 연결 테스트 */
   
    app.post('/categories',jwtMiddleware,category.insertcategory);//카테고리생성    
    app.patch('/categories/:categoryID',jwtMiddleware,category.updatecategory);//카테고리수정
    app.delete('/categories/:categoryID',jwtMiddleware,category.deletecategory);//카테고리삭제
    app.get('/categories',jwtMiddleware,category.getcategory);//카테고리 조회
};
