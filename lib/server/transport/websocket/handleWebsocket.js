"use strict";

var connect = require("connect"),
    cookie = require("cookie"),
    Session = require('connect').middleware.session.Session;

var utils = connect.utils,
    session = require("../../session.js"),
    config = require("../../../shared/config"),
    log = require("../../../shared/logger.js").get("server"),
    websocketAdapter = require("./websocketAdapter.js"),
    websocket = require("./websocket");

function init(io) {

    io.set("authorization", function (data, accept) {

        if (config.use.session === true) {

            if (!data.headers.cookie) {
                log.debug("websocket connection attempt without cookie!");
                //maybe start a session for this websocket here.
                return accept('No cookie transmitted.', false);
            }

            var cookies = data.headers.cookie,
                sess = session.get();

            //we need the session-config in order to get the data from connect
            var secret = sess.secret,
                store = sess.store,
                sessionKey = sess.key;

            if (cookies) {
                try {
                    data.cookies = cookie.parse(cookies);
                    if (secret) {
                        data.signedCookies = utils.parseSignedCookies(data.cookies, secret);
                        var obj = utils.parseJSONCookies(data.signedCookies);
                        //load the session before it's overwritten below
                        data.sessionID = data.signedCookies[sessionKey];
                        data.signedCookies = obj;
                    }
                    data.cookies = utils.parseJSONCookies(data.cookies);
                } catch (err) {
                    console.log("err", err);
                }
            }

            //further investigation needed here
            //https://github.com/senchalabs/connect/blob/master/lib/middleware/session/store.js
            //http://www.danielbaulig.de/socket-ioexpress/#comment-2705
            store.load(data.sessionID, function (err, session) {

                if (err) {
                    // if we cannot grab a session, turn down the connection
                    accept(err.message, false);
                    return;
                }

                if (!session) {
                    accept("Session not set", false);
                    return;
                }

                data.session = session;

                accept(null, true);
            });
        }
        else {
            //we accept and don't check for cookies on disabled session support
            data.session = null;
            return accept(null, true);
        }
    });

    function refreshSessionData(socket, callback) {

        //only refresh if session is defined
        if (!socket.handshake.session) {
            callback(null);
            return;
        }
        socket.handshake.session.reload(function (err) {

            if (err) {
                throw new Error(err);
            }

            // "touch" it (resetting maxAge and lastAccess)
            socket.handshake.session = socket.handshake.session.req.session;
            socket.handshake.session.touch();

            callback(socket.handshake.session);
        });
    }

    io.sockets.on("connection", function (socket) {

        var wsOptions = websocket.getSocketIOOptions();

        //load session & call onConnection to be used to handle connect/reconnect of sockets
        //should be handled with socket.io-middleware in the future
        refreshSessionData(socket, function onSessionDataRefreshed(session) {
            if (wsOptions.onConnection) {
                wsOptions.onConnection(socket, session || {});
            }
        });

        socket.on("create", function (url, data, cb) {
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "create", sessionData, url, data, cb);
            });
        });

        socket.on("read", function (url, data, cb) {
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "read", sessionData, url, data, cb);
            });
        });

        socket.on("update", function (url, data, cb) {
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "update", sessionData, url, data, cb);
            });
        });

        socket.on("destroy", function (url, data, cb) {
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "destroy", sessionData, url, data, cb);
            });
        });
    });
}

exports.init = init;