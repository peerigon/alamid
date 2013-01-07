"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class");

var ServiceD = new Class("ServiceD", {
    "create" : function(model, callback) {
        callback();
    },
    "read" : function(model, callback) {
        callback(200, model.getData());
    },
    "update" : function(model, callback) {
        callback();
    },
    "destroy" : function(model, callback) {
        callback();
    }
});

module.exports = ServiceD;

