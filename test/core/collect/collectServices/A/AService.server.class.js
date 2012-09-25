"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class;

var ServiceA = new Class("ServiceA", {

    "init" : function () {
        //nothing to do here
    },
    "create" : function(model, callback) {
        callback();
    },
    "read" : function(model, callback) {
        callback(200, model.getData());
    },
    "update" : function(model, callback) {
        callback();
    },
    "delete" : function(model, callback) {
        callback();
    }
});

module.exports = ServiceA;


