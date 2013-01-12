"use strict"; // run code in ES5 strict mode

var Page = require("alamid").Page;

var HomePage = Page.extend("HomePage", {
    template : require("./HomePage.html")
});

module.exports = HomePage;