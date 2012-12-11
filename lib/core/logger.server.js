"use strict"; // run code in ES5 strict mode

//https://github.com/flatiron/winston
var winston = require("winston"),
    config = require("./config/config.js");

//output all levels and messages to console
var developmentTransport = {
        console: {
            colorize: "true"
        }
    },
    testingTransport = {
        console: {
            silent : "true"
        }
    },
    loggers = winston.loggers;

if (config.mode === "development") {
    loggers.add("core", developmentTransport);
    loggers.add("bundle", developmentTransport);
    loggers.add("server", developmentTransport);
}
else if(config.mode === "testing") {
    loggers.add("core", testingTransport);
    loggers.add("bundle", testingTransport);
    loggers.add("server", testingTransport);
}
//staging & production
else {
    loggers.add("core", {
        file: {
            colorize: "true",
            filename : config.logDir + "/core.log",
            level : "info"
        },
        console : {
            colorize: "true",
            timestamp : "true",
            level : "warn"
        }
    });

    loggers.add("bundle", {
        file: {
            colorize: "true",
            filename : config.logDir + "/bundle.log",
            level : "info"
        },
        console : {
            colorize: "true",
            timestamp : "true",
            level : "warn"
        }
    });

    loggers.add("server", {
        file: {
            colorize: "true",
            filename : config.logDir + "/server.log",
            level : "info"
        },
        console : {
            colorize: "true",
            timestamp : "true",
            level : "warn"
        }
    });
}

module.exports = winston.loggers;