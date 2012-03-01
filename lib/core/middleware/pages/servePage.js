var fs = require('fs'),
    async = require('async'),
    settings = require('../../settings'),
    compilePage = require('../../compilePage'),
    checkPageExists = require('../../checkPageExists'),
    sendFile = require('../sendFile.js');
    paths = require('../../paths');

function servePage(req, res, next) {
    var path = req.parsedURL.pathname;

    /*function doCompile(path) {
        compilePage(path, function onCompile(err, src) {
            if (err) throw err;
            res.end(src);
        });
    }

    function doRead(path) {
        fs.readFile(path, 'utf8', function onRead(err, data) {
            if (err) throw err;
            res.end(data);
        });
    }*/

    function onExistsResult(result) {
        if (result) {
            sendFile(paths.appCache + path + '.js', req, res);
        } else/* if(settings.isDev) {
            doCompile(path);
        } else*/ {
            next();
        }
    }

    pathUtil.exists(paths.appCache + path + '.js', onExistsResult);
}

module.exports = servePage;