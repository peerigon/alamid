"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class;

var PageMock = new Class({
    subPage: null,
    params: null,
    emitted: [],
    init: function (params) {
        this.params = params;
    },
    emit: function () {
        this.emitted.push(arguments);
    }
});

module.exports = PageMock;