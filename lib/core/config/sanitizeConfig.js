"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    path = require("path");


/**
 * sanitize given configuration-object and set default values
 * @param {!Object} config
 */
function sanitizeConfig (config) {

    var log = console.log;

    function checkPort () {
        var port = config.port;

        if (_(port).isNumber() === false) {
            port = Number(port);    // cast to Number, null becomes 0!
            if (isNaN(port) || port === 0) {
                throw new Error("Error with your config: port must be a number");
            }
        }

        config.port = port;
    }

    function checkAppDir () {
        var appDir = config.appDir;

        if (appDir === undefined) {
            log("App-directory not specified: using process.cwd() as your app-directory...");
            appDir = process.cwd();
        } else {
            appDir = path.normalize(appDir);
        }

        config.appDir = appDir;
    }

    function checkLogDir () {
        var logDir = config.logDir;

        if (logDir === undefined) {
            //no log here, because this is the common way
            logDir = config.appDir + "/logs";
        } else {
            logDir = path.normalize(logDir);
        }

        config.logDir = logDir;
    }

    function sanitize () {
        checkPort();
        checkAppDir();
        checkLogDir();
        return config;
    }

    return sanitize();
}

module.exports = sanitizeConfig;


