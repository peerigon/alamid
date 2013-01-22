"use strict";

var Class = require("alamid-class");

var Logger = new Class("Logger", {

    _facility : null,

    constructor : function(facility) {
        this._facility = facility;
        this.log = this.log.bind(this);
    },
    log : function(level, msg, metaData) {
        console.log("[" + this._facility + "] (" + level + ") " + msg, metaData);
    },
    info : function(msg, metaData) {
        this.log("info", msg, metaData);
    },
    warn : function(msg, metaData) {
        this.log("warn", msg, metaData);
    },
    error : function(msg, metaData) {
        this.log("error", msg, metaData);
    },
    debug : function(msg, metaData) {
        this.log("debug", msg, metaData);
    },
    verbose : function(msg, metaData) {
        this.log("verbose", msg, metaData);
    },
    silly : function(msg, metaData) {
        this.log("silly", msg, metaData);
    }
});

var loggers = {
    presentation : new Logger("presentation"),
    data : new Logger("data")
};

exports.get = function get (type) {
    return loggers[type] || new Logger("generic");
};