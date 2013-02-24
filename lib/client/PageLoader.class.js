"use strict"; // run code in ES5 strict mode

var Class = require("alamid-class"),
    value = require("value"),
    Page = require("./Page.class.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    _ = require("underscore");

var PageLoader = new Class("PageLoader", {

    /**
     * @type Array
     * @private
     */
    _bundles: null,

    /**
     * @type Array
     * @private
     */
    _loadedPages: null,

    /**
     * @type Boolean
     * @private
     */
    _isCancelled: false,

    /**
     * @constructor PageLoader
     * @param {Array<String>} pageUrls An array that contains pageUrls, e.g. ["blog", "blog/posts"]
     */
    constructor: function (pageUrls) {
        var pageBundle,
            self = this;

        if (value(pageUrls).notTypeOf(Array) || pageUrls.length === 0) {
            throw new TypeError("(alamid) Cannot load pages: pageUrls must be a non-empty array");
        }

        this._bundles = [];
        this._loadedPages = [];

        _(pageUrls).each(function getPageBundlesFromRegistry(pageUrl, index) {
            if (value(pageUrl).notTypeOf(String) || pageUrl.length === 0) {
                throw new TypeError("(alamid) Cannot load page: The pageUrl must be a non-empty string");
            }

            pageBundle = pageRegistry.getPageBundle(pageUrl);

            if (!pageBundle) {
                throw new Error("(alamid) Cannot load page: The page '" + pageUrl + "' doesn\'t exist");
            }

            self._bundles[index] = pageBundle;
        });
    },

    /**
     * Starts the loading process:
     *
     * 1. Calls each page bundle
     * 2. Calls the data loader accordingly if present
     * 3. Creates the page with the params that have been passed
     * 4. Emits the data-event on the page if a data loader has been used
     *
     * The callback gets called with an error (or null) and the pages, that have been created.
     * When the callback is called, all pages have been created but not necessarily all data events triggered.
     *
     * Can only be called once.
     *
     * Call cancel() to abort the loading process. If cancel() is called, all previously created pages are disposed.
     * There will be no callback in this case.
     *
     * @param {!Object.<String, String>} context
     * @param {!Function} callback
     */
    load: function (context, callback) {
        var self = this,
            finished = 0,
            loadedPages = this._loadedPages,
            page;

        _(this._bundles).each(function loadPage(bundle, index) {
            bundle(function onPageBundleLoaded(PageClassOrTemplate) {
                if (self._isCancelled) {
                    return;
                }

                // Check if the returned value is a Class or just a Template
                if (value(PageClassOrTemplate).typeOf(String)) {
                    page = new Page(context, PageClassOrTemplate);
                } else if (value(PageClassOrTemplate).typeOf(Function)) {
                    page = new PageClassOrTemplate(context);
                } else {
                    callback(new Error("(alamid) PageBundle-Loader returned unknown value: Expected a String or a Function, instead saw '" + typeof PageClassOrTemplate + "'"));
                }

                finished++;
                loadedPages[index] = page;
                if (finished === self._bundles.length) {
                    callback(null, loadedPages);
                }
            });
        });


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

        _(loadedPages).each(function disposeLoadedPage(page) {
            if (page) {
                page.dispose();
            }
        });
        this._loadedPages = null;
    }
});

module.exports = PageLoader;