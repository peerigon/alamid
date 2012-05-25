var url = require('url');

function parseURL(req, res, next) {
    req.parsedURL = url.parse(req.url, true);
    next();
}

module.exports = parseURL;