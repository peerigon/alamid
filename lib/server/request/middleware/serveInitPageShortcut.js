var serveInitPage = require('../../pages/serveInitPage');

function serveInitPageShortcut(req, res, next) {
    if (req.parsedURL.pathname === '/') {
        serveInitPage(req, res, next);
    } else {
        next();
    }
}

module.exports = serveInitPageShortcut;