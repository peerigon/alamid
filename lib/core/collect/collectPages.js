"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers.js");

var isClassFile = pathHelpers.filters.onlyClassFiles,
    isHtmlFile = pathHelpers.filters.onlyHTMLFiles,
    sanitizePath = pathHelpers.chain.modifier("normalizeToUnix", "dirname");

function collectPages(pagesPath) {
    var finder = new Finder(),
        pages = {};

    finder
        .on("error", function (err) {
            throw err;
        })
        .on("file", function (fullPath) {
            var pageUrl = fullPath;

            //sanitize the path
            pageUrl = pageUrl.substr(pagesPath.length);
            pageUrl = sanitizePath(pageUrl)
                .toLowerCase();

            if (pageUrl !== "/") {  // excludes every file on the top level
                if (isClassFile(fullPath)) {
                    pages[pageUrl] = fullPath;
                }
                else if(isHtmlFile(fullPath) && !pages[pageUrl]) {
                    pages[pageUrl] = fullPath;
                }
            }

        })
        .walkSync(pagesPath);

    return pages;
}

module.exports = collectPages;