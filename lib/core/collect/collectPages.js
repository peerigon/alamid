"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    getPageDataLoaderPath = require("../../shared/helpers/resolvePaths.js").getPageDataLoaderPath,
    fs = require("fs");

function collectPages(pagesPath) {
    var finder = new Finder(),
        pages = {};

    finder.fileFilter = pathHelpers.filters.onlyClassFiles;

    finder
        .on("error", function (err) {
            throw err;
        })
        .on("file", function (classPath) {
            var dataLoaderPath = getPageDataLoaderPath(classPath);

            pages[classPath] = {
                Class: classPath,
                dataLoader: fs.existsSync(dataLoaderPath)? dataLoaderPath: null
            };
        })
        .walkSync(pagesPath);

    return pages;
}

module.exports = collectPages;