"use strict"; // run code in ES5 strict mode

var collectPages = require("../../collect/collectPages.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/fillPageRegistry.ejs"), "utf8"));

function renderFillPageRegistry(rootPath, pagesPath) {

    var pages = collectPages(pagesPath);

    return template({
        rootPath : rootPath,
        pages: pages
    });
}

module.exports = renderFillPageRegistry;