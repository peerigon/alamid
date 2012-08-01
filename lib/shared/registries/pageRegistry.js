"use strict"; // run code in ES5 strict mode

var pages = {},
    _ = require("underscore");

/**
 * Registers a pageBundle and pageDataLoader to the given pageURL. This method
 * wraps the pageBundle to be informed when the bundle is executed. Thus calling
 * pageRegistry.getPageBundle() won't return the original function.
 *
 * @param {!String} pageURL
 * @param {!Function} pageBundle
 * @param {Function=} pageDataLoader
 */
function setPage(pageURL, pageBundle, pageDataLoader) {
    function executeBundle(callback) {
        pageBundle(function onBundleLoaded(module) {
            var entry = pages[pageURL];

            entry.module = module;
            if (callback) {
                callback(entry.module);
            }
        });
    }

    pages[pageURL] = {
        bundle: executeBundle,
        dataLoader: pageDataLoader,
        module: null
    };
}

/**
 * Returns the page bundle wrapped in another function. The returned function acts exactly
 * like the page bundle.
 *
 * Returns undefined when the pageURL is unknown.
 *
 * @param {!String} pageURL
 * @return {Function}
 */
function getPageBundle(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.bundle;
    } else {
        return undefined;
    }
}

/**
 * Returns the pageDataLoader registered to the given pageURL.
 *
 * Returns undefined if the pageURL is unknown.
 *
 * @param {!String} pageURL
 * @return {Function}
 */
function getPageDataLoader(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.dataLoader || null;
    } else {
        return undefined;
    }
}

/**
 * Returns the PageClass. This is a synchronous shortcut to retrieve the
 * PageClass if the bundle has been executed before.
 *
 * Returns null if the bundle has not been executed before.
 *
 * Returns undefined if the pageURL is unknown.
 *
 * You can use this method to determine whether a bundle has been loaded or not.
 *
 * @param {!String} pageURL
 * @return {Function}
 */
function getPageClass(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.module;
    } else {
        return undefined;
    }
}

exports.setPage = setPage;
exports.getPageBundle = getPageBundle;
exports.getPageDataLoader = getPageDataLoader;
exports.getPageClass = getPageClass;