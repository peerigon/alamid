"use strict"; // run code in ES5 strict mode

var pathHelpers = require("./pathHelpers.js");

var noTrailingLeadingSlash = pathHelpers.apply.modifier("noTrailingSlash", "noLeadingSlash").on;

/**
 * Returns an array with all pageURLs that are required to display the given pageUrl.
 *
 * For instance:
 * input: "blog/posts/comments"
 * output: ["blog", "blog/posts", "blog/posts/comments"]
 *
 * @param {String} pageUrl
 * @return {Array.<String>}
 */
function resolvePageUrls(pageUrl) {
    var pageURLSplit,
        i,
        result = [];

    pageUrl = noTrailingLeadingSlash(pageUrl);
    pageURLSplit  = pageUrl.split("/");
    pageUrl = "";

    for (i = 0; i < pageURLSplit.length; i++) {
        pageUrl += pageURLSplit[i];
        result[i] = pageUrl;
        pageUrl += "/";
    }

    return result;
}

module.exports = resolvePageUrls;