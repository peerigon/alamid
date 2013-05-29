"use strict";

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
     * @see http://api.jquery.com/on/
     *
     * @param {String} events
     * @param {function} listener
     */
    on: function (events, listener) {
        this.$node.on(events, listener);
    },

    /**
     * @see http://api.jquery.com/off/
     *
     * @param {String} events
     * @param {function} listener
     */
    off: function (events, listener) {
        this.$node.off(events, listener);
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
    }
};

function domAdapter(node) {
    if (node instanceof domAdapter.$ === false) {
        node = domAdapter.$(node);
    }
    nodeMethods.$node = node;

    return nodeMethods;
}

/**
 * @type {jQuery}
 */
domAdapter.$ = window.jQuery ? window.jQuery : null;

/**
 * @see http://api.jquery.com/jQuery.ajax/
 *
 * @param {string} method (get|post|put|delete)
 * @param {string} url
 * @param {!Object} data
 * @param {function(Error, String)} callback
 * @return {jQuery.Deferred}
 */
domAdapter.request = function (method, url, data, callback) {

    //data might be param
    if(method === "get" && data) {
        url += "?" + domAdapter.$.param(data);
    }

    var reqConfig = {
        type: method,
        url: url,
        dataType: "json",
        //headers: {},
        //crossDomain: true,
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            callback(null, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            callback(new Error(textStatus + " '" + errorThrown + "'"), jqXHR.responseText);
        }
    };

    if (data) {
        reqConfig.data = JSON.stringify(data);
    }

    if (method === "get") {
        //get has no body and therefor no content type
        delete reqConfig.contentType;
    }

    return jQuery.ajax(reqConfig);
};

module.exports = domAdapter;