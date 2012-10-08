"use strict";

var config = require('../../../../core/config'),
    runCreateBundle = require("../../../../core/bundle/runCreateBundle.js"),
    paths = config.paths,
    fs = require('fs');

var init;

function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + '/index.html';

    function serve() {
        fs.readFile(initPagePath, function onFileRead(err, data) {
            if(err) {
                throw new Error("(alamid) No index.html file defined at '" + initPagePath + "'");
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(data);
        });
    }

    //only in DEV with bundling activated
    //additionally check for "." to filter file-requests (favicon, 2.app.js)
    if (config.isDev && config.useBundling === true && (req.parsedURL.pathname).indexOf(".") === -1) {
        //update bundle
        runCreateBundle(config, function(err) {
            if(err) {
                next("(alamid) Error with bundle-creation: " + err.message);
                return;
            }
           serve();
        });
    }
    else {
        serve();
    }
}

module.exports = serveInitPage;