"use strict";

var Class = require("alamid-class"),
    value = require("value"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    httpCrud = require("../../shared/helpers/httpCrud.js"),
    _ = require("underscore");

var Request = new Class("Request", {

    session : null,
    params : null,
    context : null,
    data : null,
    model : null,
    ids : null,

    _method : "",
    _rawPath : "",
    _path : "",

    _type : "",
    _transportType : "",
    _transport : null,

    /**
     * @construct
     * @param {string} method
     * @param {string} path
     * @param {Object} data
     */
    constructor : function (method, path, data) {

        this.ids = {};
        this.data = {};
        this.context = {};
        this.session = {};

        if (method !== undefined) {
            this.setMethod(method);
        }
        if (path !== undefined) {
            this.setPath(path);
        }

        if (data !== undefined) {
            this.data = data;
        }
    },
    /**
     * set method to create|read|update|destroy
     * @param method
     */
    setMethod : function (method) {
        //one of the allowed methods
        this._method = httpCrud.convertHTTPtoCRUD(method.toLowerCase());
    },
    /**
     * set request-path
     * @param {string} path
     */
    setPath : function (path) {

        var sanitizedPath = "",
            pathParts;

        //reset related attributes
        this.ids = {};
        this._rawPath = "";

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalizeToUnix,
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
        else if (pathHelpers.filters.onlyValidatorURL(path)) {
            this._type = "validator";
        }
        else {
            this._type = "unknown";
        }

        //check for IDs
        //remove ids from requests, and save them separately
        //we start with 1, because 0 = services or validators
        for (var i = 1; i < pathParts.length; i++) {
            if (i % 2 === 0) {
                this.ids[pathHelpers.modifiers.noTrailingSlash(sanitizedPath)] = pathParts[i];
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
    setTransport : function (transportType, transport) {
        this._transportType = transportType;
        this._transport = transport;
    },
    /**
     * returns the ID of the actual request
     * if you request /blogpost/1223/comment/12, it would return 12.
     * @return {String}
     */
    getId : function () {
        return this.ids[this.getPath()];
    },
    /**
     * set the id
     * @param id
     */
    setId : function (id) {
        this.ids[this.getPath()] = id;
    },
    /**
     * get the sanitized path
     * all ids are stripped and slashes are removed
     * @return {String}
     */
    getPath : function () {
        return this._path;
    },
    /**
     * returns the raw path, the request has been made with
     * @return {string}
     */
    getRawPath : function () {
        return this._rawPath;
    },
    /**
     * return the type of the request (ether service or validator)
     * @return {string}
     */
    getType : function () {
        return this._type;
    },
    /**
     * returns the method as CRUD create|read|update|destroy
     * use req.method if you need the HTTP-method (needed for middler)
     * @return {string}
     */
    getMethod : function () {
        return this._method;
    },
    /**
     * get the transport type (http/websockets)
     * @returns {string}
     */
    getTransportType : function () {
        return this._transportType;
    },
    /**
     * get the transport reference (http.request or socket)
     * @returns {Object}
     */
    getTransport : function () {
        return this._transport;
    }
});

/**
 * add magic setters/getters
 * this way we can be compatible with http.request
 * needed for use with middler
 *
 * @private
 */
Object.defineProperty(Request.prototype, "method", {
    get : function () {
        return httpCrud.convertCRUDtoHTTP(this._method).toUpperCase();
    },
    set : function (newMethod) {
        this.setMethod(httpCrud.convertHTTPtoCRUD(newMethod));
    },
    enumerable : true,
    configurable : true
});

Object.defineProperty(Request.prototype, "url", {
    get : function () {
        return "/" + this.getRawPath();
    },
    set : function (newPath) {
        this.setPath(newPath);
    },
    enumerable : true,
    configurable : true
});

module.exports = Request;