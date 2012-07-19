"use strict";

function sessionTest(req, res, next) {

    var sess = req.getSession();

    if(sess.counter === undefined) {
        sess.counter = 0;
    }

    sess.counter++;
    req.setData({ "sessionCount" : sess.counter });
    next();
}

var middleware = {
    "read /session" : sessionTest
};

module.exports = middleware;