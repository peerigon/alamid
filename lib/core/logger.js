"use strict"; // run code in ES5 strict mode

var winston = require("winston");

winston.loggers.add("core", {
    console: {
        colorize: "true",
        timestamp : "true"
    }
});