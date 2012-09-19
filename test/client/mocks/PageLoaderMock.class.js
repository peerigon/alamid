"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class;

var PageLoaderMock = new Class({

    /**
     * @type {Function}
     */
    $instance: null,

    /**
     * @type {Function}
     */
    callback: null,

    /**
     * @type {Array}
     */
    pageURLs: null,

    /**
     * @type {Object}
     */
    params: null,

    /**
     * @type {Boolean}
     */
    cancelled: false,

    /**
     * @param {Array} pageURLs
     */
    init: function (pageURLs) {
        this.pageURLs = pageURLs;
        PageLoaderMock.instance = this.Instance;
    },

    /**
     * @param {Object} params
     * @param {Function} callback
     */
    load: function (params, callback) {
        this.params = params;
        this.callback = callback;
    },

    cancel: function () {
        this.cancelled = true;
    }
});

module.exports = PageLoaderMock;