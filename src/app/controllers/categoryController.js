const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const categoryDao = require('../dao/categoryDao');
//카테고리생성
exports.insertcategory = async function (req, res) {
   const {
        categoryName,categoryColor
    } = req.body;
    const userID = req.verifiedToken.userID;
    if (!categoryName) {
         res.json({
            isSuccess: false,
            code: 212,
            message: "카테고리제목을 입력해주세요."
        });
    }
    if (categoryName.length>=10) {
         res.json({
            isSuccess: false,
            code: 312,
            message: "카테고리제목길이는 최대 10자입니다."
        });
    }
    if(!categoryColor){
         res.json({
            isSuccess : false,
            code : 214,
            message : "카테고리 색상을 선택해주세요"
        });
    }
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertcategoryCountCheckRows = await categoryDao.insertcategoryCountCheck(userID);
        if (insertcategoryCountCheckRows[0].categoryCount>=10){
             res.json({
                isSuccess: false,
                code: 405,
                message: userID +"번 유저 최대 카테고리 개수는 10개입니다."
            });
        }
        const insertcategoryCheckRows = await categoryDao.insertcategoryCheck(categoryName,userID);
        if (insertcategoryCheckRows.length > 0){
             res.json({
                isSuccess: false,
                code: 403,
                message: userID +"번 유저 중복된 카테고리 이름입니다"
            });
        }
        const insertcategoryColorCheckRows = await categoryDao.insertcategoryColorCheck(categoryColor,userID);
        if (insertcategoryColorCheckRows.length > 0){
             res.json({
                isSuccess: false,
                code: 404,
                message: userID +"번 유저 중복된 카테고리 색상입니다"
            });
        }
        const insertcategoryParams = [userID,categoryName,categoryColor];
        const insertcategoryRows = await categoryDao.insertcategoryInfo(insertcategoryParams);
        
         res.json({
            isSuccess: true,
            code: 100,
            message: "카테고리생성 성공",
            data : "생성된 카테고리번호 : "+ insertcategoryRows.insertId
        });
        connection.release();
        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            // connection.release();
            logger.error(`카테고리생성 에러\n: ${err.message}`);
             res.status(401).send(`Error: ${err.message}`);
        }
};
//카테고리수정
exports.updatecategory = async function(req,res){
    //const userID = req.verifiedToken.userID;
    const categoryID = req.params.categoryID;
    const {categoryName,categoryColor} = req.body;
    if(!categoryID){
         res.json({
            isSuccess : false,
            code : 213,
            message : "카테고리 고유번호를 입력해주세요"
        });
    }
    if(!categoryColor){
         res.json({
            isSuccess : false,
            code : 214,
            message : "카테고리 색상을 선택해주세요"
        });
    }
    if(!categoryName){
         res.json({
            isSuccess : false,
            code : 212,
            message : "카테고리 제목을 입력해주세요"
        });
    }
    if (categoryName.length>=10) {
         res.json({
            isSuccess: false,
            code: 312,
            message: "카테고리제목길이는 최대 10자입니다."
        });
    } 
    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const updatecategoryCheckRows = await categoryDao.insertcategoryCheck(categoryName);
        if (updatecategoryCheckRows.length > 0){
             res.json({
                isSuccess: false,
                code: 403,
                message: "중복된 카테고리 이름입니다"
            });
        }
        const updatecategoryParams = [categoryName,categoryColor,categoryID];
        const updatecategoryRows = await categoryDao.updatecategoryInfo(updatecategoryParams);
        
         res.json({
            isSuccess: true,
            code: 100,
            message: "카테고리수정 성공"

        });
        connection.release();
    }catch (err){
        logger.error(`카테고리수정 에러\n: ${err.message}`);
         res.status(401).send(`Error: ${err.message}`);
    }
}
//카테고리삭제
exports.deletecategory = async function (req, res) {
    const categoryID = req.params.categoryID;

    if (!categoryID) {
         res.json({ 
            isSuccess: false, 
            code: 213,
            message: "카테고리고유번호를 입력해주세요" 
        });
    }

    try {
         const connection = await pool.getConnection(async (conn) => conn);
        const deletecategoryrows = await categoryDao.deletecategoryInfo(categoryID);
        console.log(deletecategoryrows)
        if (deletecategoryrows.affectedRows==1) {
             res.json({
                isSuccess: true,
                code: 100,
                message: "카테고리 삭제 성공",
             });
        }else{
             res.json({
                isSuccess: false,
                code: 313,
                message: "카테고리 삭제 실패"
            });
        }
        connection.release();
    } catch (err) {

        logger.error(`카테고리 삭제 error: ${err.message}`);
         res.status(401).send(`Error: ${err.message}`);
    }
};
//카테고리조회
exports.getcategory = async function (req, res) {
    const userID = req.verifiedToken.userID;
   
        
        try{
            const connection = await pool.getConnection(async (conn) => conn);
            const getcategoryrows = await categoryDao.getcategoryInfo(userID);

            if (getcategoryrows) {
                 res.json({
                    isSuccess: true,
                    code: 100,
                    message: userID + "번 유저 카테고리 조회 성공",
                    data : getcategoryrows[0]
                    
                });
            }else{
                 res.json({
                    isSuccess: false,
                    code: 314,
                    message: userID + "번 유저 카테고리 조회 실패"
                });
            };
            connection.release();
        }catch (err) {
            connection.release();
            logger.error(` 카테고리 조회\n ${err.message}`);
             res.status(401).send(`Error: ${err.message}`);
        }
    
};