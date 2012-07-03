//use strict
var async = require('async');

function applyMiddleware(collection, req, res, next) {
    var handler,
        i = 0;

    async.whilst(
        function whilst() {
            return i < collection.length;
        },
        function iterate(callback) {
            function onCallback(err) {
                if (err) {
                    next(err);
                } else {
                    callback();
                }
            }

            handler = collection[i];
            i++;
            handler(req, res, onCallback);
        },
        function() {
            next(null);
        }
    );
}

module.exports = applyMiddleware;