var normalizePath = require('./normalizePath');

function getLookUpPaths(currentModuleDir, path) {
    var currentDir,
        currentModuleDirArr,
        nodeModuleDirArr,
        lookUpPaths = [],
        i;

    function pushToLookUpPaths(path) {
        var currentDir = normalizePath(path);

        if(currentDir) {
            lookUpPaths.push(currentDir);
        }
    }

    if(path.charAt(0) === '.') {
        pushToLookUpPaths(currentModuleDir + '/' + path);
    } else if(path.charAt(0) === '/') {
        pushToLookUpPaths(path);
    } else {
        nodeModuleDirArr = currentModuleDir.match(/.*?node_modules/gi);
        if(nodeModuleDirArr) {
            for(i=nodeModuleDirArr.length-1; i>=0; i--) {
                currentDir = nodeModuleDirArr.join('') + '/' + path;
                pushToLookUpPaths(currentDir);
                nodeModuleDirArr.pop();
            }
        } else {      // documentation on http://nodejs.org/docs/v0.4.8/api/modules.html
                        // doesnt seem to be right. node is actually appending
                        // node_modules to every parent folder even if the script
                        // is inside a node_modules folder.
                        // Uncomment this when its fixed.
            currentModuleDirArr = currentModuleDir.split('/');
            for(i=currentModuleDirArr.length-1; i>=0; i--) {
                currentDir = currentModuleDirArr.join('/') + '/node_modules/' + path;
                pushToLookUpPaths(currentDir);
                currentModuleDirArr.pop();
            }
            if(currentModuleDir.charAt(0) !== '/') {
                currentDir = 'node_modules/' + path;
                pushToLookUpPaths(currentDir);
            }
        }
    }

    return lookUpPaths;
}

module.exports = getLookUpPaths;
