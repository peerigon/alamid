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

    __statusCode : null,
    __headers : null,
    __data : "",
    __status : "success",
    __errorMessage : "",

    /**
     * Reponse-class
     *  @construct
     */
    constructor : function () {
        this.__headers = {};
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

        if(this.__headers[protocol] === undefined) {
            this.__headers[protocol] = {};
        }
        this.__headers[protocol][headerKey] = headerValue;
    },
    /**
     * set Http Status-Code
     * @param {!Number} statusCode
     */
    setStatusCode : function(statusCode) {
        this.__statusCode = statusCode;
    },
    /**
     * set the status of the response to fail, error or success
     * @param {!String} status (success, fail or error)
     */
    setStatus : function(status) {
        if(status === "fail" || status === "error" || status === "success"){
            this.__status = status;
            return;
        }
        throw new Error("Invalid Status: " + status);
    },
    /**
     * set an error Message
     * @param {String} msg
     */
    setErrorMessage : function(msg) {
        this.__errorMessage = msg;
    },
    /**
     * bind data to the response
     * @param {!Object} data
     */
    setData : function(data) {
        if (value(data).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot set data: Data should be an object");
        }
        this.__data = data;
    },
    /**
     * retrieve the response-data as an Object
     * @return {Object}
     */
    getData : function() {
        return this.__data;
    },
    /**
     * retrieve the response-data as a JSON-string
     * @return {*}
     */
    getJSONData : function() {
        return JSON.stringify(this.__data);
    },
    /**
     * return the statusCode if set. if no statusCode was set, we derive it from the string-status
     * @return {Number}
     */
    getStatusCode : function() {

        if(this.__statusCode) {
            return this.__statusCode;
        }

        if(this.__status === "success") {
            return 200;
        }

        if(this.__status === "fail") {
            return 400;
        }

        if(this.__status === "error") {
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
        return this.__status;
    },
    /**
     * returns the Error-Messages
     * @return {String}
     */
    getErrorMessage : function() {
        return this.__errorMessage;
    },
    /**
     * returns all Headers as an object
     * @return {Object}
     */
    getHeaders : function() {
        return this.__headers;
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