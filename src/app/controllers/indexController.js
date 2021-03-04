const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const indexDao = require('../dao/indexDao');

exports.default = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const userIDInToken = jwt.decode(verifiedToken);
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
