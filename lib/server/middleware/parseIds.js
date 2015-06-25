"use strict";

function parseIds() {

    return function (req, res, next) {

        var pathParts = req.url.split("/");

        req.ids = {};
        req.modelUrl = "";

        for (var i = 2; i < pathParts.length; i++) {
            if (i % 2 === 1) {
                req.ids[pathParts[i - 1]] = pathParts[i];
            }
            else {
                req.modelUrl += pathParts[i] + "/"
            }
        }

        next();
    };
}

module.exports = parseIds;