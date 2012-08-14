"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    Page = require("./Page.class.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    _ = require("underscore");

var PageLoader = new Class({

    /**
     * @type Array
     * @private
     */
    __bundles: [],

    /**
     * @type Array
     * @private
     */
    __dataLoaders: [],

    /**
     * @type Array
     * @private
     */
    __urls: [],

    /**
     * @type Array
     * @private
     */
    __loadedPages: [],

    /**
     * @type Number
     * @private
     */
    __finished: 0,

    /**
     * @type Array
     * @private
     */
    __data: [],

    /**
     * @type Array
     * @private
     */
    __dataErrors: [],

    /**
     * @type Boolean
     * @private
     */
    __loadHasBeenCalled: false,

    /**
     * @type Boolean
     * @private
     */
    __isCancelled: false,

    /**
     * @constructor PageLoader
     * @param {!Array<String>} pageURLs An array that contains pageURLs, e.g. ["blog", "blog/posts"]
     * @throws {TypeError}
     * @throws {Error} When one of the pages doesn't exist
     */
    init: function (pageURLs) {
        var pageBundle,
            self = this;

        if (is(pageURLs).notInstanceOf(Array) || pageURLs.length === 0) {
            throw new TypeError("(alamid) Cannot load pages: pageURLs must be a non-empty array");
        }

        _(pageURLs).each(function forEachPageURL(pageURL, index) {
            if (typeof pageURL !== "string" || pageURL.length === 0) {
                throw new TypeError("(alamid) Cannot load page: The pageURL must be a non-empty string");
            }

            pageBundle = pageRegistry.getPageBundle(pageURL);

            if (!pageBundle) {
                throw new Error("(alamid) Cannot load page: The page '" + pageURL + "' doesn\'t exist");
            }

            self.__urls[index] = pageURL;
            self.__bundles[index] = pageBundle;
            self.__dataLoaders[index] = pageRegistry.getPageDataLoader(pageURL);
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
     * @param {!Object.<String, String>} params
     * @param {!Function} callback
     * @throws {TypeError}
     * @throws {Error} when the function has been called before
     */
    load: function (params, callback) {
        var self = this,
            dataLoader,
            page;

        function checkFinished() {
            self.__finished++;
            if (self.__finished === self.__bundles.length) {
                // There aren't passed any errors currently.
                // But if we want to pass errors in the future, we should provide the right interface to do so.
                callback(null, self.__loadedPages);
            }
        }

        if (is(params).notInstanceOf(Object)) {
            throw new TypeError("(alamid) Cannot load pages: The params object must be typeof object. Instead saw '" +
             typeof params + "'");
        }
        if (is(callback).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot load pages: You haven't passed a callback to receive the loaded pages.");
        }

        if (this.__loadHasBeenCalled) {
            throw new Error("(alamid) Cannot load page again: PageLoader.load can only be called one time. " +
                "Create a new instance to start a new loading process.");
        } else {
            this.__loadHasBeenCalled = true;
        }

        _(this.__bundles).each(function loadPage(bundle, index) {
            dataLoader = self.__dataLoaders[index];

            bundle(function onPageBundleLoaded(PageClass) {
                if (self.__isCancelled) {
                    self.__disposeLoadedPages();
                    return;
                }

                page = new PageClass(params);
                self.__loadedPages[index] = page;
                if (dataLoader) {
                    if (self.__isDataLoaded(index)) {
                        self.__emitPageDataEvents(index);
                        checkFinished();
                    }
                } else {
                    checkFinished();
                }
            });

            if (dataLoader) {
                dataLoader(params, function onPageDataLoaded(err, data) {
                    if (self.__isCancelled) {
                        self.__disposeLoadedPages();
                        return;
                    }

                    self.__dataErrors[index] = err;
                    self.__data[index] = data;
                    if (self.__isBundleLoaded(index)) {
                        self.__emitPageDataEvents(index);
                        checkFinished();
                    }
                });
            }
        });
    },

    /**
     * Cancels the loading process and disposes all pages that have been loaded so far.
     */
    cancel: function () {
        this.__isCancelled = true;
        this.__disposeLoadedPages();
    },

    /**
     * Returns true if the bundle has responded so far.
     *
     * @param {!Number} index
     * @return {Boolean}
     * @private
     */
    __isBundleLoaded: function (index) {
        return this.__loadedPages[index] !== undefined;
    },

    /**
     * Returns true if the data loader has responded so far.
     *
     * @param {!Number} index
     * @return {Boolean}
     * @private
     */
    __isDataLoaded: function (index) {
        return this.__data[index] !== undefined;
    },

    /**
     * Emits 'data' and 'dataError' respectively on the page at the given index
     * whether there is an error or not.
     *
     * @param {!Number} index
     * @private
     */
    __emitPageDataEvents: function (index) {
        var page = this.__loadedPages[index],
            err = this.__dataErrors[index];

        if (err) {
            page.emit("dataError", err);
        } else {
            page.emit("data", this.__data[index]);
        }
    },

    /**
     * Disposes all previously loaded pages.
     *
     * @private
     */
    __disposeLoadedPages: function () {
        var loadedPages = this.__loadedPages;

        _(loadedPages).each(function disposeLoadedPage(page, index) {
            if (page) {
                page.dispose();
                loadedPages[index] = null;
            }
        });
    }
});

module.exports = PageLoader;