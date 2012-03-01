/**
 * <p><b>MODULE: Finder</b></p>
 *
 * <p>Provides a class to walk through directories both sync and async.</p>
 *
 * @version 0.1.0
 */

var fs = require('fs'),
    pathUtil = require('path'),
    events = require('events');


/**
 * <p>A class to walk through directories both sync and async. Use the walk
 * method to start a walk. If you pass an encoding, additionally all files are
 * read. You can listen to the following descriptive events:</p>
 *
 * <ul>
 * <li>fileOrDir: When a file or directory has been found. The callback is called
 * with callback(path, stat, basePath, depth, encoding).</li>
 *
 * <li>file: When a file has been found. The callback is called with
 * callback(path, stat, basePath, depth, encoding).</li>
 *
 * <li>dir: When a directory has been found. The callback is called with
 * callback(path, stat, basePath, depth, encoding).</li>
 *
 * <li>end: When all directories and files have been found in the specified
 * directory. The callback is called with callback(basePath, collection).
 * The collection contains all files that have been found. If
 * you havent specified an encoding it's an array with all paths. If you did,
 * it's an object containing all file contents.
 * If you start different walks at the same time, you should check for the
 * basePath-param to distinguish the walks.</li>
 *
 * <li>fileRead: After a file has been read. The callback is called with
 * callback(path, data, basePath, depth, encoding).</li>
 *
 * <li>dirRead: After a dir has been read. The callback is called with
 * callback(path, files, basePath, depth, encoding).</li>
 *
 * <li>idle: A special event that is fired after the last walk has ended.
 * Additionally if you add a listener and there is no walk currently running,
 * the listener is called instantly.</li>
 *
 * <li>error: If an errors occurs the callback is called with
 * callback(err, path, basePath, depth, encoding).</li>
 * </ul>
 *
 * This class provides support for symbolic links. If a link is found, the real
 * path is walked after resolving.
 */
