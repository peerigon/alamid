"use strict"; // run code in ES5 strict mode

//https://github.com/flatiron/winston
var winston = require("winston"),
    config = require("../shared/config"),
    env = require("../shared/env.js");

//output all levels and messages to console
var developmentTransport = {
        console: {
            colorize: true
        }
    },
//no output for automated tests
    testingTransport = {
        console: {
            silent : true
        }
    },
    loggers = winston.loggers;

function getProductionConfig(logFile) {
    return {
        console : {
            colorize: true,
            timestamp : true,
            level : "warn"
        },
        file: {
            filename : logFile
        }
    };
}

if (env.isDevelopment()) {
    loggers.add("core", developmentTransport);
    loggers.add("data", developmentTransport);
    loggers.add("server", developmentTransport);
}
else if(env.isTesting()) {
    loggers.add("core", testingTransport);
    loggers.add("data", testingTransport);
    loggers.add("server", testingTransport);
}
//staging & production
else {
    loggers.add("core", getProductionConfig(config.logDir + "/core.log"));
    loggers.add("data", getProductionConfig(config.logDir + "/data.log"));
    loggers.add("server", getProductionConfig(config.logDir + "/server.log"));
    winston.handleExceptions(new winston.transports.Console);
    winston.handleExceptions(new winston.transports.File({ filename: config.logDir + "/exceptions.log" }));
}

module.exports = winston.loggers;