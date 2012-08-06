"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    Page = require("./Page.class.js"),
    pageRegistry = require("../shared/registries/pageRegistry.js"),
    _ = require("underscore");

var PageLoader = new Class({
    __bundles: [],
    __dataLoaders: [],
    __urls: [],
    __loadedPages: [],
    __finished: 0,
    __data: [],
    __dataErrors: [],
    __loadHasBeenCalled: false,
    __isCancelled: false,

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
    cancel: function () {
        this.__isCancelled = true;
        this.__disposeLoadedPages();
    },
    __isBundleLoaded: function (index) {
        return this.__loadedPages[index] !== undefined;
    },
    __isDataLoaded: function (index) {
        return this.__data[index] !== undefined;
    },
    __emitPageDataEvents: function (index) {
        var page = this.__loadedPages[index],
            err = this.__dataErrors[index];

        if (err) {
            page.emit("dataError", err);
        } else {
            page.emit("data", this.__data[index]);
        }
    },
    __disposeLoadedPages: function () {
        var loadedPages = this.__loadedPages;

        _(loadedPages).each(function disposeLoadedPage(page, index) {
            if (page) {
                //TODO Make sure that dispose() can be called multiple times on an instance without throwing an error
                page.dispose();
                loadedPages[index] = null;
            }
        });
    }
});

module.exports = PageLoader;