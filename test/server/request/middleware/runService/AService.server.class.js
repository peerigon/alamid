"use strict";

var Service = require("../../../../../lib/shared/Service.class.js");

var ServiceA = Service.extend("ServiceA", {
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
    destroy : function(ids, callback) {
        callback({ status : "success" });
    }
});

module.exports = ServiceA;

