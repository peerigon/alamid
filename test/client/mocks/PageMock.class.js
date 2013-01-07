"use strict"; // run code in ES5 strict mode

var Page = require("../../../lib/client/Page.class.js");

var PageMock = Page.extend("PageMock", {

    template: "<div data-node='page'></div>",

    subPage: null,

    params: null,

    emitted: null,

    constructor: function (params) {
        this.emitted = [];
        this.params = params;
        this._super("<div data-node='page'></div>");
    },

    emit: function () {
        this.emitted.push(arguments);
        this._super.apply(this, arguments);
    },

    setSubPage: function (subPage) {
        this._super(subPage);
        this.subPage = subPage;
        return this;
    }

});

module.exports = PageMock;