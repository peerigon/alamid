/**
 * <p><b>MODULE: write</b></p>
 *
 * <p>Provides some functions to write a bunch of files in different directories.</p>
 *
 * @version 0.1.0
 */

var makeDirs = require('./makeDir').makeDirs,
    makeDirsSync = require('./makeDir').makeDirsSync,
    fs = require('fs'),
    collectErr = require('./collectErr');
    async = require('async'),
    pathUtil = require('path');



/**
 * <p>Writes all file contents to the given directories.</p>
 *
 * <p>files is expected to be an object with keys like paths, e.g.:<br />
 * {<br />
 *      "folder1/folder2/file1.js": "file data",<br />
 *      "folder1/file2.txt": "some other file data",<br />
 * }<br />
 * All paths in the object start from the given base.</p>
 *
 * <p>If an error occurs it is stored in an array that is passed to the
 * callback on the end. If no error occured null is passed.</p>
 *
 * @param {String} base an absolute path where the file pathes start
 * @param {Object} files all files and their content.
 * @param {String} [encoding='utf8'] the encoding of the written files.
 * @param {Integer} [mode=0755] chmod for created folders.
 * @param {Function} callback.
 */
function write(base, files, encoding, mode, callback) {
    var errors = [],
        data,
        dirs,
        paths,
        i,
        dir;

    function finished() {
        if (errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    }

    function writeFiles(err) {
        if(err) {
            errors = err;
        }
        async.forEach(
            paths,
            function(path, callback) {
                var data = files[path];

                callback = collectErr(callback, errors);
                fs.writeFile(base + '/' + path, data, encoding, callback);
            },
            finished
        );
    }

    if (arguments.length === 3) {
        callback = encoding;
        encoding = undefined;
    } else if (arguments.length === 4) {
        callback = mode;
        mode = undefined;
    }
    if (typeof base !== 'string' && !(base instanceof String)) {
        throw new TypeError('base is not a string');
    }
    if (typeof files !== 'object' && !(files instanceof Object)) {
        throw new TypeError('files is not an object');
    }
    dirs = Object.keys(files);
    paths = Object.keys(files);
    for (i = 0; i < dirs.length; i++) {
        dir = dirs[i];
        dir = dir.replace(/\/?[^\/]*$/, ''); // delete the file name
        dirs[i] = dir;
    }
    makeDirs(dirs, base, mode, writeFiles);
}



/**
 * <p>Synchronous version of write.</p>
 *
 * <p>If errors occur, they are stored in an errors-array instead of being
 * thrown. After execution this array is returned. If no error occured null
 * will be returned.</p>
 *
 * @param {String} base all paths of the files object start from here.
 * @param {Object} files all files and their content.
 * @param {String} [encoding='utf8'] the encoding of the written files.
 * @param {Integer} [mode=0755] chmod for created folders.
 * @return {Mixed} errors can be the errors-array or null
 */
function writeSync(base, files, encoding, mode) {
    var errors,
        data,
        dirs,
        path,
        paths,
        i,
        dir;

    if (typeof base !== 'string' && !(base instanceof String)) {
        throw new TypeError('base is not a string');
    }
    if (typeof files !== 'object' && !(files instanceof Object)) {
        throw new TypeError('files is not an object');
    }
    dirs = Object.keys(files);
    paths = Object.keys(files);
    for (i = 0; i < dirs.length; i++) {
        dir = dirs[i];
        dir = dir.replace(/\/?[^\/]*$/, ''); // delete the file name
        dirs[i] = dir;
    }
    errors = makeDirsSync(dirs, base, mode);
    for (i = 0; i < paths.length; i++) {
        path = paths[i];
        data = files[path];
        try {
            fs.writeFileSync(base + '/' + path, data, encoding);
        } catch(err) {
            errors.push(err);
        }
    }

    if (errors) {
        return errors;
    } else {
        return null;
    }
}

exports.write = write;
exports.writeSync = writeSync;