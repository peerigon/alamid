"use strict";

var config = require('../../../../core/config'),
    createBundle = require("../../../../core/bundle/createBundle.js"),
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

    if (config.isDev && config.useBundling) {
        //update bundle
        createBundle(config, function(err, stats) {
            if(err) {
                next("(alamid) Error with bundle-creation: " + err.message);
                return;
            }
            else if(stats.errors.length > 0) {
                next(new Error("(alamid) Error with bundle-creation: ", stats.errors));
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