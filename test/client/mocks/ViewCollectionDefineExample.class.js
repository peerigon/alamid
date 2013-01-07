"use strict";

var ViewExampleWithTemplate = require("./ViewExampleWithTemplate.class.js"),
    ViewCollection = require("../../../lib/client/ViewCollection.class.js");

var ViewCollectionDefineExample = ViewCollection.extend("ViewCollectionDefineExample", {

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    constructor: function (done) {
        var collectionTemplate = "<ul data-node='views'></ul>";

        this._super(ViewExampleWithTemplate, collectionTemplate);
        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = ViewCollectionDefineExample;