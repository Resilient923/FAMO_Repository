const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const indexDao = require('../dao/indexDao');
const jwtMiddleware = require('../../../config/jwtMiddleware');

exports.default = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const userIDInToken = req.verifiedToken.userID;
            const loginMethod = req.verifiedToken.method;
            const [rows] = await indexDao.defaultDao(userIDInToken);

            return res.json(rows);
            
        } catch (err) {
            logger.error(`non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
