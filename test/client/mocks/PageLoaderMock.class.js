"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class;

var PageLoaderMock = new Class({
    $instance: null,
    callback: null,
    pageURLs: null,
    params: null,
    cancelled: false,
    init: function (pageURLs) {
        this.pageURLs = pageURLs;
        PageLoaderMock.instance = this.Instance;
    },
    load: function (params, callback) {
        this.params = params;
        this.callback = callback;
    },
    cancel: function () {
        this.cancelled = true;
    }
});

module.exports = PageLoaderMock;