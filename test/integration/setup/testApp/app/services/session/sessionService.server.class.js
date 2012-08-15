"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class;

//the session data is processed by the middleware!

var SessionService = new Class({
    read : function(ids, callback) {
        callback({"status" : "success", "model" : ids });
    },
    readCollection : function(ids, params, callback) {
        callback({ status : "success", data : { sessionCount : ids[0] } });
    },
    update : function(ids, model, callback) {
        callback({"status" : "success", data : ids });
    }
});

module.exports = SessionService;