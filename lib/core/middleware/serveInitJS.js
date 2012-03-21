var sendFile = require('./sendFile.js'),
    settings = require('../settings.js'),
    paths = require('../paths');

function serveInitJS(req, res, next) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    if (settings.isDev) {
        res.setHeader('Cache-Control', 'no-cache, no-store');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=' + 2 * 60 * 60);   // 2 hours
    }
    sendFile(paths.appCache + '/init.js', req, res);
}

module.exports = serveInitJS;