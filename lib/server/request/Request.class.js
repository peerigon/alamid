"use strict";

var Class = require("nodeclass").Class,
    pathUtils = require("path"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    _ = require("underscore");

var Request = new Class({

    "method" : "",
    "path" : "",
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

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalize,
            pathHelpers.modifiers.noTrailingSlash,
            pathHelpers.modifiers.noLeadingSlash
        ).on(path);

        this.path = path;

        //check for IDs
        var pathParts = path.split("/");

        //determine request-types
        if (pathHelpers.filters.onlyServiceURL(path)) {
            this.type = "service";
        }
        else if(pathHelpers.filters.onlyValidatorURL(path)) {
            this.type = "validator";
        }
        else {
            throw new Error("(alamid) Cannot find resource '" + path + "': Unknown type '" + pathParts[0] + "'");
        }

        for(var i = 1; i < pathParts.length; i++) {
            if(i % 2 === 0) {
                this.ids[pathParts[i-1]] = pathParts[i];
            }
        }

        //TODO: create request url here - remove ids from url!
    }
});

module.exports = Request;

