/**
 * <p><b>MODULE: wrap</b></p>
 * 
 * <p>Provides a function to wrap asynchronous function with callbacks.</p>
 * 
 * @version 0.1.0
 */


/**
 * <p>Used to wrap asynchronous functions. When the callback is called,
 * all original arguments are passed in addition. This is useful for some fs-
 * functions when you dont want to use closures.</p>
 * 
 * <p>Example:<br/>
 * var lstat = wrap(fs.lstat);<br />
 * lstat('some/path.txt', callback);<br />
 * // The callback will be called with (err, stat, path);</p>
 * 
 * <p>Furthermore you can tell the function to ignore errors. So the callback
 * will always called with the first parameter undefined. If you pass an array
 * as second parameter, all errors are pushed.</p>
 * 
 * <p>NOTE: If an error occurs (and ignoreError is disabled) the first parameter
 * will always be the error object as you might expect. All initial parameters will
 * be on the end of the accepted parameter list.<br />
 * So if you called someFunc('arg1', 'arg2', callback) and expected
 * (err, arg3, arg4, arg1, arg2) you will receive (err, undefined, undefined,
 * 'arg1', 'arg2'). In order to avoid unwanted values your callback should always accept
 * ALL parameters. If you accepted only (err, arg3, arg4) you will end up
 * with arg3 == 'arg1' and arg4 == 'arg2'.</p>
 * 
 * @param {Function} fn the function to wrap.
 * @param {Mixed} ignoreError can be boolean flag or an array, that stores all errors.
 * @return {Function} wrapper the wrapped function
 */
function wrap(fn, ignoreError) {
    return function wrapper() {
        var callback = arguments[arguments.length - 1],
            initArgs = arguments;

        function callbackWrapper() {
            var cbArgs = [],
                i,
                offset;
            
            if(arguments[0]) {
                if(!ignoreError) {
                    cbArgs[0] = arguments[0];
                } else if(typeof ignoreError === 'array'
                    || ignoreError instanceof Array) {
                    ignoreError.push(arguments[0]);
                }
                offset = callback.length - initArgs.length;
                offset = Math.max(offset, 1);
                for (i = offset; i < callback.length; i++) {
                    cbArgs[i] = initArgs[i - offset];
                }
            } else {
                arguments = Array.prototype.slice.call(arguments, 0);
                cbArgs = arguments.concat(initArgs);
            }
            callback.apply(wrapper.caller, cbArgs);
        }
        
        if(typeof callback === 'function' || callback instanceof Function) {
            arguments[arguments.length - 1] = callbackWrapper;
            initArgs = Array.prototype.slice.call(arguments, 0, arguments.length-1);
        }
        fn.apply(undefined, arguments);
    };
}

module.exports = wrap;