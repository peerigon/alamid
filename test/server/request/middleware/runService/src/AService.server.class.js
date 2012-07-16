"use strict";

var Class = require("nodeclass").Class;

var ServiceA = new Class({

    "init" : function () {
        //nothing to do here
    },
    "create" : function(model, req, res, callback) {
        callback();
    },
    "read" : function(model, req, res, callback) {
        callback({ status : "success", data : model});

    },
    "update" : function(model, req, res, callback) {
        callback({ status : "success", data : model});
    },
    "delete" : function(model, req, res, callback) {
        callback();
    }
});

module.exports = ServiceA;

