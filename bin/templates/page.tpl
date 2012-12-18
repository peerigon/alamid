"use strict";

var alamid = require("alamid"),
    Page = alamid.Page;

var <%= name %>Page = Page.define("<%= name %>Page", {

    $template: require("./<%= name %>Page.html"),

    __nodeMap: null,

    init: function (ctx) {
        this.Super(ctx);

        this.__nodeMap = this.Super._getNodeMap();
    }
});

module.exports = <%= name %>Page;