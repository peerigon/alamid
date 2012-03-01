var fs = require('fs'),
    async = require('async'),
    node2browser = require('node2browser'),
    makeDir = require('fshelpers').makeDir,
    pathUtil = require('path'),
    services = require('./services.js').services,
    validators = require('./validators.js').validators,
    paths = require('./paths.js');

var templateRegExp,
    classFileEnding = '.class.js';

function compilePage(url, callback) {
    var src = '',
        translatedSrc,
        pageName,
        pagePath,
        knownFiles = [],
        viewFiles = [],
        modulePath,
        targetPath,
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

    function collectServicesAndValidators(files, callback) {
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
                fileToTranslate = paths.appServices + filePath + '.js';
                if (services.both[fileToTranslate]) {
                    filesToTranslate.push(fileToTranslate);
                }
                fileToTranslate = paths.appValidators + filePath + '.client.js';
                if (validators.client[fileToTranslate]) {
                    filesToTranslate.push(fileToTranslate);
                }
                fileToTranslate = paths.appValidators + filePath + '.js';
                if (validators.both[fileToTranslate]) {
                    filesToTranslate.push(fileToTranslate);
                }
            } else if (templateRegExp.test(filePath)) {    // IF TRUE: Its a view or page class that has a template file
                viewFiles.push(filePath);
            }
        }

        if (filesToTranslate.length > 0) {
            translateServicesAndValidators(filesToTranslate, callback);
        } else {
            callback();
        }
    }

    function translateServicesAndValidators(files, callback) {
        node2browser.translate(
            files,
            wrappedPathModifier,
            function onServicesAndValidatorsTranslated(err, translated, requiredFiles) {
                if (err) throw err;
                translatedSrc += translated;
                requiredFiles = reduceKnownFiles(requiredFiles);
                collectServicesAndValidators(requiredFiles, callback);  // recursive call to check for recently added models
            }
        )
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

    function loadTemplates(callback) {
        async.map(viewFiles, function loadTemplate(path, callback) {
            var fileName;

            fileName = pathUtil.basename(path);
            path = path.substr(0, path.length - fileName.length);
            fileName = fileName.charAt(0).toLowerCase()
                + fileName.substr(1, fileName.length - '.class.js'.length)
                + 'html';
            path = path.substr(paths.appCompiledPath.length);
            path = paths.appHTML + path + fileName;
            fs.readFile(path, 'utf8', callback);
        }, function onTemplatesLoaded(err, templates) {
            if (err) throw err;
            setTemplates(templates, callback);
        });
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
                    .replace(/(\r\n)|[\r\n]/g, '\\n')   // escape line breaks
                pageURL = viewFiles[i];
                pageURL = pathModifier(pageURL);
                src += "window.modules['node_modules/alamid/templates.js'].setTemplate('"
                    + pageURL + "', '"+ template + "');";
            }
        }
        src += translatedSrc;
        callback();
    }

    if (url.charAt(0) !== '/') {
        url = '/' + url;
    }
    templateRegExp = new RegExp(paths.appCompiledPath + '\\/(views|pages)\\/.*\\.class\\.js$', 'i');
    console.log('compiling page ' + url);
    pageName = pathUtil.basename(url);
    pagePath = pathUtil.dirname(url);
    modulePath = paths.appCompiledPath
        + pagePath + '/'
        + pageName.charAt(0).toUpperCase()      // capitalize the pageName
        + pageName.substr(1) + '.class.js';
    modulePath = pathUtil.normalize(modulePath);
    targetPath = paths.appCache + url + '.js';
    targetPath = pathUtil.normalize(targetPath);

    async.waterfall([
        async.apply(node2browser.translate, modulePath, pathModifier),
        function collectRequiredFiles(translated, files, callback) {
            translatedSrc = translated;
            async.parallel([
                async.apply(collectServicesAndValidators, files),
                async.apply(makeDir, pathUtil.dirname(targetPath))
            ], function() {     // we dont want to pass-through the results-array
                loadTemplates(callback);
            });
        },
        function writeFile(callback) {
            fs.writeFile(targetPath, src, 'utf8', callback);
        }
    ], function finished(err) {
        callback(err, src);
    });
}

module.exports = compilePage;