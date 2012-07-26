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

function init(server) {

    //attach socketIO to connect-server
    var io = socketIO.listen(server);

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

            data.sessionStore = store;

            store.get(data.sessionID, function (err, session) {
                if (err || !session) {
                    console.log("err", err);
                    return accept('Error', false);
                }

                // create a session object, passing data as request and our
                // just acquired session data
                data.session = new Session(data, session);
                log.debug("Session loaded for ID: " + data.sessionID);
                return accept(null, true);
            });
        }
        else {
            //we accept and don't check for cookies on disabled session support
            data.session = null;
            return accept(null, true);
        }
    });

    function refreshSessionData(socket, callback) {
        socket.handshake.session.reload( function (err) {

            if(err) {
                throw new Error(err);
            }
            // "touch" it (resetting maxAge and lastAccess)
            socket.handshake.session.touch(); //.save()?
            callback(socket.handshake.session);
        });
    }

    io.sockets.on('connection', function (socket) {

        var hs = socket.handshake;

        log.info('A socket with sessionID ' + hs.sessionID + ' connected!');

        socket.on("create", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter("create", sessionData, url, data, cb);
            });
        });

        socket.on("read", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter("read", sessionData, url, data, cb);
            });
        });

        socket.on("update", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter("update", sessionData, url, data, cb);
            });
        });

        socket.on("delete", function(url, data, cb){
            refreshSessionData(socket, function onSessionDataRefreshed(sessionData) {
                websocketAdapter("delete", sessionData, url, data, cb);
            });
        });

        socket.on("SESSION", function(cb){
            refreshSessionData(socket, function(sessionData) {
                console.log("refresh session called back");
                cb(sessionData);
            });
        });
    });
}

exports.init = init;