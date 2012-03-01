/**
 * <p><b>MODULE: collectErr</b></p>
 * 
 * <p>Provides a callback wrapper that collects all errors.</p>
 * 
 * @version 0.1.0
 */

/**
 * <p>Wraps a callback so no error will be passed to it. This function can be useful if you're using
 * an utility module like async for asynchronous JavaScript.</p>
 * 
 * <p>The callback function will not be invoked with an error object, even if one occurs.
 * All errors will be pushed to the errors-array.</p>
 * 
 * <p>Example:<br />
 * var errors = []; // receives all error objects<br/>
 * wrappedCallback = collectErr(callback, errors);<br/>
 * fs.readFile('bla', 'utf8', wrappedCallback); // no error will be passed to wrappedCallback<br/>
 * 
 * @param {Function} callback the callback that is supposed to hide the error parameter.
 * @param {Array} errors contains all occured errors.
 * 
 * @returns {Function} the wrapped callback.
 */
function collectErr(callback, errors) {
    var callbackWrapper = function callbackWrapper(err) {
        var args = Array.prototype.slice.call(arguments, 0);

        if(err) {
            errors.push(err);
        }
        args[0] = undefined;
        callback.apply(null, args);
    };
    
    if (callback) {
        if (callback === callbackWrapper) {
            console.log('collectErr warning: collectErr is wrapping itself. Maybe you accidently applied it twice.');
        }
        return callbackWrapper;
    } else {
        return undefined;
    }
}

module.exports = collectErr;