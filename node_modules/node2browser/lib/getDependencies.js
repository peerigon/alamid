var fs = require('fs'),
    async = require('async'),
    nodeResolve = require('./nodeResolve'),
    pathUtil = require('path');

var requireRegEx = /(^r|=r| r)equire\( *['"]([^'"]*)['"] *\)/g,
    commentRegEx = /\/\*(.|\n)*?\*\/|\/\/.*/g;

function getModuleDependencies(path, data, callback) {
    var matches,
        dependencies = [];

    function finished(err) {
        callback(err || null, dependencies);
    }

    path = pathUtil.dirname(path);
    data = data.replace(commentRegEx, '');  // strip out comments
    matches = data.match(requireRegEx);  // extracting all require statements
    if (matches) {
        async.forEach(
            matches,
            function eachMatch(match, callback) {
                match = match.replace(/(^r|=r| r)equire\( *['"]/, '') // removes leading require('
                    .replace(/['"] *\)/, ''); // removes trailing ')
                nodeResolve(path, match, function resolved(err, result) {
                    if (!err) {
                        dependencies.push(result);
                    }
                    callback(err);
                });
            },
            finished
        )
    } else {
        finished(null);
    }
}

function getPackageDependencies(path, data, callback) {
    var singleRequire;

    function done(err, result) {
        callback(err, [result]);
    }

    path = pathUtil.dirname(path);
    try {
        singleRequire = JSON.parse(data).main;
        nodeResolve(path, singleRequire, done);
    } catch (err) {
        callback(err);
    }
}

function getDependencies(path, data, callback) {
    if (/\/package\.json$/i.test(path)) {
        getPackageDependencies(path, data, callback);
    } else {
        getModuleDependencies(path, data, callback);
    }
}

module.exports = getDependencies;