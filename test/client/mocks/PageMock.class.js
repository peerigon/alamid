"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    Page = require("../../../lib/client/Page.class.js");

var PageMock = new Class("PageMock", {

    Extends: Page,

    $template: "<div data-node='page'></div>",

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
        this.Super.setSubPage(subPage);
        this.subPage = subPage;
        return this.Instance;
    }

});

module.exports = PageMock;