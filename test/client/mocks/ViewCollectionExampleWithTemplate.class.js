"use strict";

var ViewCollection = require("../../../lib/client/ViewCollection.class.js");

var ViewCollectionExampleWithTemplate = ViewCollection.extend("ViewCollectionExampleWithTemplate", {
    template: "<ul data-node='views'></ul>"
});

module.exports = ViewCollectionExampleWithTemplate;