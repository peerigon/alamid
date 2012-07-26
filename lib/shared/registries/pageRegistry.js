"use strict"; // run code in ES5 strict mode

var pages = {};

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

exports.setPage = setPage;
exports.getPageBundle = getPageBundle;
exports.getPageDataLoader = getPageDataLoader;
exports.getPageClass = getPageClass;