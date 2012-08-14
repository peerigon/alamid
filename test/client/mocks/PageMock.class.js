"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    EventEmitter = require("../../../lib/shared/EventEmitter.class.js");

var PageMock = new Class({

    Extends: EventEmitter,

    subPage: null,

    params: null,

    emitted: [],

    init: function (params) {
        this.params = params;
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