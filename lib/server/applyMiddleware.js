"use strict";

var async = require('async');

function applyMiddleware(collection, req, res, next) {
    var handler,
        i = 0;

    //only apply if res in an event-emitter
    if(typeof(res.on) === "function") {
        res.on("end", function() {
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