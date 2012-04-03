var loadScript = require('./loadScript.js'),
    settings = require('./settings.js'),
    url2ClassPath = require('./url2ClassPath.js'),
    domAdapter = require('./domAdapter.js'),
    services = require('./services.js');

var paramsRegExp = /\?.*$/;

function isErrorCode(code) {
    code = String(code);

    return code.charAt(0) === "4" || code.charAt(0) === "5";
}

function getPage(uri, onPageLoaded, onDataLoaded) {
    var params,
        classPath,
        service;

    function doPageLoadedCallback() {
        var PageClass,
            error;

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
    if (paramsRegExp.test(uri)) {
        params = uri.match(paramsRegExp)[0];
        params = params.substr(1);
        uri = uri.substr(0, uri.length - params.length);
        params = domAdapter.QueryParse(params);
    } else {
        params = {};
    }
    uri = 'pages/' + uri;
    uri = uri.replace(/\/\//g, '/');    // remove double slashes
    classPath = url2ClassPath(uri);
    try {
        PageClass = require(classPath);
        onPageLoaded(null, PageClass);
    } catch (err) {
        loadScript(settings.baseURI + '/' + uri, doPageLoadedCallback);
    }
    service = services.getService(uri);
    if (service) {
        service.GET(params, doDataLoadedCallback);
    } else {
        doDataLoadedCallback(400, 'Cannot load data: There is no service for this page that provides a GET method.');  // fake HTTP 400
    }
}

module.exports = getPage;