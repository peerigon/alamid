var fs = require('fs'),
    async = require('async'),
    node2browser = require('node2browser'),
    makeDir = require('fshelpers').makeDir,
    pathUtil = require('path'),
    services = require('./services.js').services,
    validators = require('./validators.js').validators,
    paths = require('./paths.js'),
    settings = require('./settings'),
    modifyPathsInHTML = require('../tools/modifyPathsInHTML.js');

var templateRegExp;

function compilePage(url, callback) {
    var src = '',
        translatedSrc = '',
        knownFiles = [],
        viewFiles = [],
        pathModifier = paths.getPathModifier(
            ['noAlamidFiles', 'noServerFiles'],
            ['nodeModules']
        ),
        wrappedPathModifier = function wrappedPathModifier(path) { // the wrapped path modifier is necessary to
            if (knownFiles.indexOf(path) === -1) {                 // prevent additional calls of node2browser.translate
                return pathModifier(path);                         // from adding files to the source code that are
            } else {                                               // already known
                return false;
            }
        };

    function translateFilePath(filePath) {
        var fileName;

        filePath = filePath.replace(paths.patterns.classes(), '');
        filePath = filePath.split('/');
        fileName = filePath.pop();
        fileName = fileName.charAt(0).toLowerCase() +
            fileName.substr(1);
        filePath.push(fileName);
        filePath = filePath.join('/');

        return filePath;
    }

    function collectCorrespondingFiles(files, callback) {
        var filesToTranslate = [],
            filePath,
            fileToTranslate,
            i, l;

        for (i = 0, l = files.length; i < l; i++) {
            filePath = files[i];
            knownFiles.push(filePath);
            if (filePath.search(paths.appModels) !== -1) {
                filePath = filePath.replace(paths.appModels, '');
                filePath = translateFilePath(filePath);
                fileToTranslate = paths.appServices + filePath + '.client.js';
                if (services.client[fileToTranslate]) {
                    filesToTranslate.push(fileToTranslate);
                }
                fileToTranslate = paths.appValidators + filePath + '.client.js';
                if (validators.client[fileToTranslate]) {
                    filesToTranslate.push(fileToTranslate);
                }
            } else if (templateRegExp.test(filePath)) {    // IF TRUE: Its a view or page class that has a template file
                viewFiles.push(filePath);
            }
        }

        if (filesToTranslate.length > 0) {
            translateFiles(filesToTranslate, callback);
        } else {
            callback();
        }
    }

    function reduceKnownFiles(requiredFiles) {
        var reduced = [],
            item,
            i, l;

        for (i = 0, l = requiredFiles.length; i < l; i++) {
            item = requiredFiles[i];
            if (knownFiles.indexOf(item) === -1) {
                reduced.push(item);
            }
        }

        return reduced;
    }

    function translateFiles(files, callback) {
        node2browser.translate(
            files,
            wrappedPathModifier,
            function onFilesTranslated(err, translated, requiredFiles) {
                if (err) throw err;
                translatedSrc += translated;
                requiredFiles = reduceKnownFiles(requiredFiles);
                collectCorrespondingFiles(requiredFiles, callback);  // recursive call to check for recently added models
            }
        );
    }

    function setTemplates(templates, callback) {
        var i,
            template,
            pageURL,
            pathModifier = paths.getPathModifier(
                null,
                ['nodeModules']
            );

        for (i = 0; i < templates.length; i++) {
            template = templates[i];
            if (template) { // Its possible that there is no template, so we do nothing in this case
                template = template
                    .replace(/'/g, "\\'")   // escape single quotes
                    .replace(/(\r\n)|[\r\n]/g, '\\n');   // escape line breaks
                template = modifyPathsInHTML(template, settings.basePath);
                pageURL = viewFiles[i];
                pageURL = pathModifier(pageURL);
                src += "window.modules['node_modules/alamid/templates.js'].setTemplate('" +
                    pageURL + "', '"+ template + "');";
            }
        }
        src += translatedSrc;
        callback();
    }

    function loadTemplates(callback) {
        async.map(viewFiles, function loadTemplate(path, callback) {
            var fileName;

            fileName = pathUtil.basename(path);
            path = path.substr(0, path.length - fileName.length);
            fileName = fileName.charAt(0).toLowerCase() +
                fileName.substr(1, fileName.length - '.class.js'.length) +
                'html';
            path = path.substr(paths.appCompiledPath.length);
            path = paths.appHTML + path + fileName;
            fs.readFile(path, 'utf8', callback);
        }, function onTemplatesLoaded(err, templates) {
            if (err) throw err;
            setTemplates(templates, callback);
        });
    }

    function translateFilesAndLoadTemplates(firstFilesToTranslate, callback) {
        async.series([
            async.apply(translateFiles, firstFilesToTranslate),
            loadTemplates
        ], callback);
    }

    function prepareFileContentsAndDirectories(firstFilesToTranslate, targetPath, callback) {
        async.parallel([
            async.apply(translateFilesAndLoadTemplates, firstFilesToTranslate),
            async.apply(makeDir, pathUtil.dirname(targetPath))
        ], callback);
    }

    function main() {
        var pageName,
            pagePath,
            modulePath,
            targetPath,
            pathToClientService,
            firstFilesToTranslate = [];

        if (url.charAt(0) !== '/') {
            url = '/' + url;
        }
        console.log('compiling page ' + url);


        // Initialize path vars
        templateRegExp = new RegExp(paths.appCompiledPath + '\\/(views|pages)\\/.*\\.class\\.js$', 'i');
        pageName = pathUtil.basename(url);
        pagePath = pathUtil.dirname(url);
        modulePath = paths.appCompiledPath +
            pagePath + '/' +
            pageName.charAt(0).toUpperCase() +      // capitalize the pageName
            pageName.substr(1) + '.class.js';
        modulePath = pathUtil.normalize(modulePath);
        targetPath = paths.appCache + url + '.js';
        targetPath = pathUtil.normalize(targetPath);
        pathToClientService = paths.appServices + url + ".client.js";
        firstFilesToTranslate[0] = modulePath;
        if (services[pathToClientService]) { // IF TRUE: There is a client page service
            firstFilesToTranslate[1] = pathToClientService;
        }

        async.series([
            async.apply(prepareFileContentsAndDirectories, firstFilesToTranslate, targetPath),
            function writeFile(callback) {  // async.apply doesn't work here for some strange reason
                fs.writeFile(targetPath, src, 'utf8', callback);
            }
        ], function finished(err) {
            callback(err, src);
        });
    }

    main(); // init process
}

module.exports = compilePage;