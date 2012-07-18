"use strict";

var Class = require("nodeclass").Class;

var ServiceA = new Class({

    "init" : function () {
        //nothing to do here
    },
    "create" : function(model, callback) {
        callback({ status : "success", data : model});
    },
    "read" : function(model, callback) {
        callback({ status : "success", data : model});

    },
    "update" : function(model, callback) {
        callback({ status : "success", data : model});
    },
    "delete" : function(model, callback) {
        callback({ status : "success"} );
    }
});

module.exports = ServiceA;

