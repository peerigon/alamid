var async = require('async'),
    config = require('../../../../shared/config'),
    compilePage = require('../../../../core/compilePage'),
    checkPageExists = require('../../../helpers/checkPageExists'),
    paths = config.paths;

function recompilePage(req, res, next) {
    var path = req.parsedURL.pathname;

    function doCompile(path, callback) {
        compilePage(path, function onCompile(err) {
            if (err) {
                throw err;
            }
            callback();
        });
    }

    function doCheckPageExists(callback) {
        checkPageExists(path, function onCheckPageExistsResult(result) {

            if(result) {

                callback();
                //doCompile(path, function() {
                //    callback();
                //});
            }
            else{
                callback();
            }
        });
    }

    doCheckPageExists(function onDoCheckPageExists() {
        next();
    });

}

module.exports = recompilePage;