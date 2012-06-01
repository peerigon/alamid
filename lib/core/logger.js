"use strict"; // run code in ES5 strict mode

//https://github.com/flatiron/winston
var winston = require("winston");

var config = require("./config/config.js");

//output all levels and messages to console
var developmentTransport = {
    console: {
        colorize: "true",
        timestamp : "true"
    }
};

if(config.mode === "development") {
    winston.loggers.add("core", developmentTransport);
    winston.loggers.add("build", developmentTransport);
    winston.loggers.add("server", developmentTransport);
}
//staging & production
else {

    winston.loggers.add("core", {
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

    winston.loggers.add("build", {
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

    winston.loggers.add("server", {
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