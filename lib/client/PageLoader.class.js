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
    _dataLoaders: null,

    /**
     * @type Array
     * @private
     */
    _urls: null,

    /**
     * @type Array
     * @private
     */
    _loadedPages: null,

    /**
     * @type Number
     * @private
     */
    _finished: 0,

    /**
     * @type Array
     * @private
     */
    _data: null,

    /**
     * @type Array
     * @private
     */
    _dataErrors: null,

    /**
     * @type Boolean
     * @private
     */
    _loadHasBeenCalled: false,

    /**
     * @type Boolean
     * @private
     */
    _isCancelled: false,

    /**
     * @constructor PageLoader
     * @param {!Array<String>} pageURLs An array that contains pageURLs, e.g. ["blog", "blog/posts"]
     * @throws {TypeError}
     * @throws {Error} When one of the pages doesn't exist
     */
    constructor: function (pageURLs) {
        var pageBundle,
            self = this;

        if (value(pageURLs).notTypeOf(Array) || pageURLs.length === 0) {
            throw new TypeError("(alamid) Cannot load pages: pageURLs must be a non-empty array");
        }

        this._bundles = [];
        this._dataLoaders = [];
        this._urls = [];
        this._loadedPages = [];
        this._data = [];
        this._dataErrors = [];

        _(pageURLs).each(function forEachPageURL(pageURL, index) {
            if (typeof pageURL !== "string" || pageURL.length === 0) {
                throw new TypeError("(alamid) Cannot load page: The pageURL must be a non-empty string");
            }

            pageBundle = pageRegistry.getPageBundle(pageURL);

            if (!pageBundle) {
                throw new Error("(alamid) Cannot load page: The page '" + pageURL + "' doesn\'t exist");
            }

            self._urls[index] = pageURL;
            self._bundles[index] = pageBundle;
            self._dataLoaders[index] = pageRegistry.getPageDataLoader(pageURL);
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
            self._finished++;
            if (self._finished === self._bundles.length) {
                // There aren't passed any errors currently.
                // But if we want to pass errors in the future, we should provide the right interface to do so.
                callback(null, self._loadedPages);
            }
        }

        if (value(params).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot load pages: The params object must be typeof object. Instead saw '" +
             typeof params + "'");
        }
        if (value(callback).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot load pages: You haven't passed a callback to receive the loaded pages.");
        }

        if (this._loadHasBeenCalled) {
            throw new Error("(alamid) Cannot load page again: PageLoader.load can only be called one time. " +
                "Create a new instance to start a new loading process.");
        } else {
            this._loadHasBeenCalled = true;
        }

        _(this._bundles).each(function loadPage(bundle, index) {
            dataLoader = self._dataLoaders[index];

            bundle(function onPageBundleLoaded(PageClassOrTemplate) {
                if (self._isCancelled) {
                    self._disposeLoadedPages();
                    return;
                }

                // Check if the returned value is a Class or just a Template
                if (value(PageClassOrTemplate).typeOf(String)) {
                    page = new Page(params, PageClassOrTemplate);
                } else if (value(PageClassOrTemplate).typeOf(Function)) {
                    page = new PageClassOrTemplate(params);
                } else {
                    throw new Error("(alamid) PageBundle-Loader returned unknown value: " +
                        "Expected a String or a Function, instead saw '" + typeof PageClassOrTemplate + "'");
                }

                self._loadedPages[index] = page;
                if (dataLoader) {
                    if (self._isDataLoaded(index)) {
                        self._emitPageDataEvents(index);
                        checkFinished();
                    }
                } else {
                    checkFinished();
                }
            });

            if (dataLoader) {
                dataLoader(params, function onPageDataLoaded(err, data) {
                    if (self._isCancelled) {
                        self._disposeLoadedPages();
                        return;
                    }

                    self._dataErrors[index] = err;
                    self._data[index] = data;
                    if (self._isBundleLoaded(index)) {
                        self._emitPageDataEvents(index);
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
        this._isCancelled = true;
        this._disposeLoadedPages();
    },

    /**
     * Returns true if the bundle has responded so far.
     *
     * @param {!Number} index
     * @return {Boolean}
     * @private
     */
    _isBundleLoaded: function (index) {
        return this._loadedPages[index] !== undefined;
    },

    /**
     * Returns true if the data loader has responded so far.
     *
     * @param {!Number} index
     * @return {Boolean}
     * @private
     */
    _isDataLoaded: function (index) {
        return this._data[index] !== undefined;
    },

    /**
     * Emits 'data' and 'dataError' respectively on the page at the given index
     * whether there is an error or not.
     *
     * @param {!Number} index
     * @private
     */
    _emitPageDataEvents: function (index) {
        var page = this._loadedPages[index],
            err = this._dataErrors[index];

        if (err) {
            page.emit("dataError", err);
        } else {
            page.emit("data", this._data[index]);
        }
    },

    /**
     * Disposes all previously loaded pages.
     *
     * @private
     */
    _disposeLoadedPages: function () {
        var loadedPages = this._loadedPages;

        console.log("dispose");
        _(loadedPages).each(function disposeLoadedPage(page, index) {
            if (page) {
                page.dispose();
                loadedPages[index] = null;
            }
        });
    }
});

module.exports = PageLoader;