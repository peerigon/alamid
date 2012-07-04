"use strict"; // run code in ES5 strict mode

"use strict";

var Class = require("nodeclass").Class;

var ServiceA = new Class({

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


