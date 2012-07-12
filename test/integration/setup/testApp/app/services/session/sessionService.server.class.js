"use strict";

var sessionService = {

    read : function(model, req, res, callback) {

        var sess = req.getSession();
        var data = { "sessionCount" : sess.counter };

        callback({"status" : "success", data : data });

    },
    readCollection : function(model, req, res, callback) {

        var sess = req.getSession();

        if(sess.counter === undefined) {
            sess.counter = 0;
        }

        sess.counter++;

        callback({ "status": "success", data : { "sessionCount" : sess.counter }});
    }
};

module.exports = sessionService;