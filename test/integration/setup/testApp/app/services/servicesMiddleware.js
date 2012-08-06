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

function pushTest(req, res, next) {

    console.log("pushTest called");
    var sess = req.getSession();
    sess.activeRoomID = "pushTest";

    next();
}

var middleware = {
    "read /session" : sessionTest,
    "* /push" : pushTest
};

module.exports = middleware;