const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const categoryDao = require('../dao/scheduleDao');
//카테고리생성
exports.insertcategory = async function (req, res) {
   const {
        categoryName,categoryColor
    } = req.body
    const userID = req.verifiedToken.userID;
    if (!categoryName) {
        return res.json({
            isSuccess: false,
            code: 206,
            message: "카테고리제목을 입력해주세요."
        });
    }
    if (categoryName.length>=10) {
        return res.json({
            isSuccess: false,
            code: 310,
            message: "카테고리제목길이는 최대 10자입니다."
        });
    } 
    try {
        const insertcategoryParams = [userID,categoryName,categoryColor];
        const insertcategoryRows = await categoryDao.insertcategoryInfo(insertcategoryParams);
        
        return res.json({
            isSuccess: true,
            code: 100,
            message: "카테고리생성 성공"

        });
        } catch (err) {
            // await connection.rollback(); // ROLLBACK
            // connection.release();
            logger.error(`카테고리생성 에러\n: ${err.message}`);
            return res.status(401).send(`Error: ${err.message}`);
        }
};
