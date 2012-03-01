/**
 * <p><b>MODULE: paths2obj</b></p>
 *
 * <p>Transforms one-level-objects like arrays or objects with keys
 * like paths (e.g. object['aaa/bbb']) into a nested object.</p>
 *
 * @version 0.1.0
 */

var split = require('./split');



/**
 * <p>Transforms one-level-objects like arrays or objects with keys
 * like paths (e.g. object['aaa/bbb']) into a nested object.</p>
 *
 * <p>In case you pass an array, the last key will return "false".<br />
 * If you pass an object, the last key will return the original value
 * of the one-level-object.</p>
 *
 * <p>An error is thrown if the passed object is inconsistent.<br />
 * Example for an inconsistent object:<br />
 * {<br/>
 *      'aaa/bbb/ccc': 'some data',<br/>
 *      'aaa/bbb': 'some other data'<br/>
 * }<br/>
 * </p>
 *
 * <p>You can trim the paths using the substrOffset param. This might be handy
 * if you got absolute paths.</p>
 *
 * @param {Mixed} arg an array or object with the paths
 * @param {Integer} [substrOffset=0] paths will be trimmed path = path.substr(pathOffset);
 * @return {Object} the nested object
 * @throws Error
 */
function paths2obj(arg, substrOffset) {
    var result = {},
        pathPrefix = '',
        paths,
        isArr,
        path,
        pathArr,
        lastPiece,
        piece,
        currentDir,
        i,
        j;

    isArr = typeof arg === 'array' || arg instanceof Array;
    if (isArr) {
        paths = arg;
    } else {
        paths = Object.keys(arg);
    }
    for (i = 0; i < paths.length; i++) {
        path = paths[i];
        if(substrOffset && substrOffset > 0) {
            pathPrefix = path.substr(0, substrOffset);
            path = path.substr(substrOffset);
        }
        pathArr = split(path);
        lastPiece = pathArr.pop();
        currentDir = result;
        for (j = 0; j < pathArr.length; j++) {
            piece = pathArr[j];
            if (!currentDir[piece]) {
                currentDir[piece] = {};
            }
            currentDir = currentDir[piece];
        }
        if (isArr) {
            if(!currentDir[lastPiece]) {
                currentDir[lastPiece] = false;
            }
        } else {
            if(currentDir[lastPiece]) {
                throw new Error('Inconsistent one-level-object passed.\n'
                    + pathArr.join('/') + '/' + lastPiece + ' seems to be both a folder and a file.');
            }
            currentDir[lastPiece] = arg[pathPrefix + path];
        }
    }

    return result;
}

module.exports = paths2obj;