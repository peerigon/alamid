"use strict";

var Model = require("../../../lib/shared/Model.class.js"),
    Animal = require("./Animal.class.js");

var Cat = Model.define("Cat", {
    Extends : Animal,
    $url : "cat",
    init : function() {

    }
});

module.exports = Cat;