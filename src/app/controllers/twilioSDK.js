const nodeCache = require('node-cache');

const codeCache = new nodeCache({stdTTL: 180, checkperiod: 200});


exports.sendAuthCode = async function(req, res){
    const {
        phoneNumber
    } = req.body;

    const randomCode = Math.floor(Math.random() * 1000000) + 100000;

    const success = codeCache.set(phoneNumber, {"randomCode": `${randomCode}`});

    if(success === true){
        const value = codeCache.get(phoneNumber);

        console.log(value);
    }
};