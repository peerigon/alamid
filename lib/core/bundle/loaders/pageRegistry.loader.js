"use strict"; // run code in ES5 strict mode

var collectPages = require("../../collect/collectPages.js"),
    pathHelpers = require("../../../shared/helpers/pathHelpers.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populatePageRegistry.ejs"), "utf8"));

function pageRegistryLoader() {
    var pages = collectPages(this.options.alamidConfig.paths.pages);

    return template({
        pages: pages,
        isClassFile: pathHelpers.filters.onlyClassFiles
    });
}

module.exports = pageRegistryLoader;