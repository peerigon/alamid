"use strict";

var value = require("value"),
    EventEmitter = require("../../shared/EventEmitter.class.js");

/**
 * Response
 * @extends EventEmitter
 * @type {Class}
 */
var Response = EventEmitter.extend("Response", {

    /**
     * @event
     * @name Response#end
     */

    _statusCode : null,
    _headers : null,
    _data : "",
    _status : "success",
    _errorMessage : "",

    /**
     * Reponse-class
     *  @construct
     */
    constructor : function () {
        this._headers = {};
    },
    /**
     * setHeader with headerKey, headerValue and optional protocol, defaults to (http)
     * @param {!String} headerKey
     * @param {!String} headerValue
     * @param {String} protocol (http or spdy)
     */
    setHeader : function(headerKey, headerValue, protocol) {
        if(protocol === undefined && (protocol !== "http" || protocol !== "spdy")) {
            protocol = "http";
        }

        if(this._headers[protocol] === undefined) {
            this._headers[protocol] = {};
        }
        this._headers[protocol][headerKey] = headerValue;
    },
    /**
     * set Http Status-Code
     * @param {!Number} statusCode
     */
    setStatusCode : function(statusCode) {
        this._statusCode = statusCode;
    },
    /**
     * set the status of the response to fail, error or success
     * @param {!String} status (success, fail or error)
     */
    setStatus : function(status) {
        if(status === "fail" || status === "error" || status === "success"){
            this._status = status;
            return;
        }
        throw new Error("Invalid Status: " + status);
    },
    /**
     * set an error Message
     * @param {String} msg
     */
    setErrorMessage : function(msg) {
        this._errorMessage = msg;
    },
    /**
     * bind data to the response
     * @param {!Object} data
     */
    setData : function(data) {
        if (value(data).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot set data: Data should be an object");
        }
        this._data = data;
    },
    /**
     * retrieve the response-data as an Object
     * @return {Object}
     */
    getData : function() {
        return this._data;
    },
    /**
     * retrieve the response-data as a JSON-string
     * @return {*}
     */
    getJSONData : function() {
        return JSON.stringify(this._data);
    },
    /**
     * return the statusCode if set. if no statusCode was set, we derive it from the string-status
     * @return {Number}
     */
    getStatusCode : function() {

        if(this._statusCode) {
            return this._statusCode;
        }

        if(this._status === "success") {
            return 200;
        }

        if(this._status === "fail") {
            return 400;
        }

        if(this._status === "error") {
            return 500;
        }

        //return 200 as a default
        return 200;
    },
    /**
     * return the status as a String
     * @return {String}
     */
    getStatus : function() {
        return this._status;
    },
    /**
     * returns the Error-Messages
     * @return {String}
     */
    getErrorMessage : function() {
        return this._errorMessage;
    },
    /**
     * returns all Headers as an object
     * @return {Object}
     */
    getHeaders : function() {
        return this._headers;
    },
    /**
     *
     * ends the response
     * @param {!Object} resObj an optional JSend Response
     */
    end : function(resObj) {

        //optional
        //could also be set via setter
        if(resObj) {
            //setting data
            this.setData(resObj.data || {});
            this.setStatus(resObj.status || "error");
            this.setErrorMessage(resObj.message || "");
        }

        this.emit("end", null);
    },
    /**
     * returns an object following the jSend-spec
     * http://labs.omniti.com/labs/jsend
     * @return {Object}
     */
    getResBody : function() {

        var resObj = {};

        //we set a status in any case
        resObj.status = this.getStatus();

        //if res is not in jSend-spec-style
        if(resObj.status === "") {
            return this.getData();
        }

        if(resObj.status === "success") {
            resObj.data = this.getData();

            return resObj;
        }

        if(resObj.status === "fail") {
            resObj.data = this.getData();
            resObj.message = this.getErrorMessage() || "";

            return resObj;
        }

        if(resObj.status === "error") {
            resObj.data = this.getData();
            resObj.message = this.getErrorMessage() || "";
            return resObj;
        }

        throw new Error("(alamid) Response-Error: Invalid Response-Object.");
    }
});

module.exports = Response;