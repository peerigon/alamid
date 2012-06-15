"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class,
    is = nodeclass.is;

var Response = new Class({

    "statusCode" : null,
    "headers" : {},
    "data" : "",
    "result" : "",

    "init" : function () {
        //nothing to do here
    },
    "setHeader" : function(headerKey, headerValue) {
        this.headers[headerKey] = headerValue;
    },
    "setData" : function(data) {
        if(is(data).instanceOf(Object)) {
            this.data = JSON.stringify(data);
            return;
        }

        throw new Error("Data accepts only objects!");
    }
});

module.exports = Response;

