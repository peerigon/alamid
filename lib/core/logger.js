"use strict"; // run code in ES5 strict mode

//https://github.com/flatiron/winston
var winston = require("winston"),
    config = require("./config/config.js");

//output all levels and messages to console
var developmentTransport = {
        console: {
            colorize: "true",
            timestamp : "true"
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
    loggers.add("build", developmentTransport);
    loggers.add("server", developmentTransport);
}
else if(config.mode === "testing") {
    loggers.add("core", testingTransport);
    loggers.add("build", testingTransport);
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

    loggers.add("build", {
        file: {
            colorize: "true",
            filename : config.logDir + "/build.log",
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

loggers.get("core").info("Logger initialized");

module.exports = winston.loggers;