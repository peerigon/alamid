var async = require('async'),
    config = require('../../../../shared/config'),
    compilePage = require('../../../../core/compilePage'),
    checkPageExists = require('../../../helpers/checkPageExists'),
    sendFile = require('./sendFile.js'),
    paths = config.paths;

function servePage(req, res, next) {
    var path = req.parsedURL.pathname;

    function doCompile(path) {
        compilePage(path, function onCompile(err, src) {
            if (err) {
                throw err;
            }
            res.end(src);
        });
    }

    function doServePage(pageExistsResult, callback) {
        if (pageExistsResult) {
            if (config.isDev) {
                //TODO include as soon as page compile works!
                //doCompile(path);    // starting recompile in dev mode
            } else {
                sendFile(paths.cache + path + '.js', req, res);  // if we're not in dev mode, there is a compiled version in the cache folder
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