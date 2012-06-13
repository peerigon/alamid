var checkPageExists = require('../../../../helpers/checkPageExists'),
    serveInitPage = require('./../../../request/middleware/serveInitPage');

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