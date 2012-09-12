"use strict";

var Model = require("../../../lib/shared/Model.class.js");

var Animal = Model.define("Animal", {
    $url : "animal",
    init : function() {

    }
});

module.exports = Animal;