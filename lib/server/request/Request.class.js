"use strict";

var Class = require("alamid-class"),
    value = require("value"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    httpCrud = require("../../shared/helpers/httpCrud.js"),
    _ = require("underscore");

var allowedMethods = ["create", "read", "update", "destroy"];

var Request = new Class("Request", {

    session : "",
    params : null,
    _method : "",
    _rawPath : "",
    _path : "",
    _ids : null,
    _data : null,
    _model : null,
    _type : "",
    _transportType : "",
    _transport : null,

    /**
     * @construct
     * @param {String} method
     * @param {String} path
     * @param {Object} data
     */
    constructor : function (method, path, data) {

        this._ids = {};
        this._data = {};

        if(method !== undefined) {
            this.setMethod(method);
        }
        if(path !== undefined) {
            this.setPath(path);
        }

        if(data !== undefined) {
            this.setData(data);
        }

        this._addSetters();
    },
    /**
     * add magic setters/getters
     * this way we can be compatible with http.request
     * need for use with middler
     *
     * @private
     */
    _addSetters : function() {
        var self = this;

        Object.defineProperty(this, "method", {
            get : function(){
                return httpCrud.convertCRUDtoHTTP(self.getMethod()).toUpperCase();
            },
            set : function(newMethod){
                self.setMethod(httpCrud.convertHTTPtoCRUD(newMethod));
            },
            enumerable : true,
            configurable : true
        });

        Object.defineProperty(this, "path", {
            get : function(){
                return "/" + self.getRawPath();
            },
            set : function(newPath){
                self.setPath(newPath);
            },
            enumerable : true,
            configurable : true
        });

        Object.defineProperty(this, "url", {
            get : function(){
                return "/" + self.getRawPath();
            },
            set : function(newPath){
                self.setPath(newPath);
            },
            enumerable : true,
            configurable : true
        });
    },
    /**
     * set method to create|read|update|destroy
     * @param method
     */
    setMethod : function(method) {
        //one of the allowed methods
        method = method.toLowerCase();

        if(_.include(allowedMethods, method)){
            this._method = method;
            return;
        }

        throw new Error("(alamid) Unsupported Method: " + method);
    },
    /**
     * attach data
     * @param {!Object} data
     */
    setData : function(data) {
        this._data = data;
    },
    /**
     * attach model, accepts only objects and functions
     * @param {Object} model
     */
    setModel : function(model) {
        if (value(model).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot set model: The model must be an object");
        }
        this._model = model;
    },
    /**
     * set request-path
     * @param {String} path
     */
    setPath : function(path) {

        var sanitizedPath = "",
            pathParts;

        //reset related attributes
        this._ids = {};
        this._rawPath = "";

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalize,
            pathHelpers.modifiers.noTrailingSlash,
            pathHelpers.modifiers.noLeadingSlash
        ).on(path);

        //after sanitization
        pathParts = path.split("/");

        //save the sanitized original request path
        this._rawPath = path;

        //determine request-types
        if (pathHelpers.filters.onlyServiceURL(path)) {
            this._type = "service";
        }
        else if(pathHelpers.filters.onlyValidatorURL(path)) {
            this._type = "validator";
        }
        else {
            this._type = "unknown";
        }

        //check for IDs
        //remove ids from requests, and save them separately
        //we start with 1, because 0 = services or validators
        for(var i = 1; i < pathParts.length; i++) {
            if(i % 2 === 0) {
                this._ids[pathHelpers.modifiers.noTrailingSlash(sanitizedPath)] = pathParts[i];
            }
            else {
                sanitizedPath += pathParts[i] + "/";
            }
        }

        sanitizedPath = pathHelpers.modifiers.noTrailingSlash(sanitizedPath);
        sanitizedPath = sanitizedPath.toLowerCase();
        this._path = sanitizedPath;
    },
    /**
     * stores a reference to the original-transport
     * @param {String} transportType
     * @param {Object} transport
     */
    setTransport : function(transportType, transport) {
        this._transportType = transportType;
        this._transport = transport;
    },
    /**
     * returns the ID of the actual request
     * if you request /blogpost/1223/comment/12, it would return 12.
     * @return {String}
     */
    getId : function(){
        return this._ids[this.getPath()];
    },
    setId : function(id) {
        this._ids[this.getPath()] = id;
    },
    /**
     * returns all ids, passed to the request as object
     * keys are the names and values are ids
     * @return {Object}
     */
    getIds : function() {
        return this._ids;
    },
    setIds : function(ids) {
        this._ids = ids;
    },
    setSession: function (session) {
        this.session = session;
    },
    /**
     * return a model if it has been attached
     * @return {*}
     */
    getModel : function() {
        return this._model;
    },
    /**
     * get the sanitized path
     * all ids are stripped and slashes are removed
     * @return {String}
     */
    getPath : function() {
        return this._path;
    },
    /**
     * returns the raw path, the request has been made with
     * @return {String}
     */
    getRawPath : function() {
        return this._rawPath;
    },
    /**
     * return the type of the request (ether service or validator)
     * @return {String}
     */
    getType : function() {
        return this._type;
    },
    /**
     * return request-data as an object
     * @return {Object}
     */
    getData : function() {
        return this._data;
    },
    getParams : function() {
        return this.params;
    },
    /**
     * returns the method create|read|update|destroy
     * @return {String}
     */
    getMethod : function() {
        return this._method;
    },
    getTransportType : function() {
        return this._transportType;
    },
    getTransport : function() {
        return this._transport;
    },
    getSession: function () {
        return this.session;
    }
});

module.exports = Request;