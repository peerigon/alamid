"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class");

var PageLoaderMock = new Class("PageLoaderMock", {

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
    context: null,

    /**
     * @type {Boolean}
     */
    cancelled: false,

    /**
     * @param {Array} pageURLs
     */
    constructor: function (pageURLs) {
        this.pageURLs = pageURLs;
        PageLoaderMock.instance = this;
    },

    /**
     * @param {Object} context
     * @param {Function} callback
     */
    load: function (context, callback) {
        this.context = context;
        this.callback = callback;
    },

    cancel: function () {
        this.cancelled = true;
    }
});

module.exports = PageLoaderMock;