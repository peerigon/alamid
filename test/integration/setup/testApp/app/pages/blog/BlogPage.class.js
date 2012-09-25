"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    Page = require("alamid").Page;

var BlogPage = new Class("BlogPage", {
    Extends: Page,
    $template : require("./BlogPage.html"),
    init : function () {

    }
});

module.exports = BlogPage;