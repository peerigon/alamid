"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    path = require("path"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    getPagePaths = require("../../shared/helpers/resolvePaths.js").getPagePaths,
    fs = require("fs");

function collectPages(pagesPath) {
    var finder = new Finder(),
        pages = {};

    finder.fileFilter = pathHelpers.filters.onlyHTMLFiles;

    finder
        .on("error", function (err) {
            throw err;
        })
        .on("file", function (templatePath) {
            var pageURL = path.dirname(templatePath).toLowerCase().substr(pagesPath.length + 1),
                pagePaths;

            if (pageURL) { // this excludes the main page because the main page has the pageURL ""
                pagePaths = getPagePaths(templatePath);

                if (fs.existsSync(pagePaths.Class) === false) {
                    pagePaths.Class = null;
                }
                if (fs.existsSync(pagePaths.dataLoader) === false) {
                    pagePaths.dataLoader = null;
                }

                pages[pageURL] = pagePaths;
            }

        })
        .walkSync(pagesPath);

    return pages;
}

module.exports = collectPages;