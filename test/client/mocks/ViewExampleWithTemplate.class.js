"use strict";

var Class = require("nodeclass").Class,
    View = require("../../../lib/client/View.class.js"),
    viewCount = 0;

var ViewExampleWithTemplate = new Class({

    Extends: View,

    $template: "<li data-node='listElement'>HTMLLIElement "+ (viewCount++) + " +</li>"

});

module.exports = ViewExampleWithTemplate;