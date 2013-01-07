"use strict";

var View = require("../../../lib/client/View.class.js");

var CarLiElementView = View.extend("CarLiElementView", {
    template: "<li data-node='listElement'>" +
        "<p>" +
        "<span data-node='manufactor'></span>" +
        "<span data-node='model'></span>" +
        "</p>"+
        "</li>"

});

module.exports = CarLiElementView;