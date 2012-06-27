var sendFile = require('./sendFile.js'),
    config = require('../../../../core/config'),
    paths = config.paths;

function serveBootstrapJS(req, res, next) {
    //make it serve bootstrap
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    if (config.isDev) {
        res.setHeader('Cache-Control', 'no-cache, no-store');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=' + 2 * 60 * 60);   // 2 hours
    }
    sendFile(paths.bundle + '/bootstrap.js', req, res);
}

module.exports = serveBootstrapJS;