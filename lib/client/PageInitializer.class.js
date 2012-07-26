"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    EventEmitter = require("../shared/EventEmitter.class.js"),
    pageRegistry = require("../shared/registries/pageRegistry.js");

var PageInitializer = new Class({
    Extends: EventEmitter,
    __pageBundle: null,
    __pageDataLoader: null,
    __pageURL: null,
    __data: null,
    __error: null,
    page: null,
    init: function (pageURL) {
        var pageBundle;

        if (typeof pageURL !== "string" || pageURL.length === 0) {
            throw new TypeError("(alamid) Cannot initialize page: The pageURL must be a non-empty string");
        }

        pageBundle = pageRegistry.getPageBundle(pageURL);

        if (!pageBundle) {
            throw new Error("(alamid) Cannot initialize page: The page '" + pageURL + "' doesn\'t exist");
        }

        this.__pageBundle = pageBundle;
        this.__pageDataLoader = pageRegistry.getPageDataLoader(pageURL);
    },
    load: function (params) {
        var self = this,
            hasBeenInitialized = false;

        this.__pageBundle(function pageBundleCallback(Page) {
            var page = new Page();

            self.page = page;
            self.Super.emit("init", page);
            hasBeenInitialized = true;
        });
        this.__pageDataLoader(params, function pageDataLoaderCallback(err, data) {
            if (err) {
                self.__error = err;
                if (hasBeenInitialized) {
                    self.__emitErrorEvent();
                } else {
                    self.Super.once("init", self.__emitErrorEvent);
                }

                return;
            }

            self.__data = data;
            self.Super.emit("data", data);

            if (hasBeenInitialized) {
                self.__emitDataEvent();
            } else {
                self.Super.once("init", self.__emitDataEvent);
            }
        });
    },
    __emitDataEvent: function () {
        var page = this.page;

        page.emit("data", this.__data);
    },
    __emitErrorEvent: function () {
        var page = this.page;

        page.emit("error", this.__error);
    }
});

module.exports = PageInitializer;