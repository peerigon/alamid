"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class"),
    value = require("value"),
    Page = require("./Page.class.js"),
    default404Template = require("./defaults/404.html");

/**
 * Loads page bundles and calls back when the loading is finished.
 *
 * @class PageLoader
 */
var PageLoader = new Class("PageLoader", {

    /**
     * @type {Array}
     * @private
     */
    _bundles: null,

    /**
     * @type {Array}
     * @private
     */
    _pageUrls: null,

    /**
     * @type {Array}
     * @private
     */
    _loadedPages: null,

    /**
     * @type {Boolean}
     * @private
     */
    _isCancelled: false,

    /**
     * @param {Array<String>} pageUrls An array that contains pageUrls, e.g. ["blog", "blog/posts"]
     */
    constructor: function (pageUrls) {
        var pageBundle,
            self = this;

        if (value(pageUrls).notTypeOf(Array) || pageUrls.length === 0) {
            throw new TypeError("(alamid) Cannot load pages: pageUrls must be a non-empty array");
        }

        this._bundles = [];
        this._pageUrls = pageUrls;

        pageUrls.forEach(function selectPageBundles(pageUrl, index) {
            if (value(pageUrl).notTypeOf(String)) {
                throw new TypeError("(alamid) Cannot load page: The pageUrl must be a non-empty string");
            }

            pageBundle = PageLoader.bundles[pageUrl] || null;
            self._bundles[index] = pageBundle;
        });
    },

    /**
     * Triggers page loading by calling all page bundles.
     *
     * - If the page bundle calls back with a Function as first parameter the function is instantiated
     * - If the page bundle calls back with a String the string is interpreted as template
     *
     * At the end the final callback is called with an array of pages.
     *
     * Call cancel() to abort the loading process. If cancel() is called, all previously created pages are disposed.
     * There will be no callback in this case.
     *
     * @param {Object} context
     * @param {!function(Array)} callback
     */
    load: function (context, callback) {
        var self = this,
            finished = 0,
            loadedPages = this._loadedPages = [],
            page;

        this._bundles.forEach(function loadPage(bundle, index) {
            if (bundle === null) {
                page = new Page(context, default404Template);
                page._nodes.pageUrl.textContent = self._pageUrls[index];
                finish(page, index);

                return;
            }

            bundle(function onBundleLoaded(PageClassOrTemplate) {
                var pageUrl = self._pageUrls[index],
                    PageClass;

                if (self._isCancelled) {
                    return;
                }

                if (value(PageClassOrTemplate).typeOf(String)) {
                    PageClass = PageLoader.loadedPages[pageUrl];

                    if (!PageClass || PageClass.prototype.template !== PageClassOrTemplate) {
                        PageClass = Page.extend({
                            template: PageClassOrTemplate
                        });
                    }

                } else if (value(PageClassOrTemplate).typeOf(Function)) {
                    PageClass = PageClassOrTemplate;
                } else {
                    throw new TypeError("(alamid) Cannot create Page: Expected page bundle to return either a function or a string, instead saw '" + typeof PageClass + "'");
                }

                PageLoader.loadedPages[pageUrl] = PageClass;
                page = new PageClass(context);

                finish(page, index);
            });
        });

        function finish(page, index) {
            finished++;
            loadedPages[index] = page;
            if (finished === self._bundles.length) {
                self._loadedPages = null; // clearing reference, just to be sure
                callback(null, loadedPages);
            }
        }
    },

    /**
     * Cancels the loading process and disposes all pages that have been loaded so far.
     */
    cancel: function () {
        var loadedPages = this._loadedPages;

        this._isCancelled = true;

        if (!loadedPages) {
            return;
        }

        loadedPages.forEach(function disposeLoadedPage(page) {
            if (page) {
                page.dispose();
            }
        });
        this._loadedPages = null;
    }
});

/**
 * All page bundles that can be loaded. Keys are page urls, values are page bundles.
 * A page bundle is an asynchronous function which returns either a Function or a String.
 *
 * @type {Object}
 */
PageLoader.bundles = {};

/**
 * Contains all Page-Classes that have been loaded.
 * If a page bundle returned a string the auto-generated Page-Class is added here.
 *
 * @type {Object}
 */
PageLoader.loadedPages = {};

module.exports = PageLoader;