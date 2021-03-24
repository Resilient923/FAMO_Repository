const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const alertDao = require('../dao/alertDao');
const schedule = require('node-schedule');

const date = new Date()




































































































































































































const admin = require('firebase-admin');
let serAccount = require('../famo_firebase.json');
admin.initializeApp({
    credential: admin.credential.cert(serAccount),
  })

exports.postalert = async function (req, res){
    const userID = req.verifiedToken.userID;
    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const getDeviceTokenRows = await alertDao.getDeviceTokenInfo(userID);
        let message = {
            notification: {
            title: 'Famo 일정 알람',
            body:getDeviceTokenRows[0][0].nickname + '님 일정을 확인해주세요!',
            },
            data: {
            title: 'Famo 일정 알람',
            body:getDeviceTokenRows[0][0].nickname + '님 일정을 확인해주세요!',
            },
            token: getDeviceTokenRows[0][0].deviceToken,
        }
        admin
            .messaging()
            .send(message)
            .then(function (response) {
            console.log('Successfully sent message : ', response)
            })
            .catch(function (err) {
                console.log('Error Sending message : ', err)
            });
        res.json({
            nickname: getDeviceTokenRows[0][0].nickname,
            isSuccess: true,
            code: 1000,
            message: "알람 울리기 성공"
        });
        connection.release();
    }catch (err){
        connection.release();
                logger.error(`알람 울리기 에러\n: ${err.message}`);
                res.status(401).send(`Error: ${err.message}`);    
    }
} 