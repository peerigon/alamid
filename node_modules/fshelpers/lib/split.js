/**
 * <p><b>MODULE: split</b></p>
 * 
 * <p>Little helper function to split a path into pieces.</p>
 * 
 * @version 0.1.0
 */



/**
 * <p>Little helper function to split a path into pieces. Slashes at the beginning
 * or on the end will be removed.</p>
 * 
 * @param {String} path to split
 * @return {Array} splittedPath
 */
function split(path) {
    path = path.replace(/^\//, '');     // deletes the first slash
    path = path.replace(/\/$/, '');     // deletes the last slash
    return path.split('/');
}

module.exports = split;