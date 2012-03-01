/**
 * <p><b>MODULE: remove</b></p>
 *
 * <p>Provides functions to remove single files or whole directories recursively.</p>
 *
 * @version 0.1.0
 */
var fs = require('fs'),
    collectErr = require('./collectErr');



/**
 * <p>Removes single files or whole directories recursively.</p>
 *
 * <p>All errors that occure are stored in an errors-array that is passed
 * to the final callback. If no error occured null is passed.</p>
 *
 * @param {String} abspath an absolute path to the item that should be removed.
 * @param {Function} callback after everything has been removed.
 */
function remove(abspath, callback) {
    var errors = [];

    function finished() {
        if (errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    }

    function recursiveRemove(abspath, callback) {
        var pending,
            itemRemoved;

        itemRemoved = function itemRemoved() {
            pending--;
            if (pending === 0) {
                fs.rmdir(abspath, callback);
            }
        }

        function onLstat(err, stat) {
            if (err) {
                errors.push(err);
                callback();
            } else {
                if (stat.isFile() || stat.isSymbolicLink()) {
                    fs.unlink(abspath, callback);
                } else if (stat.isDirectory()) {
                    fs.readdir(abspath, walkDir);
                }
            }
        }

        function walkDir(err, items) {
            var i,
                item;

            if (err) {
                errors.push(err);
                callback();
            } else if(items.length > 0) {
                pending = items.length;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    recursiveRemove(abspath + '/' + item, itemRemoved);
                }
            } else {
                fs.rmdir(abspath, callback);
            }
        }

        fs.lstat(abspath, onLstat);
    }

    finished = collectErr(finished, errors);
    recursiveRemove(abspath, finished);
}



/**
 * <p>Synchronous version of remove.</p>
 *
 * <p>This function throws no errors. If an error occures, it is stored in
 * an errors-array that is returned after execution. If no error occured, null
 * is returned</p>
 *
 * @param {String} abspath an absolute path to the item that should be removed.
 * @return {Mixed} errors can be null or an array carrying all error objects
 */
function removeSync(abspath) {
    var errors = [];

    function tryIt(fn) {
        try {
            fn();
        } catch(err) {
            errors.push(err);
        }
    }

    function recursiveRemove(abspath) {
        var stat,
            items,
            item,
            i;

        function lstat() {
            stat = fs.lstatSync(abspath);
        }

        function removeFile() {
            fs.unlinkSync(abspath);
        }

        function removeDir() {
            fs.rmdirSync(abspath);
        }

        function readDir() {
            items = fs.readdirSync(abspath);
        }

        tryIt(lstat);
        if (stat) {
            if (stat.isFile() || stat.isSymbolicLink()) {
                tryIt(removeFile);
            } else if (stat.isDirectory()) {
                tryIt(readDir);
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    recursiveRemove(abspath + '/' + item);
                }
                tryIt(removeDir);
            }
        }
    }

    recursiveRemove(abspath);

    if (errors.length > 0) {
        return errors;
    } else {
        return null;
    }
}

exports.remove = remove;
exports.removeSync = removeSync;