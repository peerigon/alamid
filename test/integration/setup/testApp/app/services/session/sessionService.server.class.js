"use strict";

var sessionService = {

    read : function(model, callback) {
        callback({"status" : "success" });

    },
    readCollection : function(model, callback) {
        callback({ "status": "success" });
    }
};

module.exports = sessionService;