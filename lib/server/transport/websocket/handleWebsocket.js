"use strict";

var socketIO = require('socket.io'),
    connect = require("connect"),
    cookie = require("cookie"),
    Session = require('connect').middleware.session.Session;

var utils = connect.utils,
    sessionConfig = require("../../session"),
    config = require("../../../shared/config"),
    log = require("../../../shared/logger.js").get("server"),
    websocketAdapter = require("./websocketAdapter.js");


function init(io) {

    io.set('authorization', function (data, accept) {

        if(config.useSession === true) {
            log.debug("trying to get session for websocket connection...");

            if (!data.headers.cookie) {
                log.debug("websocket connection attempt without cookie!");
                //maybe start a session for this websocket here.
                return accept('No cookie transmitted.', false);
            }

            var cookies = data.headers.cookie;

            //we need the session-config in order to get the data from connect
            var secret = sessionConfig.secret,
                store = sessionConfig.store,
                sessionKey = sessionConfig.key;

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
                } else {

                    if(!session) {
                        accept("Session not set", false);
                        return;
                    }

                    data.session = session;

                    accept(null, true);
                }
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
        if(socket.handshake.session) {
            socket.handshake.session.reload( function (err) {

                if(err) {
                    throw new Error(err);
                }

                // "touch" it (resetting maxAge and lastAccess)
                socket.handshake.session = socket.handshake.session.req.session;
                socket.handshake.session.touch();

                callback(socket.handshake.session);
            });
        }else {
            callback(null);
        }

    }

    io.sockets.on('connection', function (socket) {

        socket.on("create", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "create", sessionData, url, data, cb);
            });
        });

        socket.on("read", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "read", sessionData, url, data, cb);
            });
        });

        socket.on("update", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "update", sessionData, url, data, cb);
            });
        });

        socket.on("destroy", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter(socket, "destroy", sessionData, url, data, cb);
            });
        });
    });
}

exports.init = init;