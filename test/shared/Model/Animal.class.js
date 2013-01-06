"use strict";

var Model = require("../../../lib/shared/Model.class.js");

var Animal = Model.extend("Animal", {
    url : "animal",
    constructor : function() {

    }
});

module.exports = Animal;