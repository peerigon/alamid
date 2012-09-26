"use strict"; // run code in ES5 strict mode

var Page = require("alamid").Page;

var BlogPage = Page.define("BlogPage", {
    $template: require("./BlogPage.html"),
    init : function () {
        //nothing to do here
    }
});

module.exports = BlogPage;