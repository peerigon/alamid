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

    if (config.isDev && config.useBundling === true) {
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