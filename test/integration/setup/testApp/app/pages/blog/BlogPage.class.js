"use strict"; // run code in ES5 strict mode

var Page = require("alamid").Page;

var BlogPage = Page.extend("BlogPage", {
    template : require("./BlogPage.html")
});

module.exports = BlogPage;