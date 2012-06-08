var config = require('../../core/config'),
    paths = require('../../core/paths').getPaths(config.appDir),
    pathUtil = require("path"),
    fs = require('fs');

var init;

function serveInitPage(req, res, next) {

    var initPagePath = paths.cache + '/init.html';

    function serve() {

        pathUtil.exists(initPagePath, function(fileExists) {

            if(!fileExists) {
                next();
                return;
            }

            //maybe use checkPageExists here!
            fs.readFile(initPagePath, function onFileRead(err, data) {
                if(err) throw err;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(data);
            });
        });

    }

    if (config.mode === "development") {
        console.log('starting recompile...');
        //is this the right place for recompile?
        init = require('../../core/compileAlamid');   // conditional require to prevent a circular dependency
        //init(paths.app, serve);
        //init was required here formerly
        serve();
    } else {
        serve();
    }
}

module.exports = serveInitPage;