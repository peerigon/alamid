"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    Page = require("../../../../../../lib/client/Page.class.js");

var MainPage = new Class({
    Extends: Page,
    $template : require("./MainPage.html"),
    init : function () {

    }
});

module.exports = MainPage;