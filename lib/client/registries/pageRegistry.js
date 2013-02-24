"use strict"; // run code in ES5 strict mode

var pages = {};

/**
 * Registers a pageBundle and pageDataLoader to the given pageUrl. This method
 * wraps the pageBundle to be informed when the bundle is executed. Thus calling
 * pageRegistry.getPageBundle() won't return the original function.
 *
 * @param {!String} pageUrl
 * @param {!Function} pageBundle
 */
function setPage(pageUrl, pageBundle) {
    function wrappedBundle(callback) {
        pageBundle(function onBundleLoaded(module) {
            var entry = pages[pageUrl];

            entry.module = module;
            if (callback) {
                callback(entry.module);
            }
        });
    }

    pages[pageUrl] = {
        bundle: wrappedBundle,
        module: null
    };

}

/**
 * Returns the page bundle wrapped in another function. The returned function acts exactly
 * like the page bundle.
 *
 * Returns undefined when the pageUrl is unknown.
 *
 * @param {!String} pageUrl
 * @return {Function}
 */
function getPageBundle(pageUrl) {
    var entry = pages[pageUrl];

    if (entry) {
        return entry.bundle;
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
 * Returns undefined if the pageUrl is unknown.
 *
 * You can use this method to determine whether a bundle has been loaded or not.
 *
 * @param {!String} pageUrl
 * @return {Function}
 */
function getPageClass(pageUrl) {
    var entry = pages[pageUrl];

    if (entry) {
        return entry.module;
    } else {
        return undefined;
    }
}

exports.setPage = setPage;
exports.getPageBundle = getPageBundle;
exports.getPageClass = getPageClass;