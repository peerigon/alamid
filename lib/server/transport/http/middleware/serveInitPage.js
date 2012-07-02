"use strict";

var config = require('../../../../core/config'),
    paths = config.paths,
    fs = require('fs');

var init;

function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + '/index.html';

    function serve() {
        fs.readFile(initPagePath, function onFileRead(err, data) {
            if(err) {
                throw new Error("(alamid) No index.html file defined.");
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(data);
        });
    }

    /*
    if (config.isDev) {
        console.log('starting recompile...');
        //is this the right place for recompile?

        //delete everything from the module-cache and restart alamid new
        //this way we won't need nodemon anymore
        //make this a middleware
        //use mighty websockets to reload page on file-change

        //init = require('../../core/compileAlamid');   // conditional require to prevent a circular dependency
        //init(paths.app, serve);
        //init was required here formerly
        serve();
    } else {
        serve();
    }
    */

    serve();
}

module.exports = serveInitPage;