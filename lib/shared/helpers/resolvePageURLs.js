"use strict"; // run code in ES5 strict mode

/**
 * Returns an array with all pageURLs that are required to display the given pageURL.
 *
 * For instance:
 * input: "blog/posts/comments"
 * output: ["blog", "blog/posts", "blog/posts/comments"]
 *
 * @param {!String} pageURL
 * @return {Array.<String>}
 */
function resolvePageURLs(pageURL) {
    var pageURLSplit,
        i,
        result = [];

    pageURLSplit  = pageURL.split("/");
    pageURL = "";

    for (i = 0; i < pageURLSplit.length; i++) {
        pageURL += pageURLSplit[i];
        result[i] = pageURL;
        pageURL += "/";
    }

    return result;
}

module.exports = resolvePageURLs;