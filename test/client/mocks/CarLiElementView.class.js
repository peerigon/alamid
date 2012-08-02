"use strict";

var Class = require("nodeclass").Class,
    View = require("../../../lib/client/View.class.js");

var CarLiElementView = new Class({

    Extends: View,

    $template: "<li data-node='listElement'>" +
        "<p>" +
        "<span data-node='manufactor'></span>" +
        "<span data-node='model'></span>" +
        "</p>"+
        "</li>"

});

module.exports = CarLiElementView;