var async = require('async'),
    settings = require('../../settings'),
    compilePage = require('../../compilePage'),
    checkPageExists = require('../../checkPageExists'),
    sendFile = require('../sendFile.js'),
    paths = require('../../paths');

function servePage(req, res, next) {
    var path = req.parsedURL.pathname;

    function doCompile(path) {
        compilePage(path, function onCompile(err, src) {
            if (err) throw err;
            res.end(src);
        });
    }

    function doServePage(pageExistsResult, callback) {
        if (pageExistsResult) {
            if (settings.isDev) {
                doCompile(path);    // starting recompile in dev mode
            } else {
                sendFile(paths.appCache + path + '.js', req, res);  // if we're not in dev mode, there is a compiled version in the cache folder
            }
        } else {
            next();     // no page found -> next
        }
    }

    function doCheckPageExists(callback) {
        checkPageExists(path, function onCheckPageExistsResult(result) {
            callback(null, result);     // null = there will be no error
        });
    }

    async.waterfall([
        doCheckPageExists,
        doServePage
    ]);
}

module.exports = servePage;