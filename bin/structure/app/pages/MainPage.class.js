"use strict";

var alamid = require("alamid"),
    Page = alamid.Page;

var MainPage = Page.define("MainPage", {

    $template: require("./MainPage.html"),

    __nodeMap: null,

    init: function (ctx) {
        this.Super(ctx);

        this.__nodeMap = this.Super._getNodeMap();
    }
});

module.exports = MainPage;