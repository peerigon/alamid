var serveInitPage = require('./pages/serveInitPage');

function serveInitPageShortcut(req, res, next) {
    if (req.parsedURL.pathname === '/') {
        serveInitPage(req, res);
    } else {
        next();
    }
}

module.exports = serveInitPageShortcut;