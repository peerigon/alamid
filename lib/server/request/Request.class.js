"use strict";

var Class = require("nodeclass").Class,
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    _ = require("underscore");

var Request = new Class({

    session : "",
    __method : "",
    __rawPath : "",
    __path : "",
    __ids : {},
    __data : {},
    __model : null,
    __type : "",
    __allowedMethods : ["create", "read", "update", "delete"],
    __transportType : "",
    __originatedRequest : null,

    /**
     * @construct
     * @param {String} method
     * @param {String} path
     * @param {Object} data
     */
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
    /**
     * set method to create|read|update|delete
     * @param method
     */
    setMethod : function(method) {
        //one of the allowed methods
        method = method.toLowerCase();

        if(_.include(this.__allowedMethods, method)){
            this.__method = method;
            return;
        }

        throw new Error("(alamid) Unsupported Method: " + method);
    },
    /**
     * attach data
     * @param {!Object} data
     */
    setData : function(data) {
        this.__data = data;
    },
    /**
     * attach model, accepts only objects and functions
     * @param {Object} model
     */
    setModel : function(model) {
        if(_.isObject(model)) {
            this.__model = model;
            return;
        }
        throw new Error("(alamid) setModel only accepts objects.");
    },
    /**
     * set request-path
     * @param {String} path
     */
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
                this.__ids[pathHelpers.modifiers.noTrailingSlash(sanitizedPath)] = pathParts[i];
            }
            else {
                sanitizedPath += pathParts[i] + "/";
            }
        }

        sanitizedPath = pathHelpers.modifiers.noTrailingSlash(sanitizedPath);
        sanitizedPath = sanitizedPath.toLowerCase();
        this.__path = sanitizedPath;
    },
    /**
     * stores a reference to the original-transport
     * @param {String} originatedRequestType
     * @param {Object} originatedRequest
     */
    setOriginatedRequest : function(originatedRequestType, originatedRequest) {
        this.__transportType = originatedRequestType;
        this.__originatedRequest = originatedRequest;
    },
    /**
     * returns the ID of the actual request
     * if you request /blogpost/1223/comment/12, it would return 12.
     * @return {String}
     */
    getId : function(){
        return this.__ids[this.getPath()];
    },
    /**
     * returns all ids, passed to the request as object
     * keys are the names and values are ids
     * @return {Object}
     */
    getIds : function() {
        return this.__ids;
    },
    /**
     * return a model if it has been attached
     * @return {*}
     */
    getModel : function() {
        return this.__model;
    },
    /**
     * get the sanitized path
     * all ids are stripped and slashes are removed
     * @return {String}
     */
    getPath : function() {
        return this.__path;
    },
    /**
     * returns the raw path, the request has been made with
     * @return {String}
     */
    getRawPath : function() {
        return this.__rawPath;
    },
    /**
     * return the type of the request (ether service or validator)
     * @return {String}
     */
    getType : function() {
        return this.__type;
    },
    /**
     * return request-data as an object
     * @return {Object}
     */
    getData : function() {
        return this.__data;
    },
    /**
     * returns the method create|read|update|delete
     * @return {String}
     */
    getMethod : function() {
        return this.__method;
    },
    getTransportType : function() {
        return this.__transportType;
    },
    getOriginatedRequest : function() {
        return this.__originatedRequest;
    }
});

module.exports = Request;

