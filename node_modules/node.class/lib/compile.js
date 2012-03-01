/**
 * <p><b>MODULE: compile</b></p>
 *
 * <p>Loads all *.class.js files from a directory, builds a Constructor-
 * function for this class and saves the result into compiled files.</p>
 *
 * @requires third-party: underscore http://documentcloud.github.com/underscore/
 * @requires module: build
 *
 * @version 0.1.0
 */



// Module variables
var vm = require('vm'),
    fs = require('fs'),
    _ = require('underscore'),
    Finder = require('fshelpers').Finder,
    pathUtil = require('path'),
    writeSync = require('fshelpers').writeSync,
    build = require('./build');

var srcFinder = new Finder(),
    currentSrcPath,
    currentCompilePath,
    currentIncludes,
    currentOptions,
    classesToLoad,
    loaded,
    modules,
    classes;



function sandboxRequire(path, requirePath) {
    var module,
        resolvedPath,
        pathArr,
        include;

    if (requirePath.charAt(0) === '.') {
        resolvedPath = pathUtil.resolve(pathUtil.dirname(path), requirePath);
    } else {
        pathArr = requirePath.split('/');
        include = currentIncludes[pathArr[0]];
        if (include) {
            pathArr.shift();
            resolvedPath = include + '/' + pathArr.join('/');
        } else {
            resolvedPath = currentSrcPath + '/' + requirePath;
        }
    }

    try {
        resolvedPath = require.resolve(resolvedPath);
    } catch(err) {
        module = require(requirePath);   // adds support for native modules
    }
    try {
        module = module || load(resolvedPath);
    } catch (err) {
        throw new Error('While compiling ' + resolvedPath + '\n' + err.message);
    }

    return module;
}



function load(path) {
    var src,
        sandbox = {     // Sandbox to execute the returned code from the build module
            "console": console,
            "require": function(requirePath) {
                return sandboxRequire(path, requirePath);
            }
        };

    if (!loaded[path]) {
        src = classesToLoad[path];
        vm.runInNewContext(src, sandbox);
        loaded[path] = sandbox;
    }

    return loaded[path];
}



/**
 * <p>Tries to load a given path.</p>
 *
 * <p>If the path is a folder the function is called again for all
 * items in this folder.</p>
 *
 * <p>If the path is a file, the contents of the file are loaded and scanned
 * for require()-occurences. Furthermore the module is added to the
 * modulesToPrepare-object. That way the .Prepare()-function can be called afterwards.</p>
 *
 * @private
 * @return {Undefined}
 */
function buildClasses() {
    var path,
        module,
        src;

    for (path in classesToLoad) {
        if (classesToLoad.hasOwnProperty(path)) {
            src = classesToLoad[path];
            module = load(path);
            if (!module.Class && !module.Constructor) {
                throw new Error('Cannot find "Class"- or "Constructor"-property of class module ' + path + '.');
            }
            if (!module.Constructor) {
                console.log('building ' + path);
                try {
                    src += '\n\n\n' + build(module, path);
                } catch(e) {
                    throw new Error('An error occured while building class ' + path + '.\n' + e);
                }
            }
            path = getCompiledPath(path);
            classes[path] = src;
        }
    }
}



function getCompiledPath(path) {
    var compiledPath,
        includeName,
        includePath;

    if (path.substr(0, currentSrcPath.length) === currentSrcPath) { // IF TRUE: the path is NOT from an include dir
        compiledPath = path.substr(currentSrcPath.length);
    } else {
        for (includeName in currentIncludes) {
            if (currentIncludes.hasOwnProperty(includeName)) {
                includePath = currentIncludes[includeName];
                if (path.substr(0, includePath.length) === includePath) {
                    compiledPath = includeName + '/' + path.substr(includePath.length + 1);
                    break;
                }
            }
        }
    }

    return compiledPath;
}



function collect(src, files) {
    var path,
        content;

    for (path in files) {
        if (files.hasOwnProperty(path)) {
            content = files[path];
            if (/\.class\.js$/gi.test(path)) {
                classesToLoad[path] = content;
            } else {
                path = getCompiledPath(path);
                modules[path] = content;
            }
        }
    }
}




function setDefaultOptions(options) {
    options = options || {};
    options.encoding = options.encoding || 'utf8';
    options.includes = options.includes || {};
    if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
    }
    if (typeof options.encoding !== 'string') {
        throw new TypeError('options.encoding must be a string');
    }
    if (typeof options.includes !== 'object') {
        throw new TypeError('options.includes must be an object');
    }

    return options;
}



/*function checkPath(path, type) {
    if(/node_modules\/?$/.test(path) === false) {
        throw new Error('Only ' + type + ' paths ending on "node_modules" are allowed.');
    }
}*/


/**
 * <p>Loads all classes within a given class path. You may load a single file or
 * whole folders. The path to it can be relative or absolute. In case of it's
 * relative, the module steps backwards from __dirname and appends the given
 * file path to every directory.</p>
 *
 * <p>Returns an object that contains all requirements of the loaded files. The
 * requirements are resolved by scanning the code for require statements.
 * The class paths are used as keys. The values are arrays with paths to the
 * required files. If there are no requirements, the value is an empty array.</p>
 *
 * <p>Note: All files loaded are interpreted as utf-8</p>
 *
 * @param {String} currentSrcPath path to a file or folder
 * @returns {Object} requirements an object containing all requirements for the loaded files
 */
function compile(srcPath, compilePath, compileOptions) {
    var includeName,
        includePath;

    compileOptions = setDefaultOptions(compileOptions);
    if (!srcPath || typeof srcPath !== 'string') {
        throw new TypeError('srcPath is not a string');
    }
    if (!compilePath || typeof compilePath !== 'string') {
        throw new TypeError('compilePath is not a string');
    }
    srcPath = srcPath.replace(/\/$/, '');   // deletes the last slash if present
    compilePath = compilePath.replace(/\/$/, '');   // deletes the last slash if present
    currentOptions = compileOptions;
    currentSrcPath = srcPath;
    currentCompilePath = compilePath;
    currentIncludes = compileOptions.includes;
    classes = {};
    modules = {};
    classesToLoad = {};
    loaded = {};

    console.log('reading files from ' + srcPath);
    srcFinder.walkSync(srcPath, Finder.RECURSIVE, compileOptions.encoding);

    for (includeName in currentIncludes) {
        if (currentIncludes.hasOwnProperty(includeName)) {
            includePath = currentIncludes[includeName];
            if (!includePath || typeof includePath !== 'string') {
                throw new TypeError('the include path is not a string');
            }
            srcFinder.walkSync(includePath, Finder.RECURSIVE, compileOptions.encoding);
        }
    }

    buildClasses();
    console.log('writing files to ' + compilePath);
    writeSync(compilePath, classes, compileOptions.encoding);
    writeSync(compilePath, modules, compileOptions.encoding);

    console.log('finished compiling');
}


srcFinder.on('end', collect);


module.exports = compile;