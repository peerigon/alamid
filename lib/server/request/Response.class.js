"use strict";

var value = require("value"),
    _ = require("underscore"),
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

    _statusCode:  null,
    _headers:     null,
    _data:        "",
    _status:      "success",
    _errorMessage:"",
    _statusCodes: {
        success:200,
        fail:   400,
        error:  500
    },

    /**
     *  @construct
     */
    constructor:    function () {
        this._headers = {};
    },
    /**
     * setHeader with headerKey, headerValue and optional protocol, defaults to (http)
     * @param {!String} headerKey
     * @param {!String} headerValue
     */
    setHeader:      function (headerKey, headerValue) {
        this._headers[headerKey] = headerValue;
        return this;
    },
    /**
     * set Http Status-Code
     * @param {!Number} statusCode
     */
    setStatusCode:  function (statusCode) {
        this._statusCode = statusCode;
        return this;
    },
    /**
     * set the status of the response to fail, error or success
     * @param {!String} status (success, fail or error)
     */
    setStatus:      function (status) {

        if (_(Object.keys(this._statusCodes)).contains(status)) {
            this._status = status;
            return this;
        }

        throw new Error("Invalid Status: " + status);
    },
    /**
     * set an error Message
     * @param {String} msg
     */
    setErrorMessage:function (msg) {
        this._errorMessage = msg;
    },
    /**
     * bind data to the response
     * @param {!Object|Array} data
     */
    setData:        function (data) {

        if (value(data).notTypeOf(Object) && value(data).notTypeOf(Array)) {
            throw new TypeError("(alamid) Cannot set data: Data only accepts objects and arrays");
        }

        this._data = data;
        return this;
    },
    /**
     * retrieve the response-data as an Object
     * @return {Object}
     */
    getData:        function () {
        return this._data;
    },
    /**
     * retrieve the response-data as a JSON-string
     * @return {*}
     */
    getJSONData:    function () {
        return JSON.stringify(this._data);
    },
    /**
     * return the statusCode if set. if no statusCode was set, we derive it from the string-status
     * @return {Number}
     */
    getStatusCode:  function () {

        if (this._statusCode) {
            return this._statusCode;
        }

        if (this._statusCodes[this._status] !== undefined) {
            return this._statusCodes[this._status];
        }

        //return 200 as a default
        return 200;
    },
    /**
     * return the status as a String
     * @return {String}
     */
    getStatus:      function () {
        return this._status;
    },
    /**
     * returns the Error-Messages
     * @return {String}
     */
    getErrorMessage:function () {
        return this._errorMessage;
    },
    /**
     * returns all Headers as an object
     * @return {Object}
     */
    getHeaders:     function () {
        return this._headers;
    },
    /**
     *
     * ends the response
     * @param {Object} resObj an optional JSend Response
     */
    end:            function (resObj) {

        //could also be set via setter
        if (resObj) {
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
    toJSendBody:    function () {

        var resObj = {};

        //we set a status in any case
        resObj.status = this.getStatus();
        resObj.data = this.getData();

        //we append the error message for "fail" & "error"
        if (resObj.status === "fail" || resObj.status === "error") {
            resObj.message = this.getErrorMessage() || "";
        }

        return resObj;
    }
});

module.exports = Response;