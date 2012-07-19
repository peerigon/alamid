"use strict";

function makeItFancy(req, res, next) {
    req.setData({ fancy : true });
    next();
}

var mwObj = {
    "create /blog" : makeItFancy //used by handleRequest.test.js
};

module.exports = mwObj;