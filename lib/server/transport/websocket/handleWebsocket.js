"use strict";

var socketIO = require('socket.io'),
    connect = require("connect"),
    cookie = require("cookie"),
    util = require("util"),
    Session = require('connect').middleware.session.Session;

var utils = connect.utils,
    store = require("../../session.js").sessionStore,
    websocketAdapter = require("./websocketAdapter.js");

function init(server) {

    var io = socketIO.listen(server);

    io.set('authorization', function (data, accept) {

        if (!data.headers.cookie) {
            //maybe start a session for this websocket here.
            return accept('No cookie transmitted.', false);
        }

        var cookies = data.headers.cookie;
        var secret = "secret";

        if (cookies) {
            try {
                data.cookies = cookie.parse(cookies);
                if (secret) {
                    data.signedCookies = utils.parseSignedCookies(data.cookies, secret);
                    var obj = utils.parseJSONCookies(data.signedCookies);
                    //load the session before it's overwritten below
                    data.sessionID = data.signedCookies["sid"];
                    data.signedCookies = obj;
                }
                data.cookies = utils.parseJSONCookies(data.cookies);
            } catch (err) {
                console.log("err", err);
            }
        }

        data.sessionStore = store;

        store.get(data.sessionID, function (err, session) {
            if (err || !session) {
                return accept('Error', false);
            }

            // create a session object, passing data as request and our
            // just acquired session data
            data.session = new Session(data, session);

            //data.session = new Session(data, session);
            return accept(null, true);
        });
    });


    io.sockets.on('connection', function (socket) {

        var hs = socket.handshake;

        console.log('A socket with sessionID ' + hs.sessionID + ' connected!');

        setInterval(function() {
            //reload the data
            hs.session.reload( function (err) {
                // "touch" it (resetting maxAge and lastAccess)
                // and save it back again.
                hs.session.touch().save();
            });
        }, 1000);

        socket.on("POST", function(url, data, cb){
            websocketAdapter("create", hs, url, data, cb);
        });

        socket.on("PUT", function(url, data, cb){
            websocketAdapter("update", hs, url, data, cb);
        });

        socket.on("GET", function(url, data, cb){
            websocketAdapter("read", hs, url, data, cb);
        });

        socket.on("DELETE", function(url, data, cb){
            websocketAdapter("delete", hs, url, data, cb);
        });

        socket.on("SESSION", function(cb){
            cb(hs.session);
        });

    });
}

exports.init = init;