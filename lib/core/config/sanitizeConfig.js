"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    path = require("path"),
    paths = require("../../shared/helpers/paths");


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
        config.paths = paths.getPaths(appDir);
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

        config.logDir = logDir;
    }

    function addModeShortcuts () {
        if(config.mode === "development") {
            config.isDev = true;
        }
    }

    function sanitize () {
        checkPort();
        checkAppDir();
        checkLogDir();
        addModeShortcuts();

        delete config.type;     // deleting strange ghost-property "type": "literal"

        return config;
    }

    return sanitize();
}

sanitizeConfig.log = console.log;   // expose log-property so the logging behaviour can be changed externally

module.exports = sanitizeConfig;


