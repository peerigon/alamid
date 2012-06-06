var checkPageExists = require('../../core/checkPageExists'),
    serveInitPage = require('./serveInitPage');

function handleDifferentInitPage(req, res, next) {
    function onResult(result) {
        if (result) {
            serveInitPage(req, res, next);
        } else {
            next();
        }
    }
    
    checkPageExists(req.parsedURL.pathname, onResult);
}

module.exports = handleDifferentInitPage;