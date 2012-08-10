"use strict"; // run code in ES5 strict mode

var collectPages = require("../../core/collect/collectPages.js"),
    _ = require("underscore"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(__dirname + "/templates/fillPageRegistry.ejs", "utf8"));

function renderFillRegistries(pagesPath) {
    var pages = collectPages(pagesPath);

    return template({
        pages: pages
    });
}

module.exports = renderFillRegistries;