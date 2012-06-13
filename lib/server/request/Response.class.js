"use strict";

var Class = require("nodeclass").Class;

var Response = new Class({

    "method" : String,
    "path" : String,
    "data" : Object,

    "init" : function (method, path, data) {

        this.method = method;
        this.path = path;
        this.data = data;
    }

});

module.exports = Response;

