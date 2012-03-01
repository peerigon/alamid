var pathUtil = require('path');

var modifiers,
    filters,
    patterns;

patterns = {    // functions are used, so the regular expression object is always new
    jsFiles: function jsFiles() { return /\.js$/gi; },
    nodeModules: function nodeModules() { return /.*node_modules\//gi; },
    classes: function classes() { return /\.class\.js$/gi; },
    alamidFiles: function alamidFiles() { return /node_modules\/alamid\/.*\.js/gi; },
    serverFiles: function serverFiles() { return /((\.server(\.class)?)|((\.class)?\.server))\.js$/gi; },
    clientFiles: function clientFiles() { return /((\.client(\.class)?)|((\.class)?\.client))\.js$/gi; }
};

modifiers = {
    normalize: pathUtil.normalize,
    nodeModules: function nodeModules(path) {
        if (path.charAt(0) === '.') {
            return path;
        } else {
            path = path.replace(patterns.nodeModules(), 'node_modules/');
            path = pathUtil.normalize(path);
            return path;
        }
    }
};

filters = {
    noClasses: function noClasses(path) {
        return patterns.classes().test(path) === false;
    },
    onlyClasses: function onlyClasses(path) {
        return patterns.classes().test(path);
    },
    noAlamidFiles: function noAlamidFiles(path) {
        return patterns.alamidFiles().test(path) === false;
    },
    noServerFiles: function noServerFiles(path) {
        return patterns.serverFiles().test(path) === false;
    },
    onlyServerFiles: function onlyServerFiles(path) {
        return patterns.serverFiles().test(path);
    },
    noClientFiles: function noClientFiles(path) {
        return patterns.clientFiles().test(path) === false;
    },
    onlyClientFiles: function onlyClientFiles(path) {
        return patterns.clientFiles().test(path);
    }
};

function getPathModifier(filtersToApply, modifiersToApply) {
    return function pathModifier(path) {
        var i,
            func;

        if (filtersToApply) {
            for (i = 0; i < filtersToApply.length; i++) {
                func = filters[filtersToApply[i]];
                if (func(path) === false) {
                    return false;
                }
            }
        }
        if (modifiersToApply) {
            for (i = 0; i < modifiersToApply.length; i++) {
                func = modifiers[modifiersToApply[i]];
                path = func(path);
            }
        }
        return path;
    };
}

function setAppPath(appPath) {
    exports.app = appPath;
    exports.appSrcPath = exports.app + '/src/node_modules';
    exports.appCompiledPath = exports.app + '/compiled/node_modules';
    exports.appAlamid = exports.app + '/compiled/node_modules/alamid';
    exports.appMisc = exports.app + '/compiled/node_modules/misc';
    exports.appModels = exports.app + '/compiled/node_modules/models';
    exports.appPages = exports.app + '/compiled/node_modules/pages';
    exports.appScripts = exports.app + '/compiled/node_modules/scripts';
    exports.appServices = exports.app + '/compiled/node_modules/services';
    exports.appValidators = exports.app + '/compiled/node_modules/validators';
    exports.appViews = exports.app + '/compiled/node_modules/views';
    exports.appConfig = exports.app + '/config.json';
    exports.appStatics = exports.app + '/statics';
    exports.appCache = exports.app + '/cache';
    exports.appHTML = exports.app + '/statics/html';
}

exports.alamid = pathUtil.resolve(__dirname, '../../');
exports.alamidSharedLib = exports.alamid + '/lib/shared';
exports.alamidCoreLib = exports.alamid + '/lib/core';

exports.app;
exports.appSrcPath;
exports.appCompiledPath;
exports.appAlamid;
exports.appMisc;
exports.appModels;
exports.appPages;
exports.appScripts;
exports.appServices;
exports.appValidators;
exports.appViews;
exports.appConfig;
exports.appStatics;
exports.appCache;
exports.appHTML;

exports.modifiers = modifiers;
exports.filters = filters;
exports.patterns = patterns;
exports.getPathModifier = getPathModifier;
exports.setAppPath = setAppPath;
