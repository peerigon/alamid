"use strict"; // run code in ES5 strict mode

var collectPages = require("../../collect/collectPages.js"),
    pathHelpers = require("../../../shared/helpers/pathHelpers.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populatePageRegistry.ejs"), "utf8"));

function pageRegistryLoader() {
    var alamidConfig = this.options.alamidConfig,
        pages;

    if (alamidConfig) {
        pages = collectPages(alamidConfig.paths.pages);

        return template({
            pages: pages,
            isClassFile: pathHelpers.filters.onlyClassFiles
        });
    }

    return "// Cannot generate populatePageRegistry: The webpack options don't have a 'alamidConfig'-property";
}

module.exports = pageRegistryLoader;