const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
module.exports = function () {
    const app = express();
    
    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());
    app.use(cors());

    // app.use(express.static(process.cwd() + '/public'));

    /* App Android */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);
    require('../src/app/routes/profileRoute')(app);
    require('../src/app/routes/scheduleRoute')(app);
    require('../src/app/routes/categoryRoute')(app);
    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};