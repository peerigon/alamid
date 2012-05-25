var async = require('async');

function iterateHandlers(collection, req, res, next) {
    var handler,
        i = 0;

    async.whilst(
        function whilst() {
            return i < collection.length;
        },
        function iterate(callback) {
            function onCallback(err) {
                if (err) {
                    next();
                } else {
                    callback();
                }
            }

            handler = collection[i];
            i++;
            handler(req, res, onCallback);
        },
        next
    );
}

module.exports = iterateHandlers;