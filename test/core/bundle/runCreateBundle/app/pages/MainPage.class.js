"use strict"; // run code in ES5 strict mode

var Page = require("alamid").Page;

var MainPage = Page.extend("MainPage", {
    template : require("./MainPage.html")
});

module.exports = MainPage;