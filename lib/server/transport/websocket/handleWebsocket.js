"use strict";

var io = require('socket.io');

function prepareAlamidFormat(method, url, data, callback) {

    var aReq = {},
        aRes = {};

    aReq.method = method;
    aReq.data = data;
    aReq.parsedUrl = url;



    //check url to determine if validator or service request

    /*
    if(aReq.type === "service") {
        runService(aReq, aRes, onServiceCallback);
    }

    if(aReq.type === "validator") {
        runValidator(aReq, aRes, onValidatorCallback);
    }
    */
}

function init(server) {

    io.sockets.on('connection', function (socket) {

        socket.on("POST", function(url, data, cb){
            prepareAlamidFormat("POST", url, data, cb)
        });

        socket.on("PUT", function(url, data, cb){
            prepareAlamidFormat("PUT", url, data, cb)
        });

        socket.on("GET", function(url, data, cb){
            prepareAlamidFormat("GET", url, data, cb)
        });
        socket.on("DELETE", function(url, data, cb){
            prepareAlamidFormat("DELETE", url, data, cb)
        });

    });

    io.listen(server);
}

exports.init = init;