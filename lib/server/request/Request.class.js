"use strict";

var Class = require("nodeclass").Class,
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    _ = require("underscore");

var Request = new Class({

    "__method" : "",
    "__rawPath" : "",
    "__path" : "",
    "__ids" : {},
    "__data" : {},
    "__model" : undefined,
    "__type" : "",
    "__allowedMethods" : ["create", "read", "update", "delete"],

    init : function (method, path, data) {

        if(method !== undefined) {
            this.setMethod(method);
        }
        if(path !== undefined) {
            this.setPath(path);
        }

        if(data !== undefined) {
            this.setData(data);
        }
    },

    setMethod : function(method) {
        //one of the allowed methods
        method = method.toLowerCase();

        if(_.include(this.__allowedMethods, method)){
            this.__method = method;
            return;
        }

        throw new Error("(alamid) Unsupported Method: " + method);
    },
    setData : function(data) {
        this.__data = data;
    },
    setModel : function(model) {
        if(_.isObject(model)) {
            this.__model = model;
            return;
        }
        throw new Error("(alamid) setModel only accepts objects.");
    },
    setPath : function(path) {

        var sanitizedPath = "",
            pathParts;

        //reset related attributes
        this.__ids = {};
        this.__rawPath = "";

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalize,
            pathHelpers.modifiers.noTrailingSlash,
            pathHelpers.modifiers.noLeadingSlash
        ).on(path);

        //after sanitization
        pathParts = path.split("/");

        //save the sanitized original request path
        this.__rawPath = path;

        //determine request-types
        if (pathHelpers.filters.onlyServiceURL(path)) {
            this.__type = "service";
        }
        else if(pathHelpers.filters.onlyValidatorURL(path)) {
            this.__type = "validator";
        }
        else {
            throw new Error("(alamid) Cannot find resource '" + path + "': Unknown type '" + pathParts[0] + "'");
        }

        //check for IDs
        //remove ids from requests, and save them separately
        //we start with 1, because 0 = services or validators
        for(var i = 1; i < pathParts.length; i++) {
            if(i % 2 === 0) {
                this.__ids[pathParts[i-1]] = pathParts[i];
            }
            else {
                sanitizedPath += pathParts[i] + "/";
            }
        }

        sanitizedPath = pathHelpers.modifiers.noTrailingSlash(sanitizedPath);
        this.__path = sanitizedPath;
    },
    getIds : function() {
        return this.__ids;
    },
    getModel : function() {
        return this.__model;
    },
    getPath : function() {
        return this.__path;
    },
    getRawPath : function() {
        return this.__rawPath;
    },
    getType : function() {
        return this.__type;
    },
    getData : function() {
        return this.__data;
    },
    getMethod : function() {
        return this.__method;
    }
});

module.exports = Request;

