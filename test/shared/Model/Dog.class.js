"use strict";

var Model = require("../../../lib/shared/Model.class.js");

var Dog = Model.define("Dog", {
    $url : "dog",
    init : function() {

    }
});

module.exports = Dog;