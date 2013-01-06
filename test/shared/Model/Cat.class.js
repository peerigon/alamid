"use strict";

var Animal = require("./Animal.class.js");

var Cat = Animal.extend("Cat", {
    url : "cat",
    constructor : function() {

    }
});

module.exports = Cat;