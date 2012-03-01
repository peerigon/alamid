var fs = require('fs'),
    _ = require('underscore'),
    Resolve = require('./Resolve'),
    Require = require('./Require'),
    normalizePath = require('./normalizePath'),
    initModule = require('./initModule'),
    getLookUpPaths = require('./getLookUpPaths');

var _setup;

_setup = require.resolve('../template/setup.ejs');
_setup = fs.readFileSync(_setup, 'utf8');
_setup = _.template(_setup);


function setup(translatedModules, firstModule) {
    return _setup({
        getLookUpPaths: getLookUpPaths.toString(),
        initModule: initModule.toString(),
        normalizePath: normalizePath.toString(),
        Require: Require.toString(),
        Resolve: Resolve.toString(),
        firstModule: firstModule,
        modules: translatedModules
    })
}

module.exports = setup;
