"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    resolvePaths = require("../../shared/helpers/resolvePaths");

/**
 * sanitize given configuration-object and set default values
 * @param {!Object} config
 */
function sanitizeConfig(config) {

    var log = sanitizeConfig.log;

    function checkPort () {
        var port = config.port;

        if (_(port).isNumber() === false) {
            port = Number(port);    // cast to Number, null becomes 0!
            if (isNaN(port) || port === 0) {
                throw new Error("config: port must be a number");
            }
        }

        config.port = port;
    }

    function checkAppDir () {
        var appDir = config.appDir;

        if (appDir === undefined || appDir === null) {
            log("app-directory not specified. Using process.cwd() as your app-directory...");
            appDir = process.cwd();
        } else {
            appDir = path.normalize(appDir);
        }

        //append paths
        config.paths = resolvePaths.getAppPaths(appDir);
        config.appDir = appDir;
    }

    function checkLogDir () {
        var logDir = config.logDir;

        if (logDir === undefined || logDir === null) {
            //no log here, because this is the common way
            logDir = config.appDir + "/logs";
        } else {
            logDir = path.normalize(logDir);
        }

        // Create log dir if it doesn't exist
        if (fs.existsSync(logDir) === false) {
            fs.mkdirSync(logDir);
        }

        config.logDir = logDir;
    }

    function addModeShortcuts () {
        if(config.mode === "development" || config.mode === "testing") {
            config.isDev = true;
        }
    }

    function sanitize () {
        checkPort();
        checkAppDir();
        checkLogDir();
        addModeShortcuts();

        //type was only needed for nconf
        delete config.type;

        return config;
    }

    return sanitize();
}

sanitizeConfig.log = console.log;   // expose log-property so the logging behaviour can be changed externally

module.exports = sanitizeConfig;