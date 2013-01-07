"use strict";

var View = require("../../../lib/client/View.class.js"),
    viewCount = 0;

var ViewExampleWithTemplate = View.extend("ViewExampleWithTemplate", {
    template: "<li data-node='listElement'>HTMLLIElement " + (viewCount++) + "</li>"
});

module.exports = ViewExampleWithTemplate;