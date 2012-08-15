"use strict";

var Class = require("nodeclass").Class;

var ServiceA = new Class({

    "init" : function () {
        //nothing to do here
    },
    create : function(ids, model, callback){
        callback({ "status" : "success" });
    },
    read : function(ids, callback){
        callback({ "status" : "success", data : { da : "ta" }});
    },
    readCollection : function(ids, params, callback){
        callback({ "status" : "success", "data" : { "readCollection" : true }});
    },
    update : function(ids, model, callback){
        callback({ status : "success", data : { da : "ta" }});
    },
    delete : function(ids, callback) {
        callback({ status : "success" });
    }
});

module.exports = ServiceA;

