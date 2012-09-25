"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    Page = require("../../../../../../../lib/client/Page.class.js");

var BlogPage = new Class("BlogPage", {
    Extends: Page,
    $template: require("./BlogPage.html"),
    init : function () {
        //nothing to do here
    }
});

module.exports = BlogPage;