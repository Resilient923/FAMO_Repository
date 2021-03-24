process.env.AWS_SDK_LOAD_CONFIG = true;

const AWS = require('aws-sdk');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');

var userIDInToken;


exports.jwt = async function(req, res, next){
    userIDInToken = req.verifiedToken.userID;
    userIDInToken = userIDInToken.toString();

    next();
}

AWS.config.update({ region: "ap-northeast-2" });

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const storage = multerS3({
    s3: s3,
    bucket: "soibucket",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        cb(null, "FamoProfile/" + path.basename(userIDInToken));
    },
    acl: "public-read-write",
});

exports.upload = multer({storage: storage});
