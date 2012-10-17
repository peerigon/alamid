"use strict";

var async = require('async');

function applyMiddleware(collection, req, res, next) {
    var handler,
        i = 0,
        ended = false;

    //only apply if res in an event-emitter
    if(typeof(res.once) === "function") {
        res.once("end", function() {
            ended = true;
            res.removeAllListeners();
            next();
        });
    }


    async.whilst(
        function whilst() {
            return i < collection.length;
        },
        function iterate(callback) {
            function onCallback(err) {

                if(ended) {
                    throw new Error("alamid Cannot call next() after es.end() in '" + handler.name + "'");
                }

                if (err) {
                    next(err);
                }
                else {
                    callback();
                }
            }

            handler = collection[i];
            i++;
            handler(req, res, onCallback);
        },
        function onError(err) {
            if(err === undefined) {
                err = null;
            }

            next(err);
        }
    );
}

module.exports = applyMiddleware;