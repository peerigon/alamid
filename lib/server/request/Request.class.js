"use strict";

var Class = require("nodeclass").Class,
    pathUtils = require("path"),
    paths = require("../../helpers/paths.js"),
    _ = require("underscore");

var Request = new Class({

    "method" : "",
    "path" : "",
    "handlerPath" : "",
    "ids" : {},
    "data" : {},
    "type" : "",

    "__allowedMethods" : ["create", "read", "update", "delete"],

    "init" : function (method, path, data) {

        this.setMethod(method);
        this.setPath(path);
        this.data = data;
    },

    "setMethod" : function(method) {
        //one of the allowed methods
        method = method.toLowerCase();

        if(_.include(this.__allowedMethods, method)){
            this.method = method;
            return;
        }

        throw new Error("Unsupported Method: " + method);
    },

    "setPath" : function(path) {

        //reset ids
        this.ids = {};

        //normalize path to prevent ".." and "."
        path = pathUtils.normalize(path);

        //check traling at the beginning not end
        if(path.charAt(path.length-1) === "/"){
            path = path.substr(0, path.length-1);
        }

        //remove slash at the beginning
        if(path.charAt(0) === "/"){
            path = path.substr(1);
        }

        this.path = path;

        //check for IDs
        var pathParts = path.split("/");

        //determine request-types
        if(paths.filters.onlyServicesPath(path)) {
            this.type = "service";
        }
        else if(paths.filters.onlyValidatorsPath(path)) {
            this.type = "validator";
        }
        else {
            throw new Error("Unknown Service-Type: " + pathParts[0]);
        }

        for(var i = 1; i < pathParts.length; i++) {
            if(i % 2 === 0) {
                this.ids[pathParts[i-1]] = pathParts[i];
            }
        }
    }
});

module.exports = Request;

