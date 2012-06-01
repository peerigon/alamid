"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    path = require("path");

function ConfigSanitizer(config) {
    var self = this;

    this.logger = console.log;

    this.port = function () {
        var port = config.port;

        if (_(port).isNumber() === false) {
            port = Number(port);    // cast to Number
            if (isNaN(port)) {
                self.logger("Error with your config: port must be a number");
                return;
            }
        }

        config.port = port;
    };

    this.appDir = function () {
        var appDir = config.appDir;

        if (appDir === undefined) {
            self.logger("App-directory not specified: using process.cwd() as your app-directory...");
            appDir = process.cwd();
        } else {
            appDir = path.normalize(appDir);
        }

        config.appDir = appDir;

        return appDir;
    };

    this.logDir = function () {
        var logDir = config.logDir;

        if (logDir === undefined) {
            logDir = config.appDir + "/logs";
        } else {
            logDir = path.normalize(logDir);
        }

        return logDir;
    };
}

module.exports = ConfigSanitizer;