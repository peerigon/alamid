"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    DisplayObject = require("../../../lib/client/DisplayObject.class.js");

var PageMock = new Class({

    Extends: DisplayObject,

    subPage: null,

    params: null,

    emitted: [],

    init: function (params) {
        this.params = params;
        this.Super("<div data-node='page'></div>");
    },

    emit: function () {
        this.emitted.push(arguments);
        this.Super.emit.apply(this.Super, arguments);
    },

    setSubPage: function (subPage) {
        subPage.emit("append");
        this.subPage = subPage;
    }

});

module.exports = PageMock;