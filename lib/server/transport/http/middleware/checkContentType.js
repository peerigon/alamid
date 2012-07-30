function abortRequest(res) {
    res.statusCode = 415;
    res.end();
}

function checkContentType(acceptedTypes, encoding) {
    var actualType,
        acceptedType,
        i, l;

    for (i = 0, l = acceptedTypes.length; i < l; i++) {
        acceptedTypes[i] = acceptedTypes[i].toLowerCase();
    }

    return function checkContentType(req, res, next) {
        actualType = req.headers['content-type'];
        if (req.method === 'POST' || req.method === 'PUT') {
            actualType = actualType.toLowerCase();
            if (encoding && actualType.search(encoding) === -1) {
                abortRequest(res);
                next(new Error("(alamid) Invalid request type: " + req.headers['content-type']));
                return;
            }
            actualType = actualType.replace(/; *charset *=.*/gi, '');
            for (i = 0, l = acceptedTypes.length; i < l; i++) {
                acceptedType = acceptedTypes[i];
                if (acceptedType === actualType) {
                    next();
                    return;
                }
            }
            abortRequest(res);
            next(new Error("(alamid) Invalid request type: " + req.headers['content-type']));
            return;
        }
        next();
    };
}

module.exports = checkContentType;