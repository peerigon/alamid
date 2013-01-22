"use strict";

var Class = require("alamid-class");

var Logger = new Class("Logger", {

    _facility : null,

    constructor : function(facility) {
        this._facility = facility;
    },
    log : function(level, color, msg, metaData) {

        if (level === "error") {
            console.error("%c [" + this._facility + "] " + level + ": ", color, msg, metaData);
        }
        else if (level === "warn" ) {
            console.warn("%c [" + this._facility + "] " + level + ": ", color, msg, metaData);
        }
        else {
            console.log("%c [" + this._facility + "] " + level + ": ", color, msg, metaData);
        }
    },
    info : function(msg, metaData) {
        this.log("info", "color:green;", msg, metaData);
    },
    warn : function(msg, metaData) {
        this.log("warn", "color:red;", msg, metaData);
    },
    error : function(msg, metaData) {
        this.log("error", "color:red;",  msg, metaData);
    },
    debug : function(msg, metaData) {
        this.log("debug", "color:blue;", msg, metaData);
    },
    verbose : function(msg, metaData) {
        this.log("verbose", "color:blue;", msg, metaData);
    },
    silly : function(msg, metaData) {
        this.log("silly", "color:magenta;", msg, metaData);
    }
});

var loggers = {
    presentation : new Logger("presentation"),
    data : new Logger("data")
};

exports.get = function get (type) {
    return loggers[type] || new Logger("generic");
};