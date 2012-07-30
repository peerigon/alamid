"use strict";

var Class = require("nodeclass").Class,
    ViewCollection = require("../../../lib/client/ViewCollection.class.js");

var ViewCollectionExampleWithTemplate = new Class({

    Extends: ViewCollection,

    $template: "<ul data-node='views'></ul>",

    getNode: function () {
        return this.Super.getNode();
    }

});

module.exports = ViewCollectionExampleWithTemplate;