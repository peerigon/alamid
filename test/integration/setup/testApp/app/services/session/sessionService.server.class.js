"use strict";

//the session data is processed by the middleware!

var sessionService = {
    read : function(model, callback) {
        callback({"status" : "success", data : model });

    },
    readCollection : function(model, callback) {
        callback({ "status": "success", data : model });
    }
};

module.exports = sessionService;