function normalizePath(path) {
    var i,
        currentDir,
        result = [];
    
    path = path.replace(/\/+/g, '/');
    path = path.split('/');
    for(i=0; i<path.length; i++) {
        currentDir = path[i];
        if(currentDir === '.') {
            continue;
        }
        if(currentDir === '..') {
            if(result.length === 0) {
                return undefined;
            }
            result.pop();
            continue;
        }
        result.push(currentDir);
    }
    
    return result.join('/');
}

module.exports = normalizePath;