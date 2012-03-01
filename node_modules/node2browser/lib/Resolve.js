var getLookUpPaths = require('./getLookUpPaths'),
    normalizePath = require('./normalizePath');

function Resolve(modules, modulePath) {
    var currentModuleDir = modulePath.replace(/\/[^\/]*\.(json|js)$/gi, '');

    return function resolve(path) {
        var lookUpPaths = getLookUpPaths(currentModuleDir, path),
            currentDir,
            currentDirWithExt,
            i;

        if(/\.node$/gi.test(path)) {
            throw new Error('resolve error: .node-files are not supported in the browser context.');
        }
        for(i=0; i<lookUpPaths.length; i++) {
            currentDir = lookUpPaths[i];
            if(/\.js$/gi.test(currentDir)) {
                if(modules.hasOwnProperty(currentDir)) {
                   return currentDir;
                }
            } else {
                currentDirWithExt = currentDir + '.js';
                if(modules.hasOwnProperty(currentDirWithExt)) {
                    return currentDirWithExt;
                }
                currentDirWithExt = normalizePath(
                    currentDir + '/package.json'
                );
                if(modules.hasOwnProperty(currentDirWithExt)) {
                    currentDirWithExt = modules[currentDirWithExt].main;
                    if(currentDirWithExt.charAt('.')) {
                        currentDirWithExt = normalizePath(
                            currentDir + '/' + currentDirWithExt
                        );
                    }
                    lookUpPaths.push(currentDirWithExt);
                    continue;
                }
                currentDirWithExt = currentDir + '/index.js';
                if(modules.hasOwnProperty(currentDirWithExt)) {
                    return currentDirWithExt;
                }
            }
        }

        throw new Error('Error in ' + modulePath + ':\nCannot find module ' + path);
    }
}

module.exports = Resolve;