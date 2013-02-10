"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class");

var DataBinderPlugin = new Class("DataBinderPlugin", {
    target: null,
    constructor: function (target) {
        this.target = target;
    },
    create: function () {

    }
});

module.exports = DataBinderPlugin;