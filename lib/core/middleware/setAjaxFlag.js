function setAjaxFlag(req, res, next) {
    var param = req.parsedURL.query;

    req.ajax = req.headers['x-requested-with'] === 'XMLHttpRequest' || param.ajax !== undefined;
    delete param.ajax;
    next();
}

module.exports = setAjaxFlag;