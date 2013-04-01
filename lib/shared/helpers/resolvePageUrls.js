"use strict"; // run code in ES5 strict mode

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
    var pageUrlSplit,
        i,
        result = [];

    pageUrl = pageUrl.replace(/^\/|\/$/g, "");

    if (pageUrl === "") {
        return result;
    }

    pageUrlSplit  = pageUrl.split("/");
    pageUrl = "";

    for (i = 0; i < pageUrlSplit.length; i++) {
        pageUrl += "/" + pageUrlSplit[i];
        result[i] = pageUrl;
    }

    return result;
}

module.exports = resolvePageUrls;