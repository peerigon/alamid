var loadScript = require('./loadScript.js'),
    settings = require('./settings.js'),
    url2ClassPath = require('./url2ClassPath.js'),
    domAdapter = require('./domAdapter.js'),
    services = require('./services.js');

function isErrorCode(code) {
    code = String(code);

    return code.charAt(0) === "4" || code.charAt(0) === "5";
}

function getPage(url, onPageLoaded, onDataLoaded) {
    var PageClass,
        params,
        positionOfQuestionMark,
        classPath,
        service;

    function doPageLoadedCallback() {
        var error;

        try {
            PageClass = require(classPath);
        } catch (err) {
            error = err;
        }
        onPageLoaded(error || null, PageClass);
    }

    function doDataLoadedCallback(code, response) {
        if (isErrorCode(code)) {
            onDataLoaded(response);
        } else {
            onDataLoaded(null, response);
        }
    }

    onPageLoaded = onPageLoaded || function () {};
    onDataLoaded = onDataLoaded || function () {};
    positionOfQuestionMark = url.search(/\?/);
    if (positionOfQuestionMark === -1) {
        params = {};
    } else {
        params = url.substr(positionOfQuestionMark + 1);
        url = url.substr(0, positionOfQuestionMark);
        params = domAdapter.QueryParse(params);
    }
    url = '/pages' + url;
    classPath = url2ClassPath(url);
    try {
        PageClass = require(classPath);
        onPageLoaded(null, PageClass);
    } catch (err) {
        loadScript(settings.baseURL + url, doPageLoadedCallback);
    }
    service = services.getService(url);
    if (service) {
        service.GET(params, doDataLoadedCallback);
    } else {
        doDataLoadedCallback(400, 'Cannot load data: There is no service for this page that provides a GET method.');  // fake HTTP 400
    }
}

module.exports = getPage;