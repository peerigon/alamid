"use strict";

function sessionTest(req, res, next) {

    var sess = req.getSession();

    if(sess.counter === undefined) {
        sess.counter = 0;
    }

    sess.counter++;
    //we pass it via IDs because it's the only way for read
    req.setIds([sess.counter]);
    next();
}

var middleware = {
    "* /session" : sessionTest
};

module.exports = middleware;