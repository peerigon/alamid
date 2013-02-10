"use strict";

var jQuery = require("./jQuery.js");

/**
 * Provides methods for working with DOM-Nodes.
 *
 * @type {Object}
 */
var nodeMethods = {

    $node: null,

    /**
     * Find all nodes by given selector.
     *
     * @param {string} selector
     * @return {jQuery}
     */
    find: function (selector) {

        var $elements = this.$node.find(selector);
        //Check if parent element matches given selector ...
        if( this.$node.is(selector) ) {
            //... and it to the jQuery-Collection-Object
            $elements = $elements.add(this.$node);
        }

        return $elements;

    },

    /**
     * You can pass either an event as string and a function as listener or an event-map as object.
     * @see http://api.jquery.com/on/
     *
     * @param {string|object} events ("click", "blur", etc.| events-map {"click": function, "blur": function})
     * @param {function} listener
     */
    on: function (events, listener) {

        if (typeof events === "string") {
            this.$node.on(events, listener);
        }

        if (typeof events === "objects") {
            //events is an events-map
            this.$node.on(event);
        }

    },

    /**
     * You can pass either an event as string and a function as listener or an event-map as object.
     * @see http://api.jquery.com/on/
     *
     * @param {string|object} events ("click", "blur", etc.| events-map {"click": function, "blur": function})
     * @param {function} listener
     */
    once: function (events, listener) {
        if (typeof events === "string") {
            this.$node.one(events, listener);
        }

        if (typeof events === "objects") {
            //events is an events-map
            this.$node.one(event);
        }
    },

    /**
     * You can pass either an event as string and a function as listener or an event-map as object.
     * @see http://api.jquery.com/off/
     *
     * @param {string|Object} events ("click", "blur", etc.| events-map {"click": function, "blur": function})
     * @param {function} listener
     */
    off: function (events, listener) {
        this.$node.off(events, listener);
    },

    /**
     * @param {string} className
     * @return {jQuery}
     */
    addClass: function (className) {
        return this.$node.addClass(className);
    },

    /**
     * @param {string} className
     * @return {jQuery}
     */
    removeClass: function(className) {
        return this.$node.removeClass(className);
    },

    /**
     * @param {string} className
     * @return {Boolean}
     */
    hasClass: function (className) {
        return this.$node.hasClass(className);
    },

    /**
     * Returns an jQuery-Object with references to all detached nodes.
     * NOTE: Listeners of detached nodes are still attached after detach().
     *
     * @return {jQuery}
     */
    detach: function () {
        return this.$node.detach();
    },

    /**
     * Returns an jQuery-Object with references to all disposed nodes.
     * NOTE: Listeners of disposed nodes are detached after dispose().
     * @see http://api.jquery.com/remove/
     *
     * @return {jQuery}
     */
    dispose: function () {
        return this.$node.remove();
    }
};

function domAdapter(node) {

    var $node;

    if (!(node instanceof jQuery)) {
        node = jQuery(node);
    }

    $node = node;

    nodeMethods.$node = $node;

    return nodeMethods;
}

/**
 * Translates an
 *
 * @see http://api.jquery.com/jQuery.param/
 * @param obj
 * @return {string}
 */
domAdapter.stringifyQuery = function (obj) {
    return encodeURIComponent(jQuery.param(obj))
        .replace(/\!/g, "%21")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");
};

/**
 * Translates an encoded query-string into an object
 *
 * @param {string} querystring
 * @return {Object}
 */
domAdapter.parseQuery = function (querystring) {
    querystring = decodeURIComponent(querystring)
        .replace(/\%21/g, "!")
        .replace(/\%27/g, "'")
        .replace(/\%28/g, "(")
        .replace(/\%29/g, ")")
        .replace(/\%2A/g, "*");

    var queryObject = {},
        pair,
        key, value,
        arr = querystring.split('&'),
        i, l;

    for (i = 0, l = arr.length; i < l; i++) {
        pair = arr[i];
        if (pair === '') {
            continue;
        }
        pair = pair.split('=');
        if (pair.length === 1) {
            key = pair;
            value = '';
        } else {
            key = (pair[0]);
            value = (pair[1]);
        }
        queryObject[key] = value;
    }

    return queryObject;
};

/**
 * @see http://api.jquery.com/jQuery.ajax/
 *
 * @param {string} method (get|post|put|delete)
 * @param {string} url
 * @param {!Object} data
 * @param {function(error, success)} callback
 * @return {jQuery.Deferred}
 */
domAdapter.request = function (method, url, data, callback) {

    var reqConfig = {
        type: method,
        url: url,
        data : JSON.stringify(data),
        dataType: "json",
        //headers: {},
        //crossDomain: true,
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            callback(null, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            callback(new Error(textStatus + " '" + errorThrown + "'"), null);
        }
    };

    if(method === "get") {
        //get has no body and therefor no content type
        delete reqConfig.contentType;
    }

    return jQuery.ajax(reqConfig);
};

/**
 * @param {object} obj
 * @return {string}
 */
domAdapter.stringifyJSON = function (obj) {
    return JSON.stringify(obj);
};

/**
 * @param {string} string
 * @return {Object}
 */
domAdapter.parseJSON = function (string) {
    return jQuery.parseJSON(string);
};

module.exports = domAdapter;