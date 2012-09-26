"use strict"; // run code in ES5 strict mode

var Page = require("alamid").Page;

var MainPage = Page.define("MainPage", {
    $template : require("./MainPage.html"),
    init : function () {

    }
});

module.exports = MainPage;