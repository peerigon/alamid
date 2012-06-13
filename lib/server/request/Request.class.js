"use strict";

var Class = require("nodeclass").Class,
    pathUtils = require("path"),
    _ = require("underscore");

var Request = new Class({

    "method" : "",
    "path" : "",
    "data" : {},

    "__allowedMethods" : ["GET", "POST", "PUT", "DELETE"],

    "init" : function (method, path, data) {

        this.setMethod(method);
        this.setPath(path);
        this.data = data;
    },

    "setMethod" : function(method) {
        //one of the allowed methods
        method = method.toUpperCase();

        if(_.include(this.__allowedMethods, method)){
            this.method = method;
            return;
        }

        throw new Error("Unsupported Method: " + method);
        //return false;
    },

    "setPath" : function(path) {

        //normalize path to prevent ".." and "."
        path = pathUtils.normalize(path);

        //check traling at the beginning not end
        if(path.charAt(path.length-1) === "/"){
            path = path.substr(0, path.length-1);
        }

        this.path = path;
    }
});

module.exports = Request;

