"use strict";

var socketIO = require('socket.io'),
    connect = require("connect");

var parseCookie = connect.utils.parseCookie,
    store = require("../../session.js").sessionStore,
    websocketAdapter = require("./websocketAdapter.js");

function init(server) {

    var io = socketIO.listen(server);

    //enable sessions
    io.set('authorization', function (data, accept) {

        if (!data.headers.cookie) {
            //maybe start a session for this websocket here.
            return accept('No cookie transmitted.', false);
        }

        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['alamid.sid'];

        store.load(data.sessionID, function (err, session) {
            if (err || !session) {
                return accept('Error', false);
            }

            data.session = session;
            return accept(null, true);
        });
    });


    io.sockets.on('connection', function (socket) {
        socket.on("POST", function(url, data, cb){
            websocketAdapter("create", url, data, cb);
        });

        socket.on("PUT", function(url, data, cb){
            websocketAdapter("update", url, data, cb);
        });

        socket.on("GET", function(url, data, cb){
            websocketAdapter("read", url, data, cb);
        });
        socket.on("DELETE", function(url, data, cb){
            websocketAdapter("delete", url, data, cb);
        });
    });
}

exports.init = init;