"use strict";

var ViewExampleWithTemplate = require("./ViewExampleWithTemplate.class.js"),
    ViewCollection = require("../../../lib/client/ViewCollection.class.js");

var ViewCollectionDefineExample = ViewCollection.define({

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    init: function (done) {

        var collectionTemplate = "<ul data-node='views'></ul>";

        this.Super(ViewExampleWithTemplate, collectionTemplate);

        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = ViewCollectionDefineExample;