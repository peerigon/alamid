"use strict"; // run code in ES5 strict mode

var pages = {},
    _ = require("underscore");

function setPage(pageURL, pageBundle, pageDataLoader) {
    function onBundleLoaded(module) {
        var entry = pages[pageURL];

        entry.module = module;
    }

    function executeBundle() {
        pageBundle(onBundleLoaded);
    }

    pages[pageURL] = {
        bundle: executeBundle,
        dataLoader: pageDataLoader,
        module: null
    };
}

function getPageBundle(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.bundle;
    } else {
        return null;
    }
}

function getPageDataLoader(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.dataLoader;
    } else {
        return null;
    }
}

function getPageClass(pageURL) {
    var entry = pages[pageURL];

    if (entry) {
        return entry.module;
    } else {
        return null;
    }
}

function getPageURL(PageClass) {
    var result = null;

    _(pages).find(function findPageURLforPageClass(obj, pageURL) {
        var interimResult = obj.module === PageClass;

        if (interimResult) {
            result = pageURL;
        }

        return interimResult;
    });

    return result;
}

exports.setPage = setPage;
exports.getPageBundle = getPageBundle;
exports.getPageDataLoader = getPageDataLoader;
exports.getPageClass = getPageClass;
exports.getPageURL = getPageURL;