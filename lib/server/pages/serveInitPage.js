var config = require('../../core/config'),
    paths = require('../../core/paths').getPaths(config.appDir),
    pathUtil = require("path"),
    fs = require('fs');

var init;

function serveInitPage(req, res, next) {

    var initPagePath = paths.cache + '/init.html';

    function serve() {

        //we don't need to check if file is there because we check it on file-startup
        //maybe use checkPageExists here!
        pathUtil.exists(initPagePath, function(fileExists) {

            if(!fileExists) {
                next();
                return;
            }

            fs.readFile(initPagePath, function onFileRead(err, data) {
                if(err) throw err; //TODO make more readable error message
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(data);
            });
        });

    }

    if (config.mode === "development") {
        console.log('starting recompile...');
        //is this the right place for recompile?

        //delete everything from the module-cache and restart alamid new
        //this way we won't need nodemon anymore
        //make this a middleware
        //use might websockets to reload page on file-change

        //init = require('../../core/compileAlamid');   // conditional require to prevent a circular dependency
        //init(paths.app, serve);
        //init was required here formerly
        serve();
    } else {
        serve();
    }

    //TODO include async for flow handling
}

module.exports = serveInitPage;