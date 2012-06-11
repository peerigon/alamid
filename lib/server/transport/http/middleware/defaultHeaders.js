var config = require('..../core/config');

function setPageHeader(req, res, next) {
    if (config.isDev) {
        res.setHeader('Cache-Control', 'no-cache, no-store');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=' + 2 * 60 * 60);   // 2 hours
    }
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    next();
}

function setServiceHeader(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
}

function setValidatorHeader(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
}

exports.setServiceHeader = setServiceHeader;
exports.setPageHeader = setPageHeader;
exports.setValidatorHeader = setValidatorHeader;