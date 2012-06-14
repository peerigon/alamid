"use strict";

var Class = require("nodeclass").Class;

var Response = new Class({

    "statusCode" : null,
    "headers" : {},
    "data" : Object,
    "result" : "",

    "init" : function () {
        //nothing to do here
    },
    "setHeader" : function(headerKey, headerValue) {
        this.headers[headerKey] = headerValue;
    }
});

module.exports = Response;

