var settings = require('./settings.js'),
    compile = require('nodeclass').compile,
    compilePage = require('./compilePage.js'),
    node2browser = require('node2browser'),
    Finder = require('fshelpers').Finder,
    makeDirsSync = require('fshelpers').makeDirsSync,
    removeSync = require('fshelpers').removeSync,
    paths = require('./paths.js'),
    services = require('./services.js'),
    validators = require('./validators.js'),
    modifyPathsInHTML = require('../tools/modifyPathsInHTML.js'),
    toSrc = require('toSrc'),
    async = require('async'),
    fs = require('fs');

var patternLeft = '<script type="text/javascript">',
    patternRight = '</script>',
    availableServices = {},
    availableValidators = {};

function createSettings() {
    var newSettings = require(paths.appConfig);

    process.env.ENV_NODE = newSettings.env;
    settings.env = newSettings.env;
    settings.basePath = newSettings.basePath;
    settings.isDev = newSettings.env === 'development';
    settings.isLive = newSettings.env === 'production';
    settings.isClient = false;
    settings.isServer = true;
    settings.port = newSettings.port;
}

function compileApp() {
    var compileOptions = {
            includes: {
                alamid: paths.appAlamid
            }
        };

    compile(paths.appSrcPath, paths.appCompiledPath, compileOptions);
}

function copyAlamidFiles() {
    var fileFinder = new Finder();

    fileFinder
        .on('end', function onFileFinderEnd(path, files) {
            var file,
                filePath;

            for (filePath in files) {
                if (files.hasOwnProperty(filePath)) {
                    file = files[filePath];
                    filePath = filePath
                        .replace(paths.alamidSharedLib, paths.appAlamid);
                    fs.writeFileSync(filePath, file, 'utf8');
                }
            }
        })
        .walkSync(paths.alamidSharedLib, Finder.RECURSIVE, 'utf8');
}

function compilePages(callback) {
    var finder = new Finder();

    function doCompile(path, files) {
        async.forEach(files, function(item, callback) {
            var path = item.substring(
                paths.appHTML.length,
                item.length - '.html'.length
            );

            compilePage(path, callback);
        }, callback);
    }

    finder.on('end', doCompile);
    finder.walk(paths.appHTML + '/pages');
}

function prepareAvailableServices() {
    var path,
        pathModifier = paths.getPathModifier(
            null,           // filters
            ['nodeModules'] // modifier
        ),
        client = services.services.client,
        server = services.services.server,
        both = services.services.both;

    availableServices.client = {};
    for (path in client) { if (client.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableServices.client[path] = true;
    }}
    availableServices.server = {};
    for (path in server) { if (server.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableServices.server[path] = true;
    }}
    availableServices.both = {};
    for (path in both) { if (both.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableServices.both[path] = true;
    }}
}

function prepareAvailableValidators() {
    var path,
        pathModifier = paths.getPathModifier(
            null,           // filters
            ['nodeModules'] // modifier
        ),
        client = validators.validators.client,
        server = validators.validators.server,
        both = validators.validators.both;

    availableValidators.client = {};
    for (path in client) { if (client.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableValidators.client[path] = true;
    }}
    availableValidators.server = {};
    for (path in server) { if (server.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableValidators.server[path] = true;
    }}
    availableValidators.both = {};
    for (path in both) { if (both.hasOwnProperty(path)) {
        path = pathModifier(path);
        availableValidators.both[path] = true;
    }}
}


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
        writeScripts();
        src = node2browser.setup(src, 'node_modules/alamid/clientInit.js');
        writeSettings();
        prepareAvailableServices();
        writeAvailableServices();
        prepareAvailableValidators();
        writeAvailableValidators();
        //insertCode();
        fs.writeFileSync(paths.appCache + '/init.html', initHTML, 'utf8');
        fs.writeFileSync(paths.appCache + '/init.js', src, 'utf8');
        callback();
    }

    function insertCode() {
        var pointOfInsertion = initJS.indexOf(patternLeft + patternRight),      // returns the first occurence of the script closing tag
            leftPart,
            rightPart;

        if (pointOfInsertion === -1) {
            throw new Error('Cant find the pattern "' + patternLeft + patternRight + '" in the init.html')
        } else {
            leftPart = initJS.substr(0, pointOfInsertion);
            rightPart = initJS.substr(pointOfInsertion + patternLeft.length + patternRight.length);
            initJS = leftPart + patternLeft
                + src
                + patternRight + rightPart;
        }
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

    function writeAvailableServices() {
        var prefix = "window.modules['node_modules/alamid/services.js']";

        src += prefix + ".setServices(" + toSrc(availableServices, 2) + "); ";
    }

    function writeAvailableValidators() {
        var prefix = "window.modules['node_modules/alamid/validators.js']";

        src += prefix + ".setValidators(" + toSrc(availableValidators, 2) + "); ";
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
}

function initServices() {
    var servicesModule = require(paths.appAlamid + '/services.js');

    services.collect();
    prepareAvailableServices();
    servicesModule.setServices(availableServices);
}

function initValidators() {
    var validatorsModule = require(paths.appAlamid + '/validators.js');

    validators.collect();
    prepareAvailableValidators();
    validatorsModule.setValidators(availableValidators);
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