function Finder() {
    var self = this,
        eventEmitter = new events.EventEmitter(),
        operationsPending = {},
        collection = {},
        numOfWalks = 0;

    var onStat = function onStat(err, stat, basePath, path, depth, encoding) {
        var name;

        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);

            return;
        }
        if(stat.isSymbolicLink()) { // IF TRUE: the real path is resolved
            operationsPending[basePath]++;
            fs.realpath(path, function realpath(err, resolvedPath) {
                onRealPathResolved(err, resolvedPath, basePath, path, depth, encoding);
            });
            done(basePath);

            return;
        }
        name = pathUtil.basename(path); // get the name of the file / dir
        if(stat.isFile()) {
            if(self.fileFilter && self.fileFilter(name) === false) {    // IF TRUE: This file is filtered
                done(basePath);

                return;
            }
            self.emit('file', path, stat, basePath, depth, encoding);
            if(encoding) {  // IF TRUE: If the encoding is provided, we read the file
                operationsPending[basePath]++;
                fs.readFile(path, encoding, function readFile(err, data) {
                    onFileRead(err, data, basePath, path, depth, encoding);
                });
            } else {    // IF TRUE: we just collect the path to the file
                collect(basePath, path);
            }
        } else if(stat.isDirectory()) {
            if(self.dirFilter && self.dirFilter(name) === false) {  // IF TRUE: This dir is filtered
                done(basePath);

                return;
            }
            self.emit('dir', path, stat, basePath, depth, encoding);
            // If the depth is not 0, we step into this directory and check it out
            if(depth !== 0) {
                depth--;
                operationsPending[basePath]++;
                fs.readdir(path, function readDir(err, files) {
                    onDirRead(err, files, basePath, path, depth, encoding);
                });
            }
        }
        self.emit('fileOrDir', path, stat, basePath, depth, encoding);
        done(basePath);
    };

    var onFileRead = function onFileRead(err, data, basePath, path, depth, encoding) {
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);

            return;
        }
        collect(basePath, path, data);  // collecting the data that has been read
        self.emit('fileRead', path, data, basePath, depth, encoding);
        done(basePath);
    };

    var onDirRead = function onDirRead(err, files, basePath, path, depth, encoding) {
        var i,
            file;

        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);

            return;
        }
        self.emit('dirRead', path, files, basePath, depth, encoding);
        for (i = 0; i < files.length; i++) { // walking through the directory
            file = files[i];
            walk(basePath, path + '/' + file, depth, encoding); // recursive call to walk
        }
        done(basePath);
    };

    // Called after the real path of a symbolic link has been resolved
    var onRealPathResolved = function onRealPathResolved(err, resolvedPath, basePath, symlinkPath, depth, encoding) {
        if(err) {
            self.emit('error', err, symlinkPath, basePath, depth, encoding);
            done(basePath);

            return;
        }
        walk(basePath, resolvedPath, depth, encoding); // recursive call to walk
    };

    // This function collects all pathes to the files and additionally - if an
    // encoding has been specified - all data, that has been read from the files.
    // Thus collection[basePath] can be an array or an object.
    var collect = function collect(basePath, path, data) {
        if(collection[basePath] === undefined) {    // IF TRUE: initializing...
            collection[basePath] = data? {}: [];
        }
        if(data !== undefined) {
            collection[basePath][path] = data;
        } else {
            collection[basePath].push(path);
        }
    };

    var walk = function walk(basePath, path, depth, encoding) {
        operationsPending[basePath]++;
        fs.lstat(path, function lstat(err, stat) {
            onStat(err, stat, basePath, path, depth, encoding);
        });
    };

    // This function is called everytime after an asynchronous operation
    // has been finished.
    var done = function done(basePath) {
        operationsPending[basePath]--;
        if(operationsPending[basePath] === 0) {
            self.emit('end', basePath, collection[basePath]);
            self.stop(basePath);
        }
    };

    var isWalkAborted = function isWalkAborted(basePath) {
        return operationsPending[basePath] === undefined;
    };

    // Checks if the Finder is currently idling
    var checkIdle = function checkIdle() {
        if(numOfWalks === 0) {
            self.emit('idle');
        }
    };

    /**
     * <p>A function to filter unwanted files. If the function returns true,
     * the file is accepted. The function is called with the file name including
     * the file extension.</p>
     *
     * @property {Function} fileFilter
     */
    this.fileFilter = undefined;

    /**
     * <p>A function to filter unwanted directories. If the function returns true,
     * the directory is accepted. The function is called with the directory name.</p>
     *
     * @property {Function} dirFilter
     */
    this.dirFilter = undefined;

    // The following functions just provide access to the eventEmitter
    // functions. To keep all instances independent, util.inherit is not used
    // for the this class.
    this.emit = eventEmitter.emit.bind(eventEmitter);
    this.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    this.removeAllListeners = eventEmitter.removeAllListeners.bind(eventEmitter);
    this.setMaxListeners = eventEmitter.setMaxListeners.bind(eventEmitter);
    this.listeners = eventEmitter.listeners.bind(eventEmitter);
    // The on and once function is wrapped to check, if the event type equals idle.
    // In case of, the listener is called instantly.
    this.on = this.addListener = function on(type, func) {
        eventEmitter.on(type, func);

        if(type === 'idle') {
            checkIdle();
        }

        return this;
    };
    this.once = function once(type, func) {
        eventEmitter.once(type, func);

        if(type === 'idle') {
            checkIdle();
        }

        return this;
    };

    /**
     * <p>Returns the number of walks that are currently running.</p>
     *
     * @return {Integer} numOfWalks
     */
    this.getNumOfWalks = function getNumOfWalks() {
        return numOfWalks;
    };

    /**
     * <p>Starts the walk at the specified path. You should call this function
     * AFTER you have added all events. To start an recursive walk you can
     * pass Finder.RECURSIVE as depth or just omit it.</p>
     *
     * <p>In case you pass an encoding, all files are read.</p>
     *
     * @param {String} basePath an absolute path where the walk is supposed to start.
     * @param {Integer} [depth=-1] the depth to go. 0 means that only the current
     * directory is read.
     * @param {String} [encoding] encoding to read the files.
     */
    this.walk = function walkWrapper(basePath, depth, encoding) {
        if(depth === undefined) {
            depth = -1;
        }
        if(operationsPending[basePath] === undefined) {
            operationsPending[basePath] = 0;
            numOfWalks++;
        }
        walk(basePath, basePath, depth, encoding);
    };

    /**
     * <p>Convenient function that starts the walk after all currently running
     * walks have ended.</p>
     *
     * @param {String} path an absolute path where the walk is supposed to start.
     * @param {Integer} [depth=-1] the depth to go. 0 means that only the current
     * directory is read.
     * @param {String} [encoding] encoding to read the files.
     */
    this.walkWhenIdle = function walkWhenIdle(path, depth, encoding) {
        var args = arguments;

        self.once('idle', function() {
            self.walk.apply(self, args);
        });
    };

    /**
     * <p>Stops a specific walk or all walks if no path is passed.</p>
     *
     * <p>NOTE: This function does not fire the 'end'-event.</p>
     *
     * @param {String} basePath the path that has been passed to start the walk.
     */
    this.stop = function stop(basePath) {
        if(basePath) {
            delete operationsPending[basePath];
            delete collection[basePath];
            numOfWalks--;
        } else {
            operationsPending = {};
            collection = {};
            numOfWalks = 0;
        }
        checkIdle();
    };

    /**
     * <p>The synchronous version of walk().</p>
     *
     * @param {String} basePath an absolute path where the walk is supposed start.
     * @param {Integer} [depth=-1] the depth to go. 0 means that only the current
     * directory is read.
     * @param {String} [encoding] encoding to read the files
     */
    this.walkSync = function walkSync(basePath, depth, encoding) {

        // This function is used to emit every error as an event
        function doFileSystemAction(action, path) {
            try {
                return fs[action].call(fs, path, encoding);
            } catch(err) {
                self.emit('error', err, path, basePath, depth, encoding);
            }
        }

        function recursiveWalkSync(path, depth) {
            var stat,
                name,
                data,
                files,
                file,
                i;

            if(isWalkAborted(basePath)) {
                return;
            }
            operationsPending[basePath]++;
            stat = doFileSystemAction('lstatSync', path);
            if(stat.isSymbolicLink()) {
                done(basePath);

                return;
            }
            name = pathUtil.basename(path);
            if(stat.isFile()) {
                if(self.fileFilter === undefined
                    || self.fileFilter && self.fileFilter(name) === true) { // IF TRUE: file passed the file filter
                    self.emit('file', path, stat, basePath, depth, encoding);
                    self.emit('fileOrDir', path, stat, basePath, depth, encoding);
                    if(encoding) {
                        data = doFileSystemAction('readFileSync', path, encoding);
                        collect(basePath, path, data);
                        self.emit('fileRead', path, data);
                    } else {
                        collect(basePath, path);
                    }
                }
            } else if(stat.isDirectory()) {
                if(self.dirFilter === undefined
                    || self.dirFilter && self.dirFilter(name) === true) {   // IF TRUE: directory passed the dir filter
                    self.emit('dir', path, stat, basePath, depth, encoding);
                    self.emit('fileOrDir', path, stat, basePath, depth, encoding);
                    // If the depth is not 0, we step into this directory and check it out
                    if(depth !== 0) {
                        depth--;
                        files = doFileSystemAction('readdirSync', path);
                        self.emit('dirRead', path, files, basePath, depth, encoding);
                        for (i = 0; i < files.length; i++) {
                            file = files[i];
                            recursiveWalkSync(path + '/' + file, depth, encoding);
                        }
                    }

                }
            }
            done(basePath);
        }

        if(depth === undefined) {
            depth = -1;
        }
        if(operationsPending[basePath] === undefined) {
            operationsPending[basePath] = 0;
            numOfWalks++;
        }
        recursiveWalkSync(basePath, depth, encoding);
    };

    /**
     * <p>Removes all filters and listeners and stops all walks immediately.
     * The initial state is restored.</p>
     */
    this.reset = function reset() {
        self.fileFilter = undefined;
        self.dirFilter = undefined;
        self.removeAllListeners('error');
        self.removeAllListeners('fileOrDir');
        self.removeAllListeners('file');
        self.removeAllListeners('dir');
        self.removeAllListeners('fileRead');
        self.removeAllListeners('dirRead');
        self.removeAllListeners('end');
        self.removeAllListeners('idle');
        self.stop();
    };
}

/**
 * <p>A constant to pass as depth value. This value indicates a recursive walk.</p>
 *
 * @property {Integer} RECURSIVE
 */
Finder.RECURSIVE = -1;

module.exports = Finder;