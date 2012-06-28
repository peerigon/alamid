var settings = require('./settings.js'),
    compile = require('node.class').compile,
    compilePage = require('./compilePage.js'),
    //node2browser = require('node2browser'),
    Finder = require('fshelpers').Finder,
    makeDirsSync = require('fshelpers').makeDirsSync,
    removeSync = require('fshelpers').removeSync,
    paths = require('./pathHelpers.js'),
    services = require('./services.js'),
    validators = require('./validators.js'),
    modifyPathsInHTML = require('./modifyPathsInHTML.js'),
    toSrc = require('toSrc'),
    async = require('async'),
    fs = require('fs');

var patternLeft = '<script type="text/javascript">',
    patternRight = '</script>',
    availableServices = {},
    availableValidators = {};




function writeClientInit(callback) {
    var moduleFinder = new Finder(),
        scriptsFinder = new Finder(),
        pathModifier = paths.getPathModifier(
            ['noServerFiles'],           // filters
            ['nodeModules'] // modifier
        ),
        modules = [],
        scripts = {},
        src = '';

    function writeInitHTML() {
        var initHTML = fs.readFileSync(paths.appHTML + '/init.html', 'utf8');

        initHTML = modifyPathsInHTML(initHTML, settings.basePath);

        //insertCode();
        fs.writeFileSync(paths.appCache + '/init.html', initHTML, 'utf8');
        fs.writeFileSync(paths.appCache + '/init.js', src, 'utf8');
        callback();
    }

    function writeScripts() {
        var scriptName;

        for (scriptName in scripts) {
            if (scripts.hasOwnProperty(scriptName)) {
                src += '\n\n\n' + scripts[scriptName];
            }
        }
    }

    function writeSettings() {
        var prefix = "window.modules['node_modules/alamid/settings.js']";

        src += prefix + ".env = '" + settings.env + "';";
        src += prefix + ".basePath = '" + settings.basePath + "';";
        src += prefix + ".isDev = " + settings.isDev + ";";
        src += prefix + ".isLive = " + settings.isLive + ";";
        src += prefix + ".isClient = true;";
        src += prefix + ".isServer = false;";
    }

    moduleFinder.fileFilter = paths.patterns.noServerFiles;
    moduleFinder.on('end', function onModuleFinderEnd(path, files) {
        modules = modules.concat(files);
    });
    moduleFinder.walkSync(paths.appAlamid);
    moduleFinder.walkSync(paths.appServices);    // all client services shall be available on startup
    moduleFinder.walkSync(paths.appMisc);

    scriptsFinder.on('end', function onScriptsFinderEnd(path, files) {
        scripts = files;
    });
    scriptsFinder.walkSync(paths.appScripts, Finder.RECURSIVE, 'utf8');

    /*
    node2browser.translate(
        modules,
        pathModifier,
        function onModulesTranslated(err, translatedSrc, files) {
            if (err) throw err;
            console.log('modules translated');
            src = translatedSrc;
            writeInitHTML();
        }
    );
    */

}



function initSettings() {
    var settingsModule = require(paths.appAlamid + '/settings.js');

    settingsModule.env = settings.env;
    settingsModule.isDev = settings.isDev;
    settingsModule.isLive = settings.isLive;
    settingsModule.isClient = settings.isClient;
    settingsModule.isServer = settings.isServer;
    settingsModule.port = settings.port;
}


function init(appPath, callback) {
    var err;

    function finished(err) {
        if (err) throw err;
        console.log('alamid initialized');
        callback();
    }

    callback = callback || function() {};
    paths.setAppPath(appPath);
    err = removeSync(paths.app + '/cache');
    if (err) {
        console.error("WARNING: An error occured while removing " + paths.app + "/cache");
        console.error(err);
    }
    err = removeSync(paths.app + '/compiled');
    if (err) {
        console.error("WARNING: An error occured while removing " + paths.app + "/compiled");
        console.error(err);
    }
    err = makeDirsSync([
        'compiled/node_modules/alamid',
        'cache/pages',
        'cache/views'
    ], paths.app);
    if (err) {
        console.error("WARNING: An error occured while creating essential folders");
        console.error(err);
    }
    createSettings();
    copyAlamidFiles();
    compileApp();
    initServices();
    initValidators();
    initSettings();
    async.parallel([
        writeClientInit,
        compilePages
    ], finished);
}

module.exports = init;