"use strict"; // run code in ES5 strict mode

var Page = require("../../../../../../lib/client/Page.class.js");

var MainPage = Page.extend("MainPage", {
    template : require("./MainPage.html")
});

module.exports = MainPage